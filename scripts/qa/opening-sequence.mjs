/**
 * 首屏开片取证。
 *
 * Usage:
 *   BASE=http://localhost:3220 node scripts/qa/opening-sequence.mjs
 *   BASE=http://localhost:3220 OPENING_OUT=_qa-output/opening/baseline-2aa90d8 \
 *     node scripts/qa/opening-sequence.mjs
 *
 * The script intentionally uses Playwright Clock rather than wall-clock sleeps.
 * The opening animation and the site's GSAP ticker both advance from rAF, and
 * Playwright 1.63's Clock API was verified to advance rAF + performance.now().
 */
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import { copyFile, mkdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE;
if (!BASE) {
  // A hardcoded default once pointed this harness at a stale dev server, and the
  // keyframes it produced were of a build nobody was working on.
  throw new Error('缺少 BASE。用法：BASE=http://127.0.0.1:3210 node scripts/qa/opening-sequence.mjs');
}
const OUT = resolve(process.env.OPENING_OUT ?? join(ROOT, '_qa-output/opening'));
const EXECUTABLE = process.env.CHROMIUM || '/usr/bin/chromium';
const execFileAsync = promisify(execFile);

const VIEWPORTS = [
  { name: 'desktop-1600', width: 1600, height: 1000, deviceScaleFactor: 1 },
  { name: 'mobile-390', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'tablet-1024', width: 1024, height: 1366, deviceScaleFactor: 1, hasTouch: true },
];

const INTRO_SELECTOR = [
  '[data-intro]',
  '[data-opening-intro]',
  '[data-intro-root]',
  '[data-intro-sequence]',
  '[data-intro-gate]',
  '[data-arrival]',
].join(',');

const PLAYING_SELECTOR = [
  '[data-intro="playing"]',
  '[data-intro-state="playing"]',
  '[data-intro-status="playing"]',
  '[data-intro-phase="playing"]',
].join(',');

const LAST_VC_SELECTOR = [
  '[data-intro-final-word]',
  '[data-intro-step="VC"]',
  '[data-intro-frame="VC"]',
  '[data-intro-label="VC"]',
  '[data-intro-word="VC"]',
  '[data-intro="VC"]',
].join(',');

await mkdir(OUT, { recursive: true });
await mkdir(join(OUT, 'failures'), { recursive: true });

const report = {
  base: BASE,
  generatedAt: new Date().toISOString(),
  timing: {
    method: 'playwright-clock',
    reason: 'Clock API verified to advance requestAnimationFrame and performance.now; GSAP ticker uses rAF.',
  },
  viewports: {},
  assertions: [],
  failures: [],
};

function recordAssertion(name, passed, detail = {}) {
  const item = { name, passed, ...detail };
  report.assertions.push(item);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail.message ? ` — ${detail.message}` : ''}`);
  if (!passed) report.failures.push(item);
  return passed;
}

async function installClock(page) {
  if (!page.clock || typeof page.clock.install !== 'function') {
    throw new Error('Playwright Clock API 不可用；本脚本要求可确定推进 rAF 的 Clock。');
  }
  await page.clock.install();
}

async function advance(page, milliseconds) {
  await page.clock.runFor(milliseconds);
}

async function openPage(browser, viewport, options = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.hasTouch),
    locale: 'zh-CN',
    ...options,
  });
  const page = await context.newPage();
  await installClock(page);
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('main').waitFor({ state: 'attached', timeout: 45000 });
  await advance(page, 100);
  return { context, page };
}

async function introSnapshot(page) {
  return page.evaluate(({ introSelector, playingSelector, lastVcSelector }) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const introNodes = Array.from(document.querySelectorAll(introSelector));
    const playingNodes = Array.from(document.querySelectorAll(playingSelector));
    const lastVcNodes = Array.from(document.querySelectorAll(lastVcSelector));
    const text = document.body.innerText || '';
    const renderedIntro = introNodes.some((element) => element !== document.documentElement);
    const gateIsPlaying = document.documentElement.getAttribute('data-intro') === 'playing';
    return {
      // data-intro="done" is a permanent gate marker on the redesigned site;
      // it must not make A/B look meaningful on a seen/disabled visit.
      hasIntro: renderedIntro || gateIsPlaying || (text.includes('你好') && text.includes('VC')),
      introCount: introNodes.length,
      playingCount: playingNodes.length,
      playingHidden: playingNodes.filter((element) => !visible(element)).length,
      playingVisible: playingNodes.filter(visible).length,
      lastVcVisible: lastVcNodes.some(visible),
      bodyHasHello: text.includes('你好'),
      bodyHasVc: text.includes('VC'),
    };
  }, { introSelector: INTRO_SELECTOR, playingSelector: PLAYING_SELECTOR, lastVcSelector: LAST_VC_SELECTOR });
}

/**
 * The word that has finished entering and has not started leaving.
 *
 * Frame A used to be taken after a fixed 350ms, which landed mid-flight: the
 * screenshot showed an empty mask and a counter reading `02 / 06`. Asking the
 * page which word is settled removes the guesswork — a word counts as settled
 * only while its text box sits entirely inside its mask.
 */
async function settledIntroWord(page) {
  return page.evaluate(() => {
    const words = Array.from(document.querySelectorAll('[data-intro-word]'));
    for (const word of words) {
      const mask = word.querySelector('.opening-intro-word-mask') ?? word;
      const text = word.querySelector('[data-intro-word-text]') ?? mask.firstElementChild;
      if (!text) continue;
      const style = getComputedStyle(text);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const maskRect = mask.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();
      if (textRect.height <= 0) continue;
      if (textRect.top >= maskRect.top - 1 && textRect.bottom <= maskRect.bottom + 1) {
        return { index: words.indexOf(word), text: (text.textContent ?? '').trim() };
      }
    }
    return null;
  });
}

async function heroSnapshot(page) {  return page.evaluate(() => {
    const hero = document.querySelector('[data-hero], [data-hero-root], #top');
    const headline = document.querySelector('[data-hero-wordmark], #top h1, main h1');
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0;
    };
    return {
      heroFound: Boolean(hero),
      heroTop: hero?.getBoundingClientRect().top ?? null,
      heroHeight: hero?.getBoundingClientRect().height ?? null,
      headlineFound: Boolean(headline),
      headlineText: headline?.textContent?.trim() ?? '',
      headlineVisible: visible(headline),
      headlineOpacity: headline ? getComputedStyle(headline).opacity : null,
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    };
  });
}

async function scrollTo(page, y) {
  await page.evaluate((target) => {
    window.scrollTo(0, target);
    document.documentElement.scrollTop = target;
    document.body.scrollTop = target;
  }, y);
  await advance(page, 250);
}

async function scrollHeroFraction(page, fraction) {
  const target = await page.evaluate((ratio) => {
    const hero = document.querySelector('[data-hero], [data-hero-root], #top');
    if (!hero) throw new Error('找不到首屏 Hero（期待 [data-hero]、[data-hero-root] 或 #top）');
    const rect = hero.getBoundingClientRect();
    return Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, rect.top + window.scrollY + rect.height * ratio));
  }, fraction);
  await scrollTo(page, target);
  return target;
}

async function scrollHeroDarkTransition(page) {
  const target = await page.evaluate(() => {
    const hero = document.querySelector('[data-hero], [data-hero-root], #top');
    if (!hero) throw new Error('找不到首屏 Hero');
    const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    const dark = Array.from(document.querySelectorAll('[data-tone="ink"]')).find((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      return top >= heroBottom - 2;
    });
    const darkTop = dark ? dark.getBoundingClientRect().top + window.scrollY : heroBottom;
    // Put the seam around the middle of the viewport so both tones are visible.
    return Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, darkTop - window.innerHeight * 0.52));
  });
  await scrollTo(page, target);
  return target;
}

async function saveFrame(page, viewportName, frameName) {
  const path = join(OUT, viewportName, `${frameName}.png`);
  await mkdir(join(OUT, viewportName), { recursive: true });
  await page.screenshot({ path, fullPage: false, timeout: 120000 });
  return path;
}

async function runOpeningFrames(browser, viewport) {
  const { context, page } = await openPage(browser, viewport);
  const viewReport = { frames: {}, video: null, hero: null };
  try {
    const intro = await introSnapshot(page);
    if (intro.hasIntro) {
      // Frame A must show a word that has arrived: step the deterministic clock
      // until the page reports one settled, rather than trusting a fixed delay.
      let settled = await settledIntroWord(page);
      for (let i = 0; i < 30 && !settled; i += 1) {
        await advance(page, 20);
        settled = await settledIntroWord(page);
      }
      viewReport.frames.A = {
        status: 'captured',
        path: await saveFrame(page, viewport.name, 'A'),
        settledWord: settled,
      };
      // Search for an explicitly labelled last-VC frame while advancing the
      // deterministic clock. If the implementation only exposes a generic
      // playing state, the final stable frame is the defensible fallback.
      let lastVc = await introSnapshot(page);
      for (let i = 0; i < 80 && !lastVc.lastVcVisible; i += 1) {
        await advance(page, 100);
        lastVc = await introSnapshot(page);
        if (lastVc.playingCount === 0 && i > 8) break;
      }
      viewReport.frames.B = {
        status: 'captured',
        path: await saveFrame(page, viewport.name, 'B'),
        marker: lastVc.lastVcVisible ? 'explicit-last-vc-marker' : 'final-intro-state-fallback',
      };
    } else {
      viewReport.frames.A = { status: 'skipped', reason: 'no-intro' };
      viewReport.frames.B = { status: 'skipped', reason: 'no-intro' };
      console.log(`SKIP ${viewport.name} A/B — skipped: no-intro`);
    }

    // Run long enough for the full entrance timeline and the client profile to
    // settle. This is fake time, not an arbitrary wall-clock sleep.
    await advance(page, 5000);
    const hero = await heroSnapshot(page);
    const introAfter = await introSnapshot(page);
    viewReport.hero = { ...hero, introAfter };
    if (!hero.heroFound || !hero.headlineFound || !hero.headlineVisible || !hero.headlineText) {
      throw new Error(`Hero 未进入稳态：${JSON.stringify(hero)}`);
    }
    viewReport.frames.C = { status: 'captured', path: await saveFrame(page, viewport.name, 'C') };

    await scrollHeroFraction(page, 0.4);
    viewReport.frames.D = { status: 'captured', path: await saveFrame(page, viewport.name, 'D'), scroll: await heroSnapshot(page) };

    await scrollHeroDarkTransition(page);
    viewReport.frames.E = { status: 'captured', path: await saveFrame(page, viewport.name, 'E'), scroll: await heroSnapshot(page) };
  } finally {
    await context.close();
  }
  return viewReport;
}

async function runOpeningVideo(browser, viewport) {
  const videoDir = await mkdtemp(join(tmpdir(), 'vc-opening-video-'));
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.hasTouch),
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await installClock(page);

  // Playwright's recordVideo needs a separately cached Playwright ffmpeg
  // binary. This machine has system ffmpeg, so use the equivalent CDP
  // screencast path and encode its JPEG frames with the PATH-resolved ffmpeg.
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    void cdp.send('Page.screencastFrameAck', { sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1 });

  const advanceAndFlush = async (milliseconds) => {
    const step = 100;
    for (let elapsed = 0; elapsed < milliseconds; elapsed += step) {
      await advance(page, Math.min(step, milliseconds - elapsed));
      // Let CDP deliver the screencast frame generated by this fake-time step.
      await new Promise((resolveImmediate) => setImmediate(resolveImmediate));
    }
  };

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('main').waitFor({ state: 'attached', timeout: 45000 });
  await advanceAndFlush(100);
  await advanceAndFlush(6000);
  await scrollHeroFraction(page, 0.4);
  await scrollHeroDarkTransition(page);
  await advanceAndFlush(500);
  await new Promise((resolveImmediate) => setImmediate(resolveImmediate));
  await cdp.send('Page.stopScreencast');

  if (frames.length < 2) throw new Error(`CDP screencast 没有收到足够帧：${frames.length}`);
  for (let index = 0; index < frames.length; index += 1) {
    await writeFile(join(videoDir, `frame-${String(index + 1).padStart(6, '0')}.jpg`), frames[index]);
  }
  const outputPath = join(OUT, `opening-${viewport.name}.webm`);
  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-framerate',
    '30',
    '-i',
    join(videoDir, 'frame-%06d.jpg'),
    '-c:v',
    'libvpx-vp9',
    '-pix_fmt',
    'yuv420p',
    outputPath,
  ]);
  await context.close();
  await rm(videoDir, { recursive: true, force: true });
  return outputPath;
}

async function captureFailure(page, name) {
  const path = join(OUT, 'failures', `${name}.png`);
  try {
    await page.screenshot({ path, fullPage: false, timeout: 120000 });
    return path;
  } catch {
    return null;
  }
}

async function runReducedMotion(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page } = await openPage(browser, viewport, { reducedMotion: 'reduce' });
  try {
    await advance(page, 5000);
    const result = await page.evaluate(({ playingSelector }) => {
      const headline = document.querySelector('[data-hero-wordmark], #top h1, main h1');
      const style = headline ? getComputedStyle(headline) : null;
      const hiddenPlaying = Array.from(document.querySelectorAll(playingSelector)).filter((element) => {
        const computed = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0 || rect.width === 0 || rect.height === 0;
      }).length;
      return {
        headlineText: headline?.textContent?.trim() ?? '',
        headlineOpacity: style?.opacity ?? null,
        headlineVisible: Boolean(headline && style && style.opacity !== '0' && style.visibility !== 'hidden'),
        hiddenPlaying,
        playingCount: document.querySelectorAll(playingSelector).length,
      };
    }, { playingSelector: PLAYING_SELECTOR });
    const passed = Boolean(result.headlineText && result.headlineVisible && Number(result.headlineOpacity) > 0 && result.hiddenPlaying === 0);
    const failurePath = passed ? null : await captureFailure(page, 'reduced-motion');
    recordAssertion('reduced-motion', passed, { result, failurePath, message: passed ? undefined : '首屏文字不可见或 intro playing 卡在隐形态' });
  } finally {
    await context.close();
  }
}

async function runNoJavaScript(browser) {
  const viewport = VIEWPORTS[0];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    locale: 'zh-CN',
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const result = await page.evaluate(() => {
      const body = document.body;
      const headline = document.querySelector('h1, [role="heading"]');
      const text = body?.innerText?.trim() ?? '';
      const rect = headline?.getBoundingClientRect();
      return {
        textLength: text.length,
        headlineText: headline?.textContent?.trim() ?? '',
        headlineBox: rect ? { width: rect.width, height: rect.height } : null,
      };
    });
    const passed = result.textLength > 30 && Boolean(result.headlineText) && Boolean(result.headlineBox && result.headlineBox.width > 0 && result.headlineBox.height > 0);
    const failurePath = passed ? null : await captureFailure(page, 'no-javascript');
    recordAssertion('no-javascript', passed, { result, failurePath, message: passed ? undefined : '无 JS 页面白屏或首屏不可读' });
  } finally {
    await context.close();
  }
}

async function runSecondVisit(browser) {
  const viewport = VIEWPORTS[0];
  const { context, page } = await openPage(browser, viewport);
  try {
    await page.evaluate(() => sessionStorage.setItem('vc-intro-seen', '1'));
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('main').waitFor({ state: 'attached', timeout: 45000 });
    await advance(page, 5000);
    const result = await page.evaluate(({ playingSelector }) => {
      const headline = document.querySelector('[data-hero-wordmark], #top h1, main h1');
      const style = headline ? getComputedStyle(headline) : null;
      const playing = document.querySelectorAll(playingSelector).length;
      return {
        seen: sessionStorage.getItem('vc-intro-seen'),
        headlineText: headline?.textContent?.trim() ?? '',
        headlineOpacity: style?.opacity ?? null,
        headlineVisible: Boolean(headline && style && style.opacity !== '0' && style.visibility !== 'hidden'),
        playing,
      };
    }, { playingSelector: PLAYING_SELECTOR });
    const passed = result.seen === '1' && Boolean(result.headlineText) && result.headlineVisible && Number(result.headlineOpacity) > 0 && result.playing === 0;
    const failurePath = passed ? null : await captureFailure(page, 'second-visit');
    recordAssertion('same-tab-second-visit', passed, { result, failurePath, message: passed ? undefined : '二次访问仍在播片头或首屏未稳态可见' });
  } finally {
    await context.close();
  }
}

async function analyzeSignalPixels(path) {
  const png = PNG.sync.read(await readFile(path));
  const total = png.width * png.height;
  const mask = new Uint8Array(total);
  let colorful = 0;
  let signalRed = 0;
  const target = [224, 64, 42];
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = (y * png.width + x) * 4;
      const r = png.data[pixel];
      const g = png.data[pixel + 1];
      const b = png.data[pixel + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const colorfulPixel = max - min >= 24 && (max === 0 || (max - min) / max >= 0.2);
      if (!colorfulPixel) continue;
      mask[y * png.width + x] = 1;
      colorful += 1;
      const distance = Math.hypot(r - target[0], g - target[1], b - target[2]);
      if (distance <= 105 && r > g * 1.45 && r > b * 1.45) signalRed += 1;
    }
  }

  let components = 0;
  const queue = new Int32Array(total);
  for (let index = 0; index < total; index += 1) {
    if (!mask[index]) continue;
    components += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = index;
    mask[index] = 0;
    while (head < tail) {
      const current = queue[head++];
      const x = current % png.width;
      const y = Math.floor(current / png.width);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
          const neighbor = ny * png.width + nx;
          if (!mask[neighbor]) continue;
          mask[neighbor] = 0;
          queue[tail++] = neighbor;
        }
      }
    }
  }

  const ratio = colorful / total;
  const redDominance = colorful === 0 ? 1 : signalRed / colorful;
  return { width: png.width, height: png.height, colorful, colorfulRatio: ratio, signalRed, redDominance, components };
}

async function runSignalColor(browser, framePath) {
  const result = await analyzeSignalPixels(framePath);
  const passed = result.colorfulRatio <= 0.025 && result.components <= 1 && result.redDominance >= 0.8;
  let failurePath = null;
  if (!passed) {
    failurePath = join(OUT, 'failures', 'signal-red.png');
    await copyFile(framePath, failurePath);
  }
  recordAssertion('signal-red-single-anchor-pixels', passed, {
    result,
    failurePath,
    message: passed ? undefined : '首屏彩色像素过多、分散，或不是唯一 signal-red 锚点',
  });
}

async function runCheckSafely(name, task) {
  try {
    await task();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    recordAssertion(name, false, { message });
  }
}

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});

try {
  for (const viewport of VIEWPORTS) {
    try {
      const frames = await runOpeningFrames(browser, viewport);
      report.viewports[viewport.name] = frames;
      console.log(`FRAMES ${viewport.name} -> ${JSON.stringify(frames.frames)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.viewports[viewport.name] = { error: message };
      report.failures.push({ name: `frames-${viewport.name}`, passed: false, message });
      console.error(`FAIL frames-${viewport.name} — ${message}`);
    }
  }

  for (const viewport of VIEWPORTS.filter((item) => item.name !== 'tablet-1024')) {
    try {
      const video = await runOpeningVideo(browser, viewport);
      report.viewports[viewport.name] = { ...(report.viewports[viewport.name] ?? {}), video };
      console.log(`VIDEO ${viewport.name} -> ${video}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.failures.push({ name: `video-${viewport.name}`, passed: false, message });
      console.error(`FAIL video-${viewport.name} — ${message}`);
    }
  }

  await runCheckSafely('reduced-motion', () => runReducedMotion(browser));
  await runCheckSafely('no-javascript', () => runNoJavaScript(browser));
  await runCheckSafely('same-tab-second-visit', () => runSecondVisit(browser));

  const desktopC = report.viewports['desktop-1600']?.frames?.C?.path;
  if (desktopC) await runCheckSafely('signal-red-single-anchor-pixels', () => runSignalColor(browser, desktopC));
  else recordAssertion('signal-red-single-anchor-pixels', false, { message: '没有 desktop C 帧可供像素取证' });
} finally {
  await browser.close();
}

report.summary = {
  passed: report.failures.length === 0,
  assertionPassed: report.assertions.filter((item) => item.passed).length,
  assertionFailed: report.assertions.filter((item) => !item.passed).length,
  failures: report.failures.length,
};
await writeFile(join(OUT, 'opening-report.json'), JSON.stringify(report, null, 2));
console.log(`REPORT ${join(OUT, 'opening-report.json')}`);
console.log(`SUMMARY ${report.summary.assertionPassed} passed, ${report.summary.assertionFailed} failed; ${report.failures.length} total failures`);
if (report.failures.length > 0) process.exitCode = 1;
