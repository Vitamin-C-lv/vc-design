import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3000';
const OUT = join(process.cwd(), '_qa-output');
const EXECUTABLE = '/usr/bin/chromium';

const viewports = [
  { name: 'desktop-1600', width: 1600, height: 1000, deviceScaleFactor: 1 },
  { name: 'ipad-1024', width: 1024, height: 1366, deviceScaleFactor: 1, hasTouch: true },
];

async function waitForPaint(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1400);
}

async function scrollToCurve(page) {
  return page.evaluate(() => {
    const band = document.querySelector('#work');
    if (!band) throw new Error('Missing #work band');
    const documentTop = band.getBoundingClientRect().top + window.scrollY;
    const scrollY = Math.max(0, Math.round(documentTop - window.innerHeight * 0.42));
    window.scrollTo(0, scrollY);
    return { documentTop, scrollY };
  });
}

async function curveMetrics(page) {
  return page.evaluate(() => {
    const band = document.querySelector('#work');
    const svg = band?.querySelector('.band-curve-svg');
    const content = band?.querySelector('.band-curve-content');
    if (!band) throw new Error('Missing #work band');
    const svgRect = svg?.getBoundingClientRect();
    const path = svg?.querySelector('path');
    const pathLength = path?.getTotalLength() ?? 0;
    const style = getComputedStyle(band);
    const samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1].map((ratio) => {
      if (!svg || !path) return { ratio, boundaryFromSvgTopPx: null, dropFromEdgePx: null, dropRatio: null };
      const targetX = ratio * 100;
      let previousPoint = path.getPointAtLength(0);
      let point = previousPoint;
      for (let step = 1; step <= 2000; step += 1) {
        const length = (pathLength * step) / 2000;
        const nextPoint = path.getPointAtLength(length);
        if (nextPoint.x >= targetX) {
          const span = nextPoint.x - previousPoint.x || 1;
          const fraction = Math.max(0, Math.min(1, (targetX - previousPoint.x) / span));
          point = {
            x: targetX,
            y: previousPoint.y + (nextPoint.y - previousPoint.y) * fraction,
          };
          break;
        }
        previousPoint = nextPoint;
      }
      const height = svg.getBoundingClientRect().height;
      const boundaryFromSvgTopPx = (point.y / 100) * height;
      const dropFromEdgePx = height - boundaryFromSvgTopPx;
      return {
        ratio,
        boundaryFromSvgTopPx: Math.round(boundaryFromSvgTopPx * 100) / 100,
        dropFromEdgePx: Math.round(dropFromEdgePx * 100) / 100,
        dropRatio: Math.round((dropFromEdgePx / height) * 10000) / 10000,
      };
    });
    return {
      scrollY: Math.round(window.scrollY),
      bandTop: Math.round(band.getBoundingClientRect().top),
      svgTop: svgRect ? Math.round(svgRect.top) : null,
      svgHeight: svgRect ? Math.round(svgRect.height * 100) / 100 : null,
      contentTop: content ? Math.round(content.getBoundingClientRect().top) : null,
      curveHeightVariable: style.getPropertyValue('--band-curve-height').trim(),
      pathLength: Math.round(pathLength * 100) / 100,
      path: path?.getAttribute('d') ?? '',
      samples,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
    };
  });
}

async function captureVariant(browser, viewport, name, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForPaint(page);
  const position = await scrollToCurve(page);
  await page.waitForTimeout(850);
  const metrics = await curveMetrics(page);
  const file = join(OUT, name);
  await page.screenshot({ path: file, fullPage: false, timeout: 120000 });
  await context.close();
  return { file, position, metrics };
}

async function captureFeaturedTitle(browser) {
  const context = await browser.newContext({ viewport: viewports[0] });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForPaint(page);
  await scrollToCurve(page);
  await page.evaluate(() => window.scrollBy(0, 220));
  await page.waitForTimeout(850);
  const file = join(OUT, 'featured-works-title-desktop-1600.png');
  await page.screenshot({ path: file, fullPage: false, timeout: 120000 });
  const state = await curveMetrics(page);
  await context.close();
  return { file, metrics: state };
}

async function sideBySide(before, after, output) {
  const left = sharp(before);
  const right = sharp(after);
  const { width, height } = await left.metadata();
  if (!width || !height) throw new Error(`Missing image dimensions for ${before}`);
  await sharp({
    create: {
      width: width * 2,
      height,
      channels: 4,
      background: '#f7f5f1',
    },
  })
    .composite([
      { input: await left.png().toBuffer(), left: 0, top: 0 },
      { input: await right.png().toBuffer(), left: width, top: 0 },
    ])
    .png()
    .toFile(output);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const mode = process.env.CURVE_QA_MODE ?? 'after';
  const results = {};
  for (const viewport of viewports) {
    const prefix = mode === 'before' ? 'before-' : '';
    results[viewport.name] = await captureVariant(
      browser,
      viewport,
      `${prefix}curve-${viewport.name}.png`,
    );
  }

  if (mode === 'after') {
    results.reducedMotion = await captureVariant(
      browser,
      viewports[0],
      'curve-reduced-motion-desktop-1600.png',
      { reducedMotion: 'reduce' },
    );
    results.noJs = await captureVariant(browser, viewports[0], 'curve-no-js-desktop-1600.png', {
      javaScriptEnabled: false,
    });
    results.lowTier = await captureVariant(browser, viewports[0], 'curve-low-tier-desktop-1600.png', {
      serviceWorkers: 'block',
    });

    if (results.lowTier) {
      // This page-level override is only for the QA context; it emulates the
      // explicit low-device signals used by useDeviceProfile without changing app code.
      // The screenshot above still verifies the normal static shape; the metric below
      // is collected again with the signals applied before page code runs.
      const lowContext = await browser.newContext({ viewport: viewports[0] });
      await lowContext.addInitScript(() => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 });
        Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 2 });
      });
      const lowPage = await lowContext.newPage();
      await lowPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await waitForPaint(lowPage);
      const position = await scrollToCurve(lowPage);
      await lowPage.waitForTimeout(850);
      results.lowTier = {
        ...results.lowTier,
        position,
        metrics: await curveMetrics(lowPage),
      };
      await lowPage.screenshot({ path: results.lowTier.file, fullPage: false, timeout: 120000 });
      await lowContext.close();
    }

    const beforeDesktop = join(OUT, 'before-curve-desktop-1600.png');
    const beforeIpad = join(OUT, 'before-curve-ipad-1024.png');
    await sideBySide(beforeDesktop, results['desktop-1600'].file, join(OUT, 'curve-comparison-desktop-1600.png'));
    await sideBySide(beforeIpad, results['ipad-1024'].file, join(OUT, 'curve-comparison-ipad-1024.png'));

    results.featuredTitle = await captureFeaturedTitle(browser);
  }

  await browser.close();
  const report = { mode, generatedAt: new Date().toISOString(), results };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
