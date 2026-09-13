/**
 * Keeps the reveal animation alive without letting it smear during a fling.
 *
 * The reported defect was "快速滚动时字是一半加载出来的" — a 0.9s crossfade is not
 * motion when the content is flying past, it is unreadable half-transparent text.
 * `SmoothScrollProvider` sets `data-reveal-instant` on <html> while Lenis reports
 * a fling, and `app/globals.css` drops the transition while it is set.
 *
 * That mechanism fails in two opposite directions, and both are silent:
 *
 *   - **Too eager** — if the flag comes on at reading speed, every reveal on the
 *     site stops animating and nobody notices, because the page still "works".
 *   - **Never cleared** — if the fling ends on a fast frame and Lenis stops
 *     emitting `scroll`, the flag stays on and the reveal animation is gone for
 *     the rest of the session.
 *
 * So this asserts the transition duration directly, in all three states, rather
 * than trusting that the flag exists. It reads `transition-duration` off a
 * `rise`/`fade` element (transition on itself) **and** off a `masked` element's
 * mask child (transition on the child) — measuring only the first `[data-reveal]`
 * in the document reports `0s` at rest, because `masked` animates `clip-path` on
 * its child and has no transition of its own. That false negative is the reason
 * this note exists.
 *
 * Timing-sensitive by nature: it drives real wheel events. Run it on an idle
 * machine, and treat a single failure as worth a re-run before believing it.
 *
 * Usage: node scripts/qa/verify-reveal-instant.mjs
 *        BASE=http://127.0.0.1:4000 node scripts/qa/verify-reveal-instant.mjs
 */
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../_qa-output/reveal-instant');
const VIEWPORT = { width: 1440, height: 900 };

/** Lenis velocity is px/frame; this mirrors FLING_VELOCITY in SmoothScrollProvider. */
const results = [];
let failures = 0;
function check(ok, message, detail) {
  results.push({ ok, message, detail });
  console.log(`${ok ? '✓' : '✗'} ${message}${detail ? `  — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({ viewport: VIEWPORT, locale: 'zh-CN' });
const page = await context.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(1800);
await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);

const flagOn = () => page.evaluate(() => document.documentElement.dataset.revealInstant === 'true');
const durations = () =>
  page.evaluate(() => {
    const rise = document.querySelector("[data-reveal='rise'], [data-reveal='fade']");
    const mask = document.querySelector("[data-reveal='masked'] > [data-reveal-mask]");
    return {
      rise: rise ? getComputedStyle(rise).transitionDuration : null,
      mask: mask ? getComputedStyle(mask).transitionDuration : null,
    };
  });
/** Mid-flight evidence: opacity for rise/fade, clip-path inset for masked. */
const sampleProgress = () =>
  page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (!(rect.top < window.innerHeight - 60 && rect.bottom > 60)) return;
      const opacity = parseFloat(getComputedStyle(el).opacity);
      if (opacity > 0.02 && opacity < 0.92) out.push(`opacity ${opacity.toFixed(2)}`);
      const mask = el.querySelector('[data-reveal-mask]');
      if (!mask) return;
      const inset = getComputedStyle(mask).clipPath.match(/inset\(([^)]*)\)/);
      if (!inset) return;
      const percent = parseFloat((inset[1].split(/\s+/).pop() || '').replace('%', ''));
      if (percent > 3 && percent < 97) out.push(`clip ${percent.toFixed(0)}%`);
    });
    return out;
  });

const resting = await durations();
check(
  resting.rise === '0.9s, 1.044s' && resting.mask === '1.05s',
  'At rest every reveal variant has its transition',
  `rise/fade ${resting.rise}, masked child ${resting.mask}`,
);

// --- A fling collapses the transitions, and stops collapsing them afterwards ---
const during = page.evaluate(
  () =>
    new Promise((resolve) => {
      const seen = { rise: new Set(), mask: new Set() };
      const id = setInterval(() => {
        const rise = document.querySelector("[data-reveal='rise'], [data-reveal='fade']");
        const mask = document.querySelector("[data-reveal='masked'] > [data-reveal-mask]");
        if (rise) seen.rise.add(getComputedStyle(rise).transitionDuration);
        if (mask) seen.mask.add(getComputedStyle(mask).transitionDuration);
      }, 25);
      setTimeout(() => {
        clearInterval(id);
        resolve({ rise: [...seen.rise], mask: [...seen.mask] });
      }, 1600);
    }),
);
const flagDuring = page.evaluate(
  () =>
    new Promise((resolve) => {
      let seen = false;
      const observer = new MutationObserver(() => {
        if (document.documentElement.dataset.revealInstant === 'true') seen = true;
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reveal-instant'] });
      setTimeout(() => {
        observer.disconnect();
        resolve(seen);
      }, 1600);
    }),
);

// Deliberately short of the page bottom, so unrevealed content is left below for
// the reading-speed pass to reveal.
for (let i = 0; i < 3; i += 1) {
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(20);
}
const collapsed = await during;
const sawFlag = await flagDuring;
check(
  collapsed.rise.includes('0s') && collapsed.mask.includes('0s'),
  'During a fling the transitions collapse to 0s',
  `rise ${collapsed.rise.join('/')}, masked ${collapsed.mask.join('/')}`,
);
check(sawFlag, 'The fling sets data-reveal-instant');

await page.waitForTimeout(800);
const restored = await durations();
const flagAfter = await flagOn();
check(
  !flagAfter && restored.rise === '0.9s, 1.044s' && restored.mask === '1.05s',
  'Once the scroll settles the flag is gone and the transitions are back',
  `rise/fade ${restored.rise}, masked ${restored.mask}, flag ${flagAfter}`,
);

// --- Reading speed must not touch any of it ---
const slowFlag = page.evaluate(
  () =>
    new Promise((resolve) => {
      let seen = false;
      const observer = new MutationObserver(() => {
        if (document.documentElement.dataset.revealInstant === 'true') seen = true;
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reveal-instant'] });
      setTimeout(() => {
        observer.disconnect();
        resolve(seen);
      }, 7000);
    }),
);
const startY = await page.evaluate(() => Math.round(window.scrollY));
const progress = [];
for (let i = 0; i < 22; i += 1) {
  // ~110px every 280ms: measured at 8-30 px/frame on this site, well under the
  // 55 px/frame threshold, i.e. genuinely reading speed.
  await page.mouse.wheel(0, 110);
  await page.waitForTimeout(280);
  progress.push(...(await sampleProgress()));
}
const endY = await page.evaluate(() => Math.round(window.scrollY));
const flagAtReadingSpeed = await slowFlag;

check(!flagAtReadingSpeed, 'Reading-speed scrolling never sets the flag (the animation is not collateral damage)');
check(endY > startY + 400, 'The reading-speed pass actually moved the page', `scrollY ${startY} → ${endY}`);
check(
  progress.length > 0,
  'Reveals really did animate, i.e. mid-flight states were observed',
  `${progress.length} samples: ${[...new Set(progress)].slice(0, 8).join(', ')}`,
);

await page.waitForTimeout(700);
check(!(await flagOn()), 'No flag is left behind at the end');

await page.screenshot({ path: join(OUT, 'final.png') });
await writeFile(
  join(OUT, 'results.json'),
  `${JSON.stringify({ base: BASE, viewport: VIEWPORT, failures, results, scroll: { startY, endY } }, null, 2)}\n`,
);

await browser.close();
console.log(
  failures === 0
    ? `\n✅ 全部通过（证据 ${OUT}/results.json）`
    : `\n❌ ${failures} 项不合格（证据 ${OUT}/results.json）`,
);
process.exit(failures === 0 ? 0 : 1);
