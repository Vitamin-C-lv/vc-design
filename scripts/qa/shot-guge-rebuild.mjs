/**
 * 定点取证：古格第 04 章那两幅图（拆解图 + 三视图）。
 *
 * 为什么不用 shoot.mjs：它是整页长图，42 屏的东西读不了，而且 fullPage 会重新
 * 触发滚动动画、容易截到中途帧。这里只把目标图滚进视口，等揭示收尾再拍。
 *
 * 用法：
 *   BASE=http://127.0.0.1:3200 node scripts/qa/shot-guge-rebuild.mjs
 * 产物：_qa-output/guge-rebuild/shot-<视口>-<图>.png
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE ?? 'http://127.0.0.1:3200';
const OUT = process.env.SHOT_OUT ?? `${ROOT}_qa-output/guge-rebuild`;
const ROUTE = process.env.ROUTE ?? '/work/guge';

const VIEWPORTS = [
  { name: '1600', width: 1600, height: 1000 },
  { name: '390', width: 390, height: 844 },
];

/** 用 alt 前缀找图，比认 class 稳。 */
const TARGETS = [
  { slug: 'layers', alt: '红殿拆解分层图' },
  { slug: 'front', alt: '红殿正视图' },
  { slug: 'side', alt: '红殿侧视图' },
  { slug: 'plan', alt: '红殿俯视图' },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const problems = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const failed = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(BASE + ROUTE, { waitUntil: 'load' });
  // 片头：等它退场，否则首屏还在挡住
  await page.evaluate(() => {
    document.documentElement.dataset.intro = 'done';
  });
  await page.waitForTimeout(1200);

  // 先把整页慢慢滚一遍，让所有懒加载与揭示都触发（一次性跳到底会跳过触发点）
  const full = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < full; y += vp.height * 0.8) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(600);

  for (const t of TARGETS) {
    const img = page.locator(`img[alt^="${t.alt}"]`).first();
    const n = await img.count();
    if (n === 0) {
      problems.push(`${vp.name} · ${t.slug}: 页面上找不到这张图`);
      continue;
    }
    // 滚到元素居中；用 instant 避免 Lenis 平滑滚动把位置算歪
    await img.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/shot-${vp.name}-${t.slug}.png` });

    // 顺带记下实测几何：可见宽高 + currentSrc + natualWidth
    const geo = await img.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        loaded: el.complete,
        natural: `${el.naturalWidth}x${el.naturalHeight}`,
        src: (el.currentSrc || '').split('/').slice(-1)[0],
      };
    });
    console.log(
      `  ${vp.name} · ${t.slug.padEnd(7)} ${String(geo.w).padStart(5)}×${String(geo.h).padStart(5)}  ${geo.src}  (natural ${geo.natural}, loaded ${geo.loaded})`,
    );
    if (!geo.loaded || geo.w < 2 || geo.h < 2) problems.push(`${vp.name} · ${t.slug}: 图没加载或尺寸为 0`);
  }

  const bad = failed.filter((u) => !u.includes('__next._tree.txt') && !u.includes('_rsc='));
  if (bad.length) problems.push(`${vp.name}: ${bad.length} 个请求 4xx/5xx\n    ` + bad.slice(0, 5).join('\n    '));
  await page.close();
}

await browser.close();
console.log(`\n产物目录：${OUT}`);
if (problems.length) {
  console.log('\n[✗] 问题：');
  for (const p of problems) console.log('  ' + p);
  process.exit(1);
}
console.log('[✓] 四张图在两个视口都加载、都有尺寸、没有 4xx');
