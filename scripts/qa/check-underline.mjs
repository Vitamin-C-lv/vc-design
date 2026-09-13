import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, locale:'zh-CN' });
const page = await ctx.newPage();
await page.goto(BASE + '/',{waitUntil:'load'});
await page.waitForLoadState('networkidle').catch(()=>{});
await page.evaluate(()=>{ const el=document.querySelector('#work article a[aria-label]'); if(el) window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY-60); });
await page.waitForTimeout(900);

const read = async () => page.evaluate(()=>{
  const a=document.querySelector('#work .link-underline');
  const cs=getComputedStyle(a,'::after');
  const r=a.getBoundingClientRect();
  return { opacity:cs.opacity, transform:cs.transform, height:cs.height, width:cs.width, btn:cs.bottom, bg:cs.backgroundColor, titleRect:`${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}` };
});
console.log('静止态 ::after =', JSON.stringify(await read()));
await page.locator('#work .link-underline').first().hover();
await page.waitForTimeout(900);
console.log('悬停态 ::after =', JSON.stringify(await read()));
await browser.close();
