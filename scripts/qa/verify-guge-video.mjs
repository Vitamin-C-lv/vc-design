import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
import { mkdir } from 'node:fs/promises';
const OUT = ROOT + '_qa-output/guge-check'; await mkdir(OUT,{recursive:true});
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({viewport:{width:1440,height:950},locale:'zh-CN'})).newPage();
const vid=[]; page.on('response', r=>{ if(/\.(mp4|webm|jpg)$/.test(r.url()) && r.url().includes('guge')) vid.push(`${r.status()} ${r.url().split('/').pop()}`); });
const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,110)));
await page.goto(BASE + '/#work',{waitUntil:'load'});
await page.waitForLoadState('networkidle').catch(()=>{});
const art = page.locator('#work article').first();
await art.scrollIntoViewIfNeeded();
await page.waitForTimeout(7000);
const v = await page.evaluate(()=>{
  const video=document.querySelector('#work video');
  if(!video) return {found:false};
  const r=video.getBoundingClientRect();
  const s=video.querySelector('source');
  return {found:true, muted:video.muted, paused:video.paused, t:Number(video.currentTime.toFixed(1)),
    size:`${Math.round(r.width)}x${Math.round(r.height)}`, src:s?.src?.split('/').pop(), posterAttr:!!video.getAttribute('poster')};
});
console.log('古格视频:', JSON.stringify(v,null,1));
console.log('视频/海报请求:', vid.length?[...new Set(vid)]:'（无）');
console.log('错误:', errs.length?errs.slice(0,3):'none');
const box = await art.boundingBox();
if (box) await page.screenshot({path:`${OUT}/guge-hero-new.png`, clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(1440,box.width),height:Math.min(950,box.height)}}).catch(()=>{});
await browser.close();
