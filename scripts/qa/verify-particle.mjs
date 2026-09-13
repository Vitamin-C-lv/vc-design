/**
 * Acceptance check for the qinghua live-particle block on the case page.
 *
 * Two properties matter here and neither shows up in a build log:
 *
 *  1. The fallback capture must not contribute to the finished frame. It is a
 *     loading state. While it stayed visible under a fully transparent canvas,
 *     the captured frame's typography stacked on top of the slate that names the
 *     current stage — two titles over one image.
 *  2. The vessel must be framed, not cropped. A particle cloud that overflows the
 *     canvas reads as a texture, not as an artefact.
 *
 * Both are measured from real screenshots. Canvas pixel readback is deliberately
 * not used: the renderer keeps the default `preserveDrawingBuffer: false`, so
 * `drawImage(canvas)` after the frame is composited returns an empty buffer and
 * would report a blank render even when the frame is fine.
 *
 * Run (server must be up): node verify-particle.mjs
 * Override the target with BASE=http://127.0.0.1:3000
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const ROUTE = '/work/qinghua-zaojing';
const OUT = ROOT + '_qa-output/particle';
await mkdir(OUT, { recursive: true });

const LUMA = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Bounding box of pixels brighter than `threshold` inside an RGBA buffer. */
function brightBox(png, threshold) {
  const { width, height, data } = png;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (LUMA(data[i], data[i + 1], data[i + 2]) > threshold) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, count, width, height };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'zh-CN' });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 140));
});

await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle').catch(() => {});
await page.locator('#live-particle').scrollIntoViewIfNeeded();

// The vessel boots through a dynamic import plus a point-cloud fetch, and the
// particles need a moment to settle into formation.
await page.waitForTimeout(14000);

const state = await page.evaluate(() => {
  const canvas = document.querySelector('#live-particle canvas');
  const img = document.querySelector('#live-particle img');
  if (!canvas) return { error: 'no canvas found in #live-particle' };
  const cr = canvas.getBoundingClientRect();
  const cs = getComputedStyle(canvas);
  return {
    // Viewport coordinates: `page.screenshot()` captures the viewport, not the
    // document, so the scroll offset must stay out of this.
    canvas: {
      x: Math.round(cr.x),
      y: Math.round(cr.y),
      w: Math.round(cr.width),
      h: Math.round(cr.height),
      bg: cs.backgroundColor,
    },
    fallbackOpacity: img ? Number(getComputedStyle(img).opacity) : null,
    fallbackAriaHidden: img ? img.getAttribute('aria-hidden') : 'no img',
    scrollY: Math.round(window.scrollY),
  };
});

if (state.error) {
  console.log('❌', state.error);
  await browser.close();
  process.exit(1);
}

console.log('canvas:', JSON.stringify(state.canvas));
console.log(`fallback: opacity=${state.fallbackOpacity} aria-hidden=${state.fallbackAriaHidden}`);

// Full-viewport capture, then crop to the canvas in image space. `clip` is
// avoided because it addresses viewport coordinates, and this page is scrolled.
const full = await page.screenshot({ type: 'png' });
await writeFile(`${OUT}/viewport.png`, full);
const whole = PNG.sync.read(full);
const deviceScale = whole.width / 1600;
console.log(`设备像素比 ${deviceScale}`);

/*
 * Crops the canvas region out of a fresh viewport capture.
 *
 * The rect is re-measured on every call and never reused: clicking a tab in the
 * vertical tablist makes the browser scroll it into view, which moves the canvas
 * between captures. Reusing the first measurement would silently photograph
 * whatever happened to land at those coordinates instead.
 *
 * `clip` on `page.screenshot()` is not used because it addresses viewport
 * coordinates and this page is scrolled; the canvas can also sit partly outside
 * the viewport, so the source rect is clamped rather than assumed to be in range.
 */
async function captureCanvas() {
  // Keep the vessel fully on screen: the canvas is 830px in a 1000px window, so
  // it fits once the sticky header is accounted for.
  await page.evaluate(() => {
    const canvas = document.querySelector('#live-particle canvas');
    if (canvas) canvas.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(300);

  const rect = await page.evaluate(() => {
    const canvas = document.querySelector('#live-particle canvas');
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, viewportH: window.innerHeight };
  });
  if (!rect) throw new Error('canvas vanished between captures');

  const buf = await page.screenshot({ type: 'png' });
  const png = PNG.sync.read(buf);
  const dpr = png.width / await page.evaluate(() => window.innerWidth);
  const srcX = Math.max(0, Math.min(png.width - 1, Math.round(rect.x * dpr)));
  const srcY = Math.max(0, Math.min(png.height - 1, Math.round(rect.y * dpr)));
  const w = Math.max(1, Math.min(Math.round(rect.w * dpr), png.width - srcX));
  const h = Math.max(1, Math.min(Math.round(rect.h * dpr), png.height - srcY));
  const sub = new PNG({ width: w, height: h });
  PNG.bitblt(png, sub, srcX, srcY, w, h, 0, 0);
  return { sub, rect, dpr };
}

const { sub: crop, rect: firstRect, dpr } = await captureCanvas();
await writeFile(`${OUT}/canvas-crop.png`, PNG.sync.write(crop));
console.log(`可见画布区域 ${crop.width}x${crop.height} @ dpr ${dpr}`);
if (firstRect.y < 60 || firstRect.y + firstRect.h > firstRect.viewportH + 1) {
  console.log(
    `⚠️ 画布未完整落在视口内: y ${Math.round(firstRect.y)} → ${Math.round(firstRect.y + firstRect.h)}，视口高 ${firstRect.viewportH}`,
  );
}

/*
 * Brightness threshold well above the ground colour (#1d1d1b is luma ~29) so
 * only the vessel's own points register, and not the page surface.
 */
const box = brightBox(crop, 70);
const touchLeft = box.minX <= 1;
const touchRight = box.maxX >= box.width - 2;
const touchTop = box.minY <= 1;
const touchBottom = box.maxY >= box.height - 2;
const clipped = [touchLeft && 'left', touchRight && 'right', touchTop && 'top', touchBottom && 'bottom'].filter(Boolean);

console.log('\n=== 画面内容包围盒（阈值 70）===');
console.log(`画布 ${box.width}x${box.height}，亮像素 ${box.count}`);
console.log(`包围盒 x ${box.minX}-${box.maxX}, y ${box.minY}-${box.maxY}`);
if (box.count > 0) {
  const wPct = (((box.maxX - box.minX) / box.width) * 100).toFixed(0);
  const hPct = (((box.maxY - box.minY) / box.height) * 100).toFixed(0);
  console.log(`占画布 ${wPct}% 宽 × ${hPct}% 高`);
}

console.log('\n=== 判定 ===');
console.log(
  state.fallbackOpacity === 0
    ? '✅ fallback 已淡出（opacity=0），截图文字不再与舞台标签叠加'
    : `❌ fallback 仍可见 (opacity=${state.fallbackOpacity})`,
);
console.log(
  box.count > 1000 ? `✅ 粒子有实际绘制（${box.count} 个亮像素）` : `❌ 画面几乎为空（${box.count} 个亮像素）`,
);
console.log(
  clipped.length === 0
    ? '✅ 器物完整在画布内，未被裁切'
    : `⚠️ 内容触到画布边缘: ${clipped.join(', ')} —— 取景可能过近`,
);

// Stage switching must repaint, otherwise the tablist is decorative.
const stages = await page.locator('#live-particle [role="tab"]').count();
const shots = [];
for (const idx of [0, 2, 4, 6]) {
  if (idx >= stages) continue;
  await page.locator('#live-particle [role="tab"]').nth(idx).click();
  await page.waitForTimeout(3000);
  const { sub } = await captureCanvas();
  const b = brightBox(sub, 70);
  shots.push({
    stage: idx + 1,
    brightness: b.count,
    // Checksum over every channel: two states that differ at all will differ here.
    sum: sub.data.reduce((a, v) => (a + v) % 0xffffffff, 0),
  });
  await writeFile(`${OUT}/stage-${String(idx + 1).padStart(2, '0')}.png`, PNG.sync.write(sub));
}
console.log(`\n阶段数 ${stages}；采样各阶段的亮像素:`, shots.map((s) => `#${s.stage}:${s.brightness}`).join(' '));
const distinct = new Set(shots.map((s) => s.sum)).size;
console.log(distinct > 1 ? `✅ 切换阶段确实重绘（${distinct} 种不同画面）` : '❌ 各阶段画面相同');

await page.screenshot({ path: `${OUT}/viewport-final.png`, type: 'png' });
console.log('\n产物: canvas-crop.png / stage-XX.png / viewport-final.png');
console.log('页面错误:', errors.length ? errors.slice(0, 5) : 'none');

await browser.close();
