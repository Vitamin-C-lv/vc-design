/**
 * 首页四个旗舰各自「跑起了什么」。
 *
 * 判据（改这条之前先想清楚是不是真的改了产品行为）：
 *   古格     → video（真在播的自托管短片）        且无 canvas / 无 iframe
 *   李花花   → 目前没有任何实况槽位，只有静态封面
 *   观潮     → iframe，src = /guanchao-live
 *   青花造境 → canvas（粒子）
 *   全页合计 canvas 1 / iframe 1 / video 1
 *
 * 首页是实况媒体的第一现场，这里回归能立刻发现「某个项目悄悄退回静态封面」。
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = ROOT + '_qa-output/home-blocks/';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport:{width:1440,height:950} })).newPage();
await page.goto(BASE + '/',{waitUntil:'load'});
await page.waitForLoadState('networkidle').catch(()=>{});
await page.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));} });

// ⚠️ 这里必须「等元素出现」，不能睡固定秒数。
// 曾经写 `waitForTimeout(9000)`：单独跑 9/9，但连着跑 10 个 Chromium 的脚本时
// 抢 CPU，懒挂载的 canvas / iframe 还没上屏就被判失败 → 7/9 的假红灯。
// 假红灯比没有测试更糟：下一个人查半天没毛病，就学会忽略这个工具了。
for (const [sel, label] of [['video', 'video'], ['iframe[src="/guanchao-live"]', '观潮 iframe'], ['canvas', '青花 canvas']]) {
  await page.waitForSelector(sel, { timeout: 45000 })
    .catch(() => console.log(`⚠️ 等 ${label} 超时（45s）——下面会判失败`));
}
// 视频的播放状态不在这里等：滚动遍历结束时页面停在底部，视频早已离开视口
// （离开即暂停是设计行为）。下面测量完会把它滚回视口再看。
await page.waitForTimeout(1500);

const data = await page.evaluate(()=>{
  const seen = new Set();
  return [...document.querySelectorAll('#work article')].map(el=>{
    const link = el.querySelector('a[href^="/work/"]');
    const heading = el.querySelector('[role=heading], h3, h2');
    return {
      href: link?.getAttribute('href') ?? null,
      heading: (heading?.textContent||'').replace(/\s+/g,' ').trim().slice(0,26),
      canvas: !!el.querySelector('canvas'),
      iframe: el.querySelector('iframe')?.getAttribute('src') ?? null,
      video: !!el.querySelector('video'),
      y: Math.round(el.getBoundingClientRect().top+window.scrollY),
    };
  }).filter(b=>{
    // 旗舰块里有嵌套 article，同一个 href 只留最外层那条
    if (seen.has(b.href)) return false;
    seen.add(b.href); return true;
  });
});
console.table(data);

const totals = await page.evaluate(()=>({
  canvas: document.querySelectorAll('canvas').length,
  iframe: document.querySelectorAll('iframe').length,
  video: document.querySelectorAll('video').length,
}));
console.log('全页 canvas / iframe / video 总数:', totals.canvas, '/', totals.iframe, '/', totals.video);

// 播放状态：probe 只负责"有没有"，"有没有在播"归 verify-guge-video.mjs 管。
// 注意上面刚把页面滚到底了，视频此时必然已被暂停（离开视口就暂停是设计行为），
// 所以要滚回去再看，否则这里打印的 paused:true 会误导人以为自动播放坏了。
await page.evaluate(()=>{ const v=document.querySelector('video'); if(v) v.scrollIntoView({block:'center'}); });
await page.waitForTimeout(3000);
const playing = await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({paused:v.paused, src:(v.currentSrc||'').split('/').pop()})));
console.log('滚回视口后的 video 播放状态:', JSON.stringify(playing));

const by = Object.fromEntries(data.map(b=>[b.href, b]));
const checks = [
  ['古格 video',        by['/work/guge']?.video === true],
  ['古格无 canvas',     by['/work/guge']?.canvas === false],
  ['古格无 iframe',     by['/work/guge']?.iframe === null],
  ['观潮 iframe',       by['/work/guanchao']?.iframe === '/guanchao-live'],
  ['青花 canvas',       by['/work/qinghua-zaojing']?.canvas === true],
  ['李花花无实况',      by['/work/lihuahua'] && !by['/work/lihuahua'].video && !by['/work/lihuahua'].canvas && !by['/work/lihuahua'].iframe],
  ['全页 canvas 1',     totals.canvas === 1],
  ['全页 iframe 1',     totals.iframe === 1],
  ['全页 video 1',      totals.video === 1],
];
let pass = 0;
for (const [name, ok] of checks) { console.log(`${ok ? '  ✅' : '  ❌'} ${name}`); if (ok) pass++; }
console.log(`\n${pass}/${checks.length} passed`);

if (pass !== checks.length) {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(OUT, { recursive: true });
  await page.screenshot({ path: OUT + 'home-blocks-FAIL.png', fullPage: true });
  console.log('失败截图:', OUT + 'home-blocks-FAIL.png');
}
await browser.close();
process.exit(pass === checks.length ? 0 : 1);
