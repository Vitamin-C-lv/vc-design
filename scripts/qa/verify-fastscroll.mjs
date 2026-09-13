/**
 * Acceptance check for the "fast scroll" failure mode.
 *
 * The bug this exists to prevent: during a fling the page can move further in one
 * frame than a whole block is tall. An IntersectionObserver is only sampled once
 * per rendering update, so the block goes from below the viewport to above it
 * without any sampled frame being intersecting — no callback ever fires. On the
 * home page the particle block then sat at the canvas default 300×150 forever,
 * `three` and the point cloud were never requested, and the visitor was left
 * looking at the static capture with nothing saying why.
 *
 * Three properties are checked, and the first two pull in opposite directions, so
 * passing both is the actual result:
 *
 *   1. Laziness survives. A case page opened and left alone must not fetch the
 *      point cloud, and its canvas must stay uninitialised.
 *   2. A fling still ends with a running block. After a real wheel fling past the
 *      particle block, the canvas must have been sized by the renderer and the
 *      point cloud must have been requested. This is the regression.
 *   3. Nothing is asserted about things that are merely off-screen. After the
 *      fling, every reveal element and every image *inside the viewport* must be
 *      shown/loaded — but elements the fling skipped over are supposed to stay
 *      dormant, and counting those was how two earlier "findings" turned out to be
 *      test artefacts rather than bugs.
 *
 * Run (server must be up): node verify-fastscroll.mjs
 * Override the target with BASE=http://127.0.0.1:3000
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = ROOT + '_qa-output/fastscroll-verify';
await mkdir(OUT, { recursive: true });

const LAUNCH = {
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
};

const failures = [];
const assert = (ok, label, detail) => {
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
};

/** A fresh context so every run starts cold: no warm module cache, no HTTP cache. */
const coldPage = async (browser, route, width = 1440, height = 950) => {
  const context = await browser.newContext({ viewport: { width, height }, locale: 'zh-CN' });
  const page = await context.newPage();
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(BASE + route, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});
  return { context, page, requests };
};

const binRequests = (requests) => requests.filter((u) => u.endsWith('.bin'));
const canvasBox = (page) =>
  page.evaluate(() => {
    const c = document.querySelector('canvas');
    return c ? { w: c.width, h: c.height, css: Math.round(c.getBoundingClientRect().width) } : null;
  });

const browser = await chromium.launch(LAUNCH);

/* ── 1. 懒加载没有被这次修复破坏 ─────────────────────────────────────────── */
console.log('\n[1] 案例页静置不滚动：重资源一个都不该来');
{
  const { context, page, requests } = await coldPage(browser, '/work/qinghua-zaojing');
  await page.waitForTimeout(5000);
  const box = await canvasBox(page);
  assert(binRequests(requests).length === 0, '点云 .bin 未被请求', `实际 ${binRequests(requests).length} 次`);
  assert(
    box === null || (box.w === 300 && box.h === 150),
    'canvas 仍处于未初始化状态',
    box ? `canvas ${box.w}×${box.h}` : 'canvas 不存在',
  );
  await context.close();
}

/* ── 2. 真正的回归：冷启动 + 快速甩动之后，粒子必须自己活过来 ─────────────── */
console.log('\n[2] 首页冷启动 + 真实滚轮猛甩：粒子区块必须自愈');
{
  const { context, page, requests } = await coldPage(browser, '/');
  /*
   * 甩动前先埋一个逐帧采样器，量"一帧到底能跑多远"——这正是 IntersectionObserver 会漏采的原因。
   *
   * 采样的是 `scrollY`，不是区块的 `top`：区块在 `near` 变真之前根本不在 DOM 里，
   * 采样 `top` 会得到一串 0，看起来像"没滚动过"。滚动位移才是那个会漏采的量，
   * 而区块高度可以从甩动结束后的容器量到。
   */
  await page.evaluate(() => {
    window.__frames = [];
    const tick = () => {
      window.__frames.push(Math.round(window.scrollY));
      window.__raf = requestAnimationFrame(tick);
    };
    tick();
  });

  await page.mouse.move(720, 500);
  for (let i = 0; i < 45; i++) {
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(15);
  }

  const frames = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    return window.__frames || [];
  });
  let maxStep = 0;
  for (let i = 1; i < frames.length; i++) maxStep = Math.max(maxStep, Math.abs(frames[i] - frames[i - 1]));

  // 点云请求可能在甩动过程中才发出，给它时间落地。
  for (let i = 0; i < 20 && binRequests(requests).length === 0; i++) await page.waitForTimeout(500);
  const box = await canvasBox(page);
  const blockHeight = await page.evaluate(() => {
    const b = document.querySelector('[data-qinghua-vessel]');
    return b ? Math.round(b.getBoundingClientRect().height) : 0;
  });
  console.log(
    `  · 单帧最大位移 ${maxStep}px vs 区块高度 ${blockHeight}px` +
      (maxStep > blockHeight && blockHeight > 0 ? '（> 区块高度，观察器必然漏采）' : ''),
  );
  assert(binRequests(requests).length > 0, '点云 .bin 已被请求', `实际 ${binRequests(requests).length} 次`);
  assert(
    box !== null && !(box.w === 300 && box.h === 150),
    'canvas 已被渲染器按真实尺寸初始化',
    box ? `canvas ${box.w}×${box.h}` : 'canvas 不存在',
  );

  // 3. 只对"视口内"的东西下断言：视口外的休眠是设计，不是缺陷。
  const inside = await page.evaluate(() => {
    const vh = window.innerHeight;
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < vh && r.bottom > 0;
    };
    const hiddenReveals = [...document.querySelectorAll('[data-reveal]:not([data-revealed])')]
      .filter((el) => inView(el) && Number(getComputedStyle(el).opacity) < 0.05);
    const unloadedImages = [...document.querySelectorAll('img')].filter(
      (img) => inView(img) && !(img.complete && img.naturalWidth > 0),
    );
    return {
      hiddenReveals: hiddenReveals.length,
      unloadedImages: unloadedImages.map((i) => (i.currentSrc || i.src).split('/').pop()),
    };
  });
  assert(inside.hiddenReveals === 0, '视口内没有被卡住的揭示元素', `${inside.hiddenReveals} 个`);
  assert(inside.unloadedImages.length === 0, '视口内没有未加载完的图片', inside.unloadedImages.join(', ') || '0 张');

  await page.screenshot({ path: OUT + '/home-after-fling.png' });
  await context.close();
}

await browser.close();

console.log(`\n${failures.length === 0 ? '✅ 全部通过' : `❌ ${failures.length} 项未通过`}`);
failures.forEach((f) => console.log(`   - ${f}`));
await writeFile(OUT + '/result.json', JSON.stringify({ failures, at: new Date().toISOString() }, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
