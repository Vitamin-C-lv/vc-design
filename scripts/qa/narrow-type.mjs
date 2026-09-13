import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ROUTES = ['/','/work','/lab','/work/guge','/work/lihuahua','/work/guanchao','/work/qinghua-zaojing'];
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport:{width:1600,height:1000}, locale:'zh-CN' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`,{waitUntil:'domcontentloaded'});
  await page.waitForLoadState('networkidle').catch(()=>{});
  await page.waitForTimeout(1600);
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.type-xl,.type-lg,.type-md,.type-display,.type-hero').forEach(el => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const r = el.getBoundingClientRect();
      if (!r.width || !fs) return;
      const txt = (el.textContent||'').trim();
      if (txt.length < 4) return;
      // One glyph per line => rendered width is barely more than one em.
      if (r.width < fs * 1.9) {
        out.push({ w: Math.round(r.width), fs: Math.round(fs), h: Math.round(r.height),
                   cls: String(el.className).slice(0,70), txt: txt.slice(0,28) });
      }
    });
    return out;
  });
  console.log(`${route.padEnd(24)} ${bad.length ? '⚠ ' + bad.length + ' 处窄容器' : 'OK'}`);
  for (const b of bad.slice(0,4)) console.log(`     w=${b.w} fs=${b.fs} h=${b.h} "${b.txt}"  class=${b.cls}`);
  await ctx.close();
}
await browser.close();
