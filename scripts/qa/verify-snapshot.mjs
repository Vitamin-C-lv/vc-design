import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
import { mkdir } from 'node:fs/promises';
const OUT = ROOT + '_qa-output/snapshot'; await mkdir(OUT,{recursive:true});
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport:{width:1280,height:900}, locale:'zh-CN' });
const page = await ctx.newPage();
const failed=[], errs=[], bad=[];
page.on('requestfailed', r=>failed.push(`${r.url().slice(0,90)} ${r.failure()?.errorText}`));
page.on('pageerror', e=>errs.push(String(e.message).slice(0,140)));
page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,140)); });
page.on('response', r=>{ if(r.status()>=400) bad.push(`${r.status()} ${r.url().slice(0,90)}`); });

await page.goto(BASE + '/guanchao-live/', { waitUntil:'load', timeout:40000 });
await page.waitForLoadState('networkidle').catch(()=>{});
await page.waitForTimeout(3000);
const info = await page.evaluate(()=>({
  url: location.href,
  title: document.title,
  textLen: document.body.innerText.length,
  hasNav: !!document.querySelector('nav, header'),
  links: [...document.querySelectorAll('a[href^="/guanchao-live"]')].length,
}));
console.log('URL      :', info.url);
console.log('标题     :', info.title);
console.log('正文长度 :', info.textLen);
console.log('内部链接 :', info.links);
console.log('失败请求 :', failed.length?failed.slice(0,5):'none');
console.log('4xx/5xx  :', bad.length?bad.slice(0,5):'none');
console.log('JS 错误  :', errs.length?errs.slice(0,5):'none');
await page.screenshot({ path:`${OUT}/snapshot-home.png` });

// 点击一个内部链接，验证客户端路由是否工作
const link = page.locator('a[href*="/markets/"]').first();
if (await link.count()) {
  const before = page.url();
  await link.click();
  await page.waitForTimeout(3500);
  console.log('\n点击后 URL:', page.url(), '(点击前：'+before+')');
  console.log('点击后正文长度:', await page.evaluate(()=>document.body.innerText.length));
  await page.screenshot({ path:`${OUT}/snapshot-markets.png` });
} else { console.log('\n未找到内部链接'); }
await browser.close();
