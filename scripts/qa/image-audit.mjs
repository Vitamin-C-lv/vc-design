#!/usr/bin/env node
/**
 * 全站视觉审核：图片异常裁切 / 被祖先裁剪 / 破图 / 零尺寸 / 版面空白。
 *
 * 用法：
 *   BASE=http://127.0.0.1:3200 node scripts/qa/image-audit.mjs
 *   BASE=... ROUTES=/work/guge VIEWPORTS=1600x1000,390x844 node scripts/qa/image-audit.mjs
 *
 * 产出：_qa-output/image-audit/<slug>-<width>.json（每路由每视口一份）
 *       _qa-output/image-audit/summary.json（全部发现，按严重度排序）
 *
 * ── 判据（这是本脚本存在的理由，别改成"只打印表格"）────────────────────
 *
 * ① BROKEN      可见 <img> 的 naturalWidth===0 / video error —— 破图。
 * ② CROPPED     object-fit:cover 下的**可见比例**
 *                  f = min(boxAspect/imgAspect, imgAspect/boxAspect)
 *                f=1 表示整图都在；f=0.5 表示只看得到一半。
 *                f<0.85 → 重度裁切（warn）；f<0.70 → 严重裁切（error）。
 *                例外：`data-audit-crop` 属性显式声明的装饰性裁切不报。
 * ③ CLIPPED     祖先里任何 overflow≠visible 或 clip-path≠none 的盒子
 *                会把后代裁掉。计算 img 矩形与所有裁剪祖先矩形的交集，
 *                visibleFrac = 交集面积 / img 面积；<0.995 → error。
 *                （2026-09-19 的 `Reveal masked` 裁 `bleed` 就是这一类，
 *                  纯看 computed style 发现不了。）
 * ④ DEGENERATE  渲染宽或高 < 24px、宽高比与 natural 比偏离 >15% 且非 cover。
 * ⑤ EMPTYSPACE  区块高度 > 1.5 屏，但其中可见内容子元素的总高 < 45%
 *                → 版面出现大片空白。
 * ⑥ OVERFLOW    文档横向溢出（scrollWidth > clientWidth + 1）。
 *
 * 退出码：有 error → 1；只有 warn → 0。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE ?? 'http://127.0.0.1:3200';
const OUT = path.join(ROOT, '_qa-output/image-audit');
const TAG = process.env.AUDIT_TAG ?? '';

const ROUTES = (process.env.ROUTES ?? '/,/work,/work/guge,/work/lihuahua,/work/guanchao,/work/qinghua-zaojing,/lab')
  .split(',').map((s) => s.trim()).filter(Boolean);

const VIEWPORTS = (process.env.VIEWPORTS ?? '1600x1000,2560x1451,1024x1366,390x844')
  .split(',').map((s) => {
    const [w, h] = s.trim().split('x').map(Number);
    return { w, h, label: `${w}x${h}` };
  });

const CROP_WARN = Number(process.env.CROP_WARN ?? 0.85);
const CROP_ERROR = Number(process.env.CROP_ERROR ?? 0.7);

/* ── 浏览器内：采集一页的全部媒体几何 ───────────────────────────────── */
const COLLECT = () => {
  const px = (n) => Math.round(n * 100) / 100;

  const clipBoxOf = (el) => {
    // 该元素会不会裁剪后代？（返回矩形，或 null）
    const s = getComputedStyle(el);
    const clips =
      ['hidden', 'clip', 'auto', 'scroll'].includes(s.overflowX) ||
      ['hidden', 'clip', 'auto', 'scroll'].includes(s.overflowY) ||
      (s.clipPath && s.clipPath !== 'none');
    if (!clips) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, why: s.clipPath !== 'none' ? `clip-path:${s.clipPath}` : `overflow:${s.overflowX}/${s.overflowY}` };
  };

  const clipChain = (el) => {
    const out = [];
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const c = clipBoxOf(p);
      if (c) out.push(c);
      p = p.parentElement;
    }
    return out;
  };

  const intersect = (a, b) => ({
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
    r: Math.min(a.x + a.w, b.x + b.w),
    b: Math.min(a.y + a.h, b.y + b.h),
  });

  const records = [];

  document.querySelectorAll('img[data-vc-media], video').forEach((el) => {
    const isVideo = el.tagName === 'VIDEO';
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return; // 根本不渲染的不报

    const s = getComputedStyle(el);
    const nw = isVideo ? el.videoWidth : el.naturalWidth;
    const nh = isVideo ? el.videoHeight : el.naturalHeight;
    const nwAttr = Number(el.getAttribute('width')) || 0;
    const nhAttr = Number(el.getAttribute('height')) || 0;
    const declared = nw > 0 ? nw / nh : (nwAttr > 0 && nhAttr > 0 ? nwAttr / nhAttr : null);

    const boxAspect = r.width / r.height;
    const fit = s.objectFit;

    let cropFrac = 1;
    let cropNote = 'contain/其它 —— 不裁';
    if (fit === 'cover' && declared) {
      cropFrac = Math.min(boxAspect / declared, declared / boxAspect);
      cropNote = `cover: box ${boxAspect.toFixed(3)} vs img ${declared.toFixed(3)}`;
    }

    // 祖先裁剪
    let visible = r;
    let clipWhy = null;
    for (const c of clipChain(el)) {
      const n = intersect(visible, c);
      if (n.r <= n.x || n.b <= n.y) { visible = { x: 0, y: 0, r: 0, b: 0 }; clipWhy = c.why; break; }
      if (n.r - n.x < visible.r - visible.x - 0.5 || n.b - n.y < visible.b - visible.y - 0.5) clipWhy = clipWhy ?? c.why;
      visible = n;
    }
    const visArea = Math.max(0, visible.r - visible.x) * Math.max(0, visible.b - visible.y);
    const clipFrac = r.width * r.height > 0 ? visArea / (r.width * r.height) : 1;

    const audited = el.closest('[data-audit-crop]') !== null;

    records.push({
      kind: isVideo ? 'video' : 'img',
      src: (isVideo ? el.currentSrc || el.querySelector('source')?.src : el.currentSrc || el.src) || '',
      alt: el.getAttribute('alt') ?? '',
      rect: { x: px(r.left + scrollX), y: px(r.top + scrollY), w: px(r.width), h: px(r.height) },
      vpTop: px(r.top),
      natural: nw > 0 ? [nw, nh] : null,
      loaded: isVideo ? el.readyState > 0 : el.dataset.loaded === 'true',
      fit,
      objectPosition: s.objectPosition,
      transform: s.transform,
      opacity: Number(s.opacity),
      boxAspect: px(boxAspect),
      imgAspect: declared ? px(declared) : null,
      cropFrac: px(cropFrac),
      cropNote,
      clipFrac: px(clipFrac),
      clipWhy,
      declaredCrop: audited,
      // 闭合的 <details> 不会渲染内容，浏览器也就不该下载里面的懒加载图。
      inClosedDetails: !!el.closest('details:not([open])'),
    });
  });

  // 空白检测：每个直接的 section / [data-piece] 容器
  const blocks = [];
  document.querySelectorAll('main > *, main section, [data-chapter], [data-piece]').forEach((sec) => {
    const r = sec.getBoundingClientRect();
    if (r.height < innerHeight * 1.5) return;
    let contentH = 0;
    [...sec.children].forEach((c) => {
      const cr = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (cr.width === 0 && cr.height === 0) return;
      contentH += cr.height;
    });
    const ratio = contentH / r.height;
    if (ratio < 0.45) {
      blocks.push({
        id: sec.id || sec.dataset.chapter || sec.dataset.piece || sec.className.toString().slice(0, 48),
        y: px(r.top + scrollY), h: px(r.height), screens: px(r.height / innerHeight),
        contentRatio: px(ratio),
      });
    }
  });

  /* ── 新增探测：行高不齐的死白 / 过密 / 中文孤字行 ─────────────── */

  // RAGGED：同一 grid 里同排的媒体项，高的和矮的差多少 → 矮的那张下面就是死白
  const ragged = [];
  document.querySelectorAll('.grid, [class*="grid"]').forEach((g) => {
    const kids = [...g.children].filter((k) => k.querySelector(':scope img[data-vc-media], :scope video'));
    if (kids.length < 2) return;
    const items = kids.map((k) => { const r = k.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, h: r.height, label: k.querySelector('img,video')?.currentSrc?.split('/').pop() || k.className.toString().slice(0, 30) }; });
    // 按 top 分排（容差 6px）
    const rows = [];
    items.forEach((it) => {
      const row = rows.find((r) => Math.abs(r.top - it.top) < 6);
      if (row) { row.items.push(it); row.top = Math.min(row.top, it.top); }
      else rows.push({ top: it.top, items: [it] });
    });
    rows.forEach((row) => {
      if (row.items.length < 2) return;
      const max = Math.max(...row.items.map((i) => i.bottom));
      const min = Math.min(...row.items.map((i) => i.bottom));
      const gap = max - min;
      if (gap > 180) {
        ragged.push({
          gap: Math.round(gap),
          screens: +(gap / innerHeight).toFixed(2),
          row: row.items.map((i) => ({ src: i.label, h: Math.round(i.h), voidBelow: Math.round(max - i.bottom) })).sort((a, b) => b.voidBelow - a.voidBelow),
        });
      }
    });
  });

  // CROWDED：相邻兄弟块之间几乎没缝（都含文字）
  const hasText = (el) => (el.textContent || '').trim().length > 8;
  const crowded = [];
  document.querySelectorAll('main section, main > div').forEach((sec) => {
    const kids = [...sec.children].filter((k) => { const r = k.getBoundingClientRect(); return r.height > 0 && getComputedStyle(k).display !== 'none'; });
    for (let i = 0; i < kids.length - 1; i++) {
      const a = kids[i].getBoundingClientRect(), b = kids[i + 1].getBoundingClientRect();
      const gap = b.top - a.bottom;
      // 只报「两块真正的段落贴在一起」。章节索引/目录那种一行一个链接的列表
      // （每行就是一行字）缝本来就是 0，是设计不是挤压，必须排除。
      const inList = (el) => !!el.closest('nav, ul, ol, [role="list"], [data-chapter-index]');
      /*
       * The two elements must *be* paragraphs, not containers of them.
       *
       * Two earlier attempts at this filter both failed on the same reality: a
       * case-study chapter is a wrapper `div` whose `textContent` is the entire
       * chapter, so "does it contain a long paragraph" and "does it have few
       * children" are both true for it. Every chapter boundary on every case
       * page came back as "两块文字贴死" — 60 findings, all of them the seam
       * between two Bands, which `Band` itself owns and which is meant to be 0.
       *
       * Comparing only text-level elements removes the wrapper class of false
       * positive outright, while still catching the case this detector exists
       * for: a heading butted straight against its paragraph.
       */
      const TEXT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'FIGCAPTION', 'LI', 'DD', 'DT']);
      const isTextBlock = (el) => TEXT_TAGS.has(el.tagName) && (el.textContent || '').trim().length > 40;
      if (gap >= 0 && gap < 6 && hasText(kids[i]) && hasText(kids[i + 1]) &&
          isTextBlock(kids[i]) && isTextBlock(kids[i + 1]) &&
          !inList(kids[i]) && !inList(kids[i + 1])) {
        crowded.push({ gap: Math.round(gap), a: (kids[i].textContent || '').trim().slice(0, 24), b: (kids[i + 1].textContent || '').trim().slice(0, 24) });
      }
    }
  });

  // OVERFLOWTEXT：文字被容器裁掉
  const clipped = [];
  document.querySelectorAll('p, h1, h2, h3, h4, li, blockquote, figcaption').forEach((el) => {
    if (!(el.textContent || '').trim()) return;
    const s2 = getComputedStyle(el);
    // 行内元素（span 之类）的 clientWidth 恒为 0，拿它算溢出必然假报。
    if (s2.display.startsWith('inline') && s2.display !== 'inline-block') return;
    // 内容盒被 padding 挤成 0 宽时 clientWidth 也是 0，`scrollWidth - clientWidth`
    // 会凭空造出一个"溢出"。overflow 可见时字只是画在盒外，并没有被裁。
    if (el.clientWidth === 0 && s2.overflowX === 'visible') return;
    const over = el.scrollHeight - el.clientHeight;
    const overX = el.scrollWidth - el.clientWidth;
    if ((over > 2 && s2.overflow !== 'visible') || (overX > 2 && s2.overflowX !== 'visible')) {
      clipped.push({ text: (el.textContent || '').trim().slice(0, 26), overY: over, overX, overflow: s2.overflow, w: Math.round(el.getBoundingClientRect().width) });
    }
  });

  // ORPHAN：中文段落的最后一行只剩 1–2 个字
  const orphans = [];
  document.querySelectorAll('p, h2, h3, figcaption').forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t.length < 14 || el.children.length > 0) return;
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim().length > 10);
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (rects.length < 2) return;
    const lastTop = Math.max(...rects.map((r) => r.top));
    const lastLine = rects.filter((r) => Math.abs(r.top - lastTop) < 3);
    const lastW = lastLine.reduce((a, r) => a + r.width, 0);
    const lineW = Math.max(...rects.map((r) => r.width));
    const frac = lastW / lineW;
    if (frac < 0.12) orphans.push({ text: t.slice(0, 30), lastLineFrac: +(frac * 100).toFixed(0) });
  });

  return {
    pageHeight: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    media: records,
    sparse: blocks,
    ragged,
    crowded,
    clipped,
    orphans,
  };
};

/* ── 滚动全页，把懒加载与揭示都逼出来 ──────────────────────────────── */
async function settleAndScroll(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  // 等开场片头结束（它会把首屏锁住）
  await page.waitForFunction(() => document.documentElement.dataset.intro !== 'playing', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(110);
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  /*
   * Horizontal scrollers hold items the vertical pass never intersects, so their
   * images stay lazy and show up as BROKEN. Scroll each one to its end and back
   * — that is where the real reading happens, so the audit should see it.
   */
  await page.evaluate(async () => {
    const boxes = [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return el.scrollWidth > el.clientWidth + 8 && ['auto', 'scroll'].includes(s.overflowX);
    });
    for (const box of boxes) {
      const step = Math.max(200, box.clientWidth * 0.8);
      for (let x = 0; x <= box.scrollWidth; x += step) {
        box.scrollLeft = x;
        await new Promise((r) => setTimeout(r, 90));
      }
      box.scrollLeft = 0;
    }
  });
  await page.waitForTimeout(1600);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
}

/* ── 判定 ─────────────────────────────────────────────────────────── */
function judge(rec) {
  const f = [];
  /*
   * An image the visitor cannot see cannot look broken.
   *
   * Three classes kept coming back as false errors:
   *   · breakpoint variants — the `<VcImage>` a phone uses lives inside
   *     `lg:hidden`, so at 1600 it is `display: none` and was never fetched;
   *   · lazy images inside a closed `<details>` — a browser correctly declines
   *     to download those until the disclosure opens (verified: opening them
   *     produced zero failed loads and zero 4xx);
   *   · live-surface fallbacks — 青花造境's particle capture sits behind a
   *     running `<canvas>`, 观潮's behind `/guanchao-live`. They fade to
   *     `opacity: 0` on purpose, so a "62% cropped" report is meaningless.
   *
   * All three are correct behaviour, not defects. Reporting them trains the
   * reader to ignore the audit, which is worse than not reporting at all.
   */
  const unseen = rec.rect.w < 2 || rec.rect.h < 2 || rec.inClosedDetails || rec.opacity === 0;
  if (!rec.loaded || !rec.natural) {
    if (!unseen) f.push({ sev: 'error', code: 'BROKEN', msg: `${rec.kind} 未加载：${rec.src.split('/').slice(-2).join('/')}` });
    return f;
  }
  if (unseen) {
    if (rec.opacity === 0 && !rec.inClosedDetails && rec.rect.w >= 2 && rec.rect.h >= 2) {
      f.push({ sev: 'info', code: 'HIDDEN', msg: 'opacity:0 —— 被实况表面盖住的兜底图，或揭示动画未触发' });
    }
    return f;
  }
  if (!rec.declaredCrop && rec.fit === 'cover' && rec.cropFrac < CROP_ERROR) {
    f.push({ sev: 'error', code: 'CROPPED', msg: `只显示 ${(rec.cropFrac * 100).toFixed(1)}% 的图（${rec.cropNote}）` });
  } else if (!rec.declaredCrop && rec.fit === 'cover' && rec.cropFrac < CROP_WARN) {
    f.push({ sev: 'warn', code: 'CROPPED', msg: `只显示 ${(rec.cropFrac * 100).toFixed(1)}% 的图（${rec.cropNote}）` });
  }
  if (rec.clipFrac < 0.995) {
    f.push({ sev: 'error', code: 'CLIPPED', msg: `被祖先裁掉 ${((1 - rec.clipFrac) * 100).toFixed(1)}%（${rec.clipWhy}）` });
  }
  if (rec.rect.w < 24 || rec.rect.h < 24) {
    f.push({ sev: 'warn', code: 'DEGENERATE', msg: `渲染尺寸 ${rec.rect.w}×${rec.rect.h}` });
  }
  return f;
}

/* ── 主流程 ───────────────────────────────────────────────────────── */
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const all = [];
const only = process.env.ONLY_ROUTE_FILTER;

for (const route of ROUTES) {
  if (only && !route.includes(only)) continue;
  for (const vp of VIEWPORTS) {
    const slug = (route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_')) + `-${vp.w}`;
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    const failed = [];
    page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(BASE, '')}`); });

    let data = null;
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await settleAndScroll(page);
      data = await page.evaluate(COLLECT);
    } catch (e) {
      data = { error: String(e).slice(0, 300), media: [], sparse: [], pageHeight: 0, overflowX: 0 };
    }

    const findings = [];
    for (const rec of data.media ?? []) {
      for (const f of judge(rec)) {
        findings.push({ route, vp: vp.label, code: f.code, sev: f.sev, msg: f.msg, src: rec.src.split('/').pop(), rect: rec.rect, cropFrac: rec.cropFrac, boxAspect: rec.boxAspect, imgAspect: rec.imgAspect, fit: rec.fit, objectPosition: rec.objectPosition });
      }
    }
    for (const r of data.ragged ?? []) {
      findings.push({ route, vp: vp.label, code: 'RAGGEDROW', sev: 'warn', msg: `同一排里矮的那张下面空 ${r.gap}px（${r.screens} 屏）`, row: r.row });
    }
    for (const c of data.crowded ?? []) {
      findings.push({ route, vp: vp.label, code: 'CROWDED', sev: 'warn', msg: `两块文字几乎贴在一起（缝 ${c.gap}px）："${c.a}" / "${c.b}"` });
    }
    for (const c of data.clipped ?? []) {
      findings.push({ route, vp: vp.label, code: 'TEXTCLIP', sev: 'error', msg: `文字被裁：Y+${c.overY} X+${c.overX} "${c.text}"` });
    }
    for (const o of data.orphans ?? []) {
      findings.push({ route, vp: vp.label, code: 'ORPHAN', sev: 'warn', msg: `中文孤字行（末行只占 ${o.lastLineFrac}% 宽）："${o.text}"` });
    }
    for (const b of data.sparse ?? []) {
      findings.push({ route, vp: vp.label, code: 'EMPTYSPACE', sev: 'warn', msg: `${b.screens.toFixed(1)} 屏的区块里内容只占 ${(b.contentRatio * 100).toFixed(0)}%`, block: b });
    }
    if ((data.overflowX ?? 0) > 1) findings.push({ route, vp: vp.label, code: 'OVERFLOW', sev: 'error', msg: `横向溢出 ${data.overflowX}px` });
    for (const u of failed) findings.push({ route, vp: vp.label, code: 'HTTP', sev: 'error', msg: u });
    for (const e of pageErrors) findings.push({ route, vp: vp.label, code: 'JSERROR', sev: 'error', msg: e.slice(0, 160) });

    const row = {
      route, vp: vp.label, pageHeight: data.pageHeight, screens: data.pageHeight ? +(data.pageHeight / vp.h).toFixed(1) : 0,
      mediaCount: (data.media ?? []).length, findings,
    };
    all.push(row);
    fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify({ ...row, media: data.media, sparse: data.sparse }, null, 1));

    const errs = findings.filter((f) => f.sev === 'error').length;
    const warns = findings.filter((f) => f.sev === 'warn').length;
    console.log(`${route.padEnd(24)} ${vp.label.padEnd(9)} 高 ${String(row.screens).padStart(5)} 屏  媒体 ${String(row.mediaCount).padStart(3)}  ✗${errs}  ·${warns}`);
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(OUT, `summary${TAG ? '-' + TAG : ''}.json`), JSON.stringify(all, null, 1));

/* ── 汇总打印 ─────────────────────────────────────────────────────── */
const flat = all.flatMap((r) => r.findings);
const byCode = {};
for (const f of flat) (byCode[f.code] ??= { error: 0, warn: 0 })[f.sev]++;
console.log('\n按类型：');
for (const [k, v] of Object.entries(byCode)) console.log(`  ${k.padEnd(12)} ✗${v.error}  ·${v.warn}`);

const rows = flat.filter((f) => f.code === 'RAGGEDROW').sort((a, b) => parseInt(b.msg.match(/空 (\d+)/)?.[1] ?? 0) - parseInt(a.msg.match(/空 (\d+)/)?.[1] ?? 0));
if (rows.length) {
  console.log('\n行高不齐（矮图下方的死白，按大小降序，前 20 条）：');
  for (const r of rows.slice(0, 20)) {
    console.log(`  ${r.msg}  @${r.route} ${r.vp}`);
    for (const it of r.row) console.log(`      ${String(it.h).padStart(5)}px 高  下方空 ${String(it.voidBelow).padStart(5)}px  ${it.src}`);
  }
}

const errors = flat.filter((f) => f.sev === 'error');
if (errors.length) {
  console.log('\n错误（前 40 条）：');
  for (const f of errors.slice(0, 40)) console.log(`  [${f.code}] ${f.route} @${f.vp}  ${f.msg}`);
}

const heavy = flat.filter((f) => f.code === 'CROPPED').sort((a, b) => a.cropFrac - b.cropFrac);
if (heavy.length) {
  console.log('\n裁切（按可见比例升序，前 25 条）：');
  for (const f of heavy.slice(0, 25)) {
    console.log(`  ${(f.cropFrac * 100).toFixed(1)}%  box ${f.boxAspect}  img ${f.imgAspect}  ${f.fit}/${f.objectPosition}  ${f.src}  @${f.route} ${f.vp}`);
  }
}

console.log(`\n结果：${errors.length} 错误 / ${flat.length - errors.length} 警告`);
process.exit(errors.length ? 1 : 0);
