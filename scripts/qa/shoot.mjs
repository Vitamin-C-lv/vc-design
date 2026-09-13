/**
 * Visual regression shoot for the VC site (local review tool, not part of the app).
 *
 * Usage:
 *   node _build/shoot.mjs [baseUrl] [outDir]
 *
 * Screenshots every route at four viewports, plus a reduced-motion pass and a
 * WeChat-WebView-ish pass. Captures are written to _build/shots/.
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? process.env.BASE ?? 'http://127.0.0.1:3000';
const OUT = process.argv[3] ?? ROOT + '_qa-output/shots';

const EXECUTABLE = process.env.CHROMIUM || '/usr/bin/chromium';

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/work', name: 'work-index' },
  { path: '/work/guge', name: 'work-guge' },
  { path: '/work/lihuahua', name: 'work-lihuahua' },
  { path: '/work/guanchao', name: 'work-guanchao' },
  { path: '/work/qinghua-zaojing', name: 'work-qinghua' },
  { path: '/lab', name: 'lab' },
];

const VIEWPORTS = [
  { name: 'desktop-1600', width: 1600, height: 1000, dsf: 1 },
  { name: 'desktop-2560', width: 2560, height: 1400, dsf: 1 },
  { name: 'tablet-1024', width: 1024, height: 1366, dsf: 1, touch: true },
  { name: 'mobile-390', width: 390, height: 844, dsf: 2, touch: true, isMobile: true },
];

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1800);
  // Walk the page so lazy media enters the viewport and reveals fire.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 130));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(900);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const report = [];
  const consoleErrors = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      // default timeout for actions in this context
      // (screenshots override it individually below)
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      hasTouch: Boolean(vp.touch),
      isMobile: Boolean(vp.isMobile),
      locale: 'zh-CN',
    });

    for (const route of ROUTES) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`console: ${m.text()}`);
      });

      const url = `${BASE}${route.path}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await settle(page);

        const file = join(OUT, `${route.name}__${vp.name}.png`);
        // Very long pages (mobile + fullPage) can exceed Chromium's capture
        // budget, so cap the captured height and raise the timeout.
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const MAX_H = 16000;
        await page.screenshot({
          path: file,
          timeout: 120000,
          fullPage: pageHeight <= MAX_H,
          ...(pageHeight > MAX_H
            ? { clip: { x: 0, y: 0, width: vp.width, height: MAX_H }, fullPage: true }
            : {}),
        });

        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          height: document.body.scrollHeight,
          hiddenReveals: document.querySelectorAll('[data-reveal]:not([data-revealed])').length,
          totalReveals: document.querySelectorAll('[data-reveal]').length,
          images: document.querySelectorAll('img').length,
          brokenImages: Array.from(document.querySelectorAll('img')).filter(
            (i) => i.complete && i.naturalWidth === 0,
          ).length,
          pendingPlates: Array.from(document.querySelectorAll('p')).filter(
            (p) => p.textContent?.trim() === 'ASSET PENDING',
          ).length,
        }));

        report.push({ route: route.path, viewport: vp.name, file, ...metrics, errors });
        if (errors.length) consoleErrors.push({ url, viewport: vp.name, errors });
      } catch (err) {
        report.push({ route: route.path, viewport: vp.name, error: String(err) });
      }
      await page.close();
    }

    await context.close();
  }

  // Reduced-motion pass on the home page.
  const rmContext = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    reducedMotion: 'reduce',
    locale: 'zh-CN',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await rmPage.waitForTimeout(2500);
  await rmPage.screenshot({ path: join(OUT, 'home__reduced-motion.png'), fullPage: true, timeout: 120000 });
  const rmHidden = await rmPage.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter(
        (el) => getComputedStyle(el).opacity === '0',
      ).length,
  );
  await rmContext.close();

  // WeChat WebView proxy: old-ish Chrome UA, no smooth scroll, small viewport.
  const wxContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.30(0x18001e2f) NetType/WIFI Language/zh_CN',
  });
  const wxPage = await wxContext.newPage();
  const wxErrors = [];
  wxPage.on('pageerror', (e) => wxErrors.push(String(e.message)));
  await wxPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await settle(wxPage);
  await wxPage.screenshot({ path: join(OUT, 'home__wechat-webview.png'), fullPage: false, timeout: 120000 });
  const wxMetrics = await wxPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  await wxContext.close();

  await browser.close();

  const summary = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    reducedMotionHiddenReveals: rmHidden,
    wechat: { ...wxMetrics, errors: wxErrors },
    consoleErrors,
    report,
  };
  await writeFile(join(OUT, '_report.json'), JSON.stringify(summary, null, 2));

  // Human-readable tail for the terminal.
  console.log(`\nScreenshots -> ${OUT}`);
  console.log(`reduced-motion hidden reveals: ${rmHidden} (must be 0)`);
  console.log(
    `wechat webview: scrollWidth=${wxMetrics.scrollWidth} clientWidth=${wxMetrics.clientWidth} (must be equal) errors=${wxErrors.length}`,
  );
  const overflow = report.filter((r) => r.scrollWidth && r.scrollWidth > r.clientWidth + 1);
  console.log(`horizontal overflow: ${overflow.length ? JSON.stringify(overflow.map((o) => `${o.route}@${o.viewport}`)) : 'none'}`);
  const pending = report.filter((r) => r.pendingPlates > 0);
  console.log(`routes with ASSET PENDING plates: ${pending.length ? JSON.stringify(pending.map((p) => `${p.route}@${p.viewport}(${p.pendingPlates})`)) : 'none'}`);
  const hidden = report.filter((r) => r.hiddenReveals > 0);
  console.log(`routes with un-revealed elements: ${hidden.length ? JSON.stringify(hidden.map((h) => `${h.route}@${h.viewport}(${h.hiddenReveals}/${h.totalReveals})`)) : 'none'}`);
  console.log(`console errors: ${consoleErrors.length}`);
  for (const e of consoleErrors.slice(0, 12)) {
    console.log(`  [${e.viewport}] ${e.url}\n    ${e.errors.join('\n    ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
