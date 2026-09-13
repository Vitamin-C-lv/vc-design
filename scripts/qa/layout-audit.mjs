import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const ROUTES = ['/', '/work', '/lab', '/work/guge', '/work/luahua', '/work/lihuahua', '/work/guanchao', '/work/qinghua-zaojing'];
const VPS = [{n:'1600',w:1600,h:1000},{n:'390',w:390,h:844}];


for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, locale: 'zh-CN' });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    try {
      const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (res && res.status() === 404) { console.log(`[${vp.n}] ${route} -> 404 (skip)`); await page.close(); continue; }
      await page.waitForLoadState('networkidle').catch(()=>{});
      await page.waitForTimeout(1200);
      const issues = await page.evaluate(() => {
        const out = [];
        const vw = document.documentElement.clientWidth;
        const header = document.querySelector('header');
        const headerH = header ? header.getBoundingClientRect().height : 0;

        // 元素自己「溢出」不算问题——如果它某个祖先能横向滚动，那它就是在卷轴里，
        // 属于设计意图。只认「没有被任何祖先接住」的溢出。
        const hasHScrollAncestor = (el) => {
          for (let p = el.parentElement; p; p = p.parentElement) {
            const pcs = getComputedStyle(p);
            if (/auto|scroll/.test(pcs.overflowX) && p.scrollWidth > p.clientWidth + 2) return true;
          }
          return false;
        };

        document.querySelectorAll('*').forEach(el => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;

          // 1. text smaller than 11px
          const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
          if (hasText) {
            const fs = parseFloat(cs.fontSize);
            if (fs < 11 && fs > 0) out.push({ k: 'TINY_TEXT', d: `${el.tagName} ${fs.toFixed(1)}px "${el.textContent.trim().slice(0,26)}"` });
          }
          // 2. horizontally clipped (wider than viewport AND nothing above it scrolls)
          //
          // ⚠️ 必须排除「横向滚动容器里的幻灯片」。首页与案例页的图像卷轴
          // （`.bleed-x` + `snap-x`）就是故意比视口宽的：它的父级 `overflow-x: auto`
          // 会把它滚出来，页面级 scrollWidth 仍然等于视口宽，用户看到的是正常的
          // 可横滑卡片。不排除的话这里会**永久**误报 4 条，把真正的溢出埋掉。
          if (r.width > vw + 2 && cs.overflowX === 'visible' && el.tagName !== 'HTML' && el.tagName !== 'BODY'
              && !hasHScrollAncestor(el)) {
            out.push({ k: 'OVERFLOW', d: `${el.tagName}.${String(el.className).slice(0,40)} w=${Math.round(r.width)} > vw=${vw}` });
          }
          // 3. content sitting under the fixed header (only near page top)
          if (headerH > 0 && hasText && window.scrollY < 20) {
            const top = r.top;
            const inHeaderBand = top < headerH && r.bottom > 4;
            if (inHeaderBand && el.closest('header') === null) {
              out.push({ k: 'UNDER_HEADER', d: `${el.tagName} top=${Math.round(top)} "${el.textContent.trim().slice(0,26)}"` });
            }
          }
        });

        // 4. huge empty bands (a section taller than 1.6 viewports with almost no text)
        const deadSpace = [];
        document.querySelectorAll('section, [data-tone]').forEach(sec => {
          const r = sec.getBoundingClientRect();
          const textLen = (sec.innerText || '').trim().length;
          const mediaCount = sec.querySelectorAll('img,video,svg').length;
          if (r.height > window.innerHeight * 1.6 && textLen < 120 && mediaCount === 0) {
            deadSpace.push(`${sec.id || sec.tagName} h=${Math.round(r.height)} text=${textLen}`);
          }
        });

        // 5. broken / unloaded images and distorted aspect
        const badImg = [];
        document.querySelectorAll('img').forEach(img => {
          if (img.complete && img.naturalWidth === 0) badImg.push(`BROKEN ${(img.currentSrc||img.src).split('/').slice(-1)[0]}`);
        });

        return { tiny: out.filter(o=>o.k==='TINY_TEXT').slice(0,6), overflow: out.filter(o=>o.k==='OVERFLOW').slice(0,4),
                 under: out.filter(o=>o.k==='UNDER_HEADER').slice(0,5), deadSpace: deadSpace.slice(0,4), badImg };
      });
      const parts = [];
      if (issues.tiny.length) parts.push(`小字(<11px)×${issues.tiny.length}: ${issues.tiny.map(t=>t.d).join(' | ')}`);
      if (issues.overflow.length) parts.push(`溢出×${issues.overflow.length}: ${issues.overflow.map(t=>t.d).join(' | ')}`);
      if (issues.under.length) parts.push(`压页头×${issues.under.length}: ${issues.under.map(t=>t.d).join(' | ')}`);
      if (issues.deadSpace.length) parts.push(`死白×${issues.deadSpace.length}: ${issues.deadSpace.join(' | ')}`);
      if (issues.badImg.length) parts.push(`破图×${issues.badImg.length}: ${issues.badImg.join(' | ')}`);
      console.log(`[${vp.n}] ${route.padEnd(24)} ${parts.length ? parts.join('\n        ') : 'OK'}`);
    } catch (e) { console.log(`[${vp.n}] ${route} ERROR ${String(e).slice(0,80)}`); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
