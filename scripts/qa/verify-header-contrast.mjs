/**
 * Header control contrast gate.
 *
 * Regression this exists for: the language switch and the mobile menu button had
 * no tone class, so they inherited the body's bone-white colour and rendered
 * white-on-white over every light band.
 *
 * Measures real rendered pixels (not computed styles) for every visible header
 * control, over a light band and over a dark one, on phone and desktop.
 * Exits non-zero if any control is below 4.5:1.
 */
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const requireQa = createRequire(join(ROOT, 'scripts/qa/package.json'));
const { chromium } = requireQa('playwright-core');
const sharp = requireQa('sharp');

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const CHROMIUM = process.env.CHROMIUM ?? '/usr/bin/chromium';
const MIN_CONTRAST = 4.5;

const VIEWPORTS = [
  { name: 'phone-390', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  { name: 'desktop-1600', width: 1600, height: 1000, deviceScaleFactor: 1, isMobile: false },
];
const ROUTES = ['/', '/work', '/lab'];

function luminance(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(first, second) {
  return (Math.max(luminance(first), luminance(second)) + 0.05) /
    (Math.min(luminance(first), luminance(second)) + 0.05);
}

async function measureHeader(page, viewport, state) {
  const controls = await page.evaluate(() => {
    return [...document.querySelectorAll('[data-site-header] a, [data-site-header] button')]
      .flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (
          rect.width < 2 ||
          rect.height < 2 ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0
        ) return [];
        return [{
          label: element.getAttribute('aria-label') || element.textContent?.trim().replace(/\s+/g, ' ') || '?',
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }];
      });
  });

  const screenshot = await page.screenshot();
  const results = [];
  for (const control of controls) {
    const pixels = await sharp(screenshot)
      .extract({
        left: Math.round(control.x * viewport.deviceScaleFactor),
        top: Math.round(control.y * viewport.deviceScaleFactor),
        width: Math.round(control.width * viewport.deviceScaleFactor),
        height: Math.round(control.height * viewport.deviceScaleFactor),
      })
      .greyscale()
      .raw()
      .toBuffer();

    let darkest = 255;
    let lightest = 0;
    for (const pixel of pixels) {
      darkest = Math.min(darkest, pixel);
      lightest = Math.max(lightest, pixel);
    }

    results.push({
      ...control,
      state,
      contrast: Number(contrastRatio(darkest, lightest).toFixed(2)),
      darkest,
      lightest,
    });
  }
  return results;
}

async function assertTone(page, expected, state) {
  const actual = await page.locator('[data-site-header]').getAttribute('data-tone');
  if (actual !== expected) {
    throw new Error(`Expected ${expected} header tone in ${state} state, received ${actual}`);
  }
}

async function scrollToDarkBand(page) {
  const scrollY = await page.evaluate(() => {
    const dark = [...document.querySelectorAll('[data-tone="ink"]')]
      .filter((element) => element.matches('[data-site-header]') === false)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + window.scrollY, height: rect.height };
      })
      .filter(({ top, height }) => top > 120 && height > 400)
      .sort((first, second) => first.top - second.top)[0];
    return dark ? dark.top + 10 : null;
  });
  if (scrollY === null) throw new Error('No dark tone section found');
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(900);
}

const failures = [];
const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });

try {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
        isMobile: viewport.isMobile,
        hasTouch: viewport.isMobile,
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
        // `/` opens with the greeting sequence and the header only enters once it
        // hands over. Sampling at a fixed 1200ms caught the header mid-entrance
        // and reported every control as 1:1 — uniform paper, because the control
        // boxes were still empty. Wait for the gate instead of guessing.
        //
        // The wait is 2000ms, not 1200ms: the header now deliberately arrives
        // 0.45s *after* the hand-over and takes 0.75s to get there, so a sample
        // taken at 1200ms catches it at ~92% opacity and measures the tween
        // instead of the resting state.
        await page
          .waitForFunction(
            () => document.documentElement.getAttribute('data-intro') !== 'playing',
            null,
            { timeout: 10000 },
          )
          .catch(() => {});
        await page.waitForTimeout(2000);

        await assertTone(page, 'paper', 'light-band');
        const light = await measureHeader(page, viewport, 'light-band');
        for (const result of light) {
          const ok = result.contrast >= MIN_CONTRAST;
          console.log(`${ok ? 'ok  ' : 'FAIL'} ${viewport.name} ${route} light ${result.label}: ${result.contrast}:1 (dark ${result.darkest} light ${result.lightest})`);
          if (!ok) failures.push(`${viewport.name} ${route} light ${result.label}: ${result.contrast}:1`);
        }

        await scrollToDarkBand(page);
        await assertTone(page, 'ink', 'dark-band');
        const dark = await measureHeader(page, viewport, 'dark-band');
        for (const result of dark) {
          const ok = result.contrast >= MIN_CONTRAST;
          console.log(`${ok ? 'ok  ' : 'FAIL'} ${viewport.name} ${route} dark  ${result.label}: ${result.contrast}:1 (dark ${result.darkest} light ${result.lightest})`);
          if (!ok) failures.push(`${viewport.name} ${route} dark ${result.label}: ${result.contrast}:1`);
        }
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\nCONTRAST GATE FAILED (${failures.length}):\n  ${failures.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log('\nCONTRAST GATE PASSED: every visible header control >= 4.5:1 on light and dark bands');
}
