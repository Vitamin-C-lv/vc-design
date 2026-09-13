import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, locale:'zh-CN' });
const page = await ctx.newPage();
const failed=[], errs=[], responses=[];
page.on('requestfailed', r=>failed.push(`${r.method()} ${r.url()} -> ${r.failure()?.errorText}`));
page.on('pageerror', e=>errs.push(String(e.message).slice(0,200)));
page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
page.on('response', r=>{ if(r.status()>=400) responses.push(`${r.status()} ${r.url()}`); });

const t0=Date.now();
let status='?';
try {
  const resp = await page.goto(BASE + '/', { waitUntil:'load', timeout:30000 });
  status = resp ? resp.status() : 'no response';
} catch(e) { status = 'GOTO FAILED: '+e.message.slice(0,120); }
const loadMs = Date.now()-t0;
await page.waitForTimeout(2500);

const info = await page.evaluate(()=>({
  title: document.title,
  h1: document.querySelector('h1')?.textContent?.trim().slice(0,60) ?? '(无 h1)',
  bodyLen: document.body.innerText.length,
  hasSignalCircle: !!document.querySelector('.signal-circle'),
  wechatId: document.body.innerText.includes('Vc1242856346'),
  dataLang: document.documentElement.dataset.lang,
}));
console.log('HTTP 状态      :', status, `(耗时 ${loadMs}ms)`);
console.log('页面标题       :', info.title);
console.log('h1             :', info.h1);
console.log('正文长度       :', info.bodyLen);
console.log('data-lang      :', info.dataLang);
console.log('含微信号       :', info.wechatId);
console.log('含 CTA 圆      :', info.hasSignalCircle);
console.log('失败请求       :', failed.length? failed.slice(0,6) : 'none');
console.log('4xx/5xx 响应   :', responses.length? responses.slice(0,6) : 'none');
console.log('JS 错误        :', errs.length? errs.slice(0,6) : 'none');
await page.screenshot({ path: ROOT + '_qa-output/diag-load.png' });
await browser.close();
