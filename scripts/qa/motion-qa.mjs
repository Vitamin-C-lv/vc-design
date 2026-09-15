import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3002';
const OUT = process.argv[3] ?? new URL('../../_qa-output/', import.meta.url).pathname;
const EXECUTABLE = process.env.CHROMIUM || '/usr/bin/chromium';

await mkdir(OUT, { recursive: true });

async function openPage(browser, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    locale: 'zh-CN',
    ...options,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(700);
  return { context, page };
}

async function sectionShot(browser, name, selector, viewport, options = {}) {
  const { context, page } = await openPage(browser, viewport, options);
  await page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!element) throw new Error(`Missing ${targetSelector}`);
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 72);
  }, selector);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false, timeout: 120000 });
  await context.close();
}

async function revealEvidence(browser, name, selector, viewport) {
  const { context, page } = await openPage(browser, viewport);
  const target = page.locator(selector).first();
  const box = await target.boundingBox();
  if (!box) throw new Error(`No bounding box for ${selector}`);

  await page.evaluate((top) => window.scrollTo(0, top + window.scrollY - window.innerHeight - 100), box.y);
  await page.waitForTimeout(180);
  const before = await target.evaluate((el) => ({
    revealed: el.getAttribute('data-revealed'),
    opacity: getComputedStyle(el).opacity,
    transform: getComputedStyle(el).transform,
    childTransform: el.firstElementChild ? getComputedStyle(el.firstElementChild).transform : null,
    clip: el.firstElementChild ? getComputedStyle(el.firstElementChild).clipPath : null,
  }));
  await page.screenshot({ path: `${OUT}/${name}-before.png`, fullPage: false, timeout: 120000 });

  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  const after = await target.evaluate((el) => ({
    revealed: el.getAttribute('data-revealed'),
    opacity: getComputedStyle(el).opacity,
    transform: getComputedStyle(el).transform,
    childTransform: el.firstElementChild ? getComputedStyle(el.firstElementChild).transform : null,
    clip: el.firstElementChild ? getComputedStyle(el.firstElementChild).clipPath : null,
  }));
  await page.screenshot({ path: `${OUT}/${name}-after.png`, fullPage: false, timeout: 120000 });
  console.log(JSON.stringify({ name, before, after }));
  await context.close();
}

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});

const desktop = { width: 1600, height: 1000 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const tablet = { width: 1024, height: 1366, deviceScaleFactor: 1, hasTouch: true };

await sectionShot(browser, 'featured-desktop-1600', '#work', desktop);
await sectionShot(browser, 'lab-desktop-1600', '#lab', desktop);
await sectionShot(browser, 'more-work-desktop-1600', '#more-work', desktop);
await sectionShot(browser, 'capabilities-desktop-1600', '#capabilities', desktop);
await sectionShot(browser, 'approach-desktop-1600', '#approach', desktop);
await sectionShot(browser, 'featured-mobile-390', '#work', mobile);
await sectionShot(browser, 'lab-mobile-390', '#lab', mobile);
await sectionShot(browser, 'featured-tablet-1024', '#work', tablet);

await revealEvidence(browser, 'featured-title-reveal', '#work [data-reveal="masked"]', desktop);
await revealEvidence(browser, 'lab-rule-reveal', '#lab [data-reveal="rule"]', desktop);

const { context: reducedContext, page: reducedPage } = await openPage(browser, desktop, { reducedMotion: 'reduce' });
await reducedPage.evaluate(() => {
  const element = document.querySelector('#lab');
  if (element) window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 72);
});
await reducedPage.waitForTimeout(250);
await reducedPage.screenshot({ path: `${OUT}/lab-reduced-motion-1600.png`, fullPage: false, timeout: 120000 });
const reduced = await reducedPage.evaluate(() => ({
  hidden: Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => getComputedStyle(el).opacity === '0').length,
  rules: Array.from(document.querySelectorAll('[data-reveal="rule"] > [data-reveal-rule]')).filter((el) => getComputedStyle(el).transform !== 'none').length,
}));
console.log(JSON.stringify({ reduced }));
await reducedContext.close();

const { context: noJsContext, page: noJsPage } = await openPage(browser, desktop, { javaScriptEnabled: false });
await noJsPage.locator('#work').screenshot({ path: `${OUT}/featured-no-js-1600.png`, timeout: 120000 });
console.log(JSON.stringify({ noJs: 'captured server-rendered #work without browser JavaScript' }));
await noJsContext.close();

await browser.close();
