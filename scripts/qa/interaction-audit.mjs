import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:3200';
const OUT = ROOT + '_qa-output/interaction-audit';
const SHOTS = OUT + '/screenshots';
const CHROMIUM = process.env.CHROMIUM || '/usr/bin/chromium';
const routes = ['/', '/work', '/work/guge', '/work/lihuahua', '/work/guanchao', '/work/qinghua-zaojing', '/lab'];

await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const observations = {
  base: BASE,
  routes,
  routeRuns: [],
  contact: null,
  guanchao: null,
  particle: null,
  videos: null,
  keyboard: [],
  language: [],
};

function safeName(route) {
  return route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '');
}

function attachDiagnostics(page, route, bucket) {
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.push({ route, type: 'console.error', text: message.text() });
  });
  page.on('pageerror', (error) => bucket.push({ route, type: 'pageerror', text: String(error?.stack || error?.message || error) }));
  page.on('requestfailed', (request) => bucket.push({ route, type: 'requestfailed', text: request.method() + ' ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown failure') }));
  page.on('response', (response) => {
    if (response.status() >= 400) bucket.push({ route, type: 'http.' + response.status(), text: response.status() + ' ' + response.url() });
  });
}

async function newPage({ reducedMotion = 'no-preference', route } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'zh-CN',
    reducedMotion,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  attachDiagnostics(page, route, errors);
  await page.addInitScript(() => {
    try { sessionStorage.setItem('vc-intro-seen', '1'); } catch {}
  });
  return { context, page, errors };
}

async function open(page, route, wait = 1200) {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('load', { timeout: 45000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (wait) await page.waitForTimeout(wait);
}

async function visible(locator) {
  return (await locator.count()) > 0 && await locator.first().isVisible().catch(() => false);
}

async function routeDiagnostics() {
  for (const route of routes) {
    const run = { route, errors: [], state: null };
    const { context, page, errors } = await newPage({ route });
    try {
      await open(page, route, 1600);
      run.state = await page.evaluate(() => ({
        url: location.href,
        title: document.title,
        lang: document.documentElement.lang,
        dataLang: document.documentElement.dataset.lang,
        textLength: document.body?.innerText?.length || 0,
      }));
      await page.screenshot({ path: SHOTS + '/route-' + safeName(route) + '.png', fullPage: true });
    } catch (error) {
      run.state = { exception: String(error?.stack || error) };
    }
    run.errors = errors;
    observations.routeRuns.push(run);
    await context.close();
  }
}

async function contactCheck() {
  const result = { initialButton: null, selected: null, copied: null, emptySubmit: null, reducedMotion: null, errors: [], screenshot: null };
  const { context, page, errors } = await newPage({ route: '/' });
  result.errors = errors;
  try {
    await open(page, '/', 1300);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    result.initialButton = await page.locator('#contact button[type="submit"]').count();
    const intent = page.locator('#contact [role="radio"]').first();
    await intent.click();
    await page.locator('#brief-detail').waitFor({ state: 'visible', timeout: 10000 });
    result.selected = {
      intent: await intent.innerText(),
      prefill: await page.locator('#brief-detail').inputValue(),
      button: await page.locator('#contact button[type="submit"]').innerText(),
    };
    await page.locator('#brief-detail').fill('测试需求：交互审查复制链路。');
    await page.locator('#contact button[type="submit"]').click();
    await page.waitForTimeout(450);
    result.copied = {
      status: await page.locator('#contact [role="status"]').innerText().catch(() => null),
      button: await page.locator('#contact button[type="submit"]').innerText(),
      clipboard: await page.evaluate(() => navigator.clipboard.readText()).catch((error) => 'READ_FAILED: ' + error.message),
    };
    await page.locator('#brief-detail').fill('');
    await page.locator('#contact button[type="submit"]').click();
    await page.waitForTimeout(450);
    result.emptySubmit = {
      status: await page.locator('#contact [role="status"]').innerText().catch(() => null),
      clipboard: await page.evaluate(() => navigator.clipboard.readText()).catch((error) => 'READ_FAILED: ' + error.message),
    };
    result.screenshot = 'vc-site/_qa-output/interaction-audit/screenshots/contact-after-submit.png';
    await page.screenshot({ path: ROOT + '_qa-output/interaction-audit/screenshots/contact-after-submit.png', fullPage: false });
  } catch (error) {
    result.exception = String(error?.stack || error);
  }
  await context.close();

  const reduced = await newPage({ route: '/', reducedMotion: 'reduce' });
  try {
    await open(reduced.page, '/', 1000);
    await reduced.page.locator('#contact').scrollIntoViewIfNeeded();
    await reduced.page.locator('#contact [role="radio"]').first().click();
    result.reducedMotion = await reduced.page.locator('#brief-detail').evaluate((el) => ({
      animationDuration: getComputedStyle(el).animationDuration,
      transitionDuration: getComputedStyle(el).transitionDuration,
      htmlReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }));
    result.errors.push(...reduced.errors);
  } catch (error) {
    result.reducedMotion = { exception: String(error?.stack || error) };
    result.errors.push(...reduced.errors);
  }
  await reduced.context.close();
  observations.contact = result;
}

async function guanchaoCheck() {
  const result = { embedded: {}, direct: {}, errors: [] };
  const { context, page, errors } = await newPage({ route: '/work/guanchao' });
  try {
    await open(page, '/work/guanchao', 1000);
    const iframe = page.locator('iframe').first();
    await iframe.waitFor({ state: 'attached', timeout: 20000 });
    await iframe.scrollIntoViewIfNeeded();
    const before = await iframe.evaluate((el) => ({
      src: el.getAttribute('src'),
      posterVisible: Boolean(el.parentElement?.querySelector('img') && getComputedStyle(el.parentElement.querySelector('img')).opacity !== '0'),
      iframeOpacity: getComputedStyle(el).opacity,
      loading: el.getAttribute('loading'),
    }));
    await page.waitForTimeout(9000);
    const after = await iframe.evaluate((el) => ({
      posterVisible: Boolean(el.parentElement?.querySelector('img') && getComputedStyle(el.parentElement.querySelector('img')).opacity !== '0'),
      iframeOpacity: getComputedStyle(el).opacity,
      frameLoaded: Boolean(el.contentDocument?.body),
    }));
    const frame = page.frames().find((candidate) => candidate !== page.mainFrame() && candidate.url().includes('/guanchao-live'));
    let frameState = null;
    if (frame) {
      frameState = await frame.evaluate(() => {
        const scrollers = [...document.querySelectorAll('*')]
          .filter((el) => el.scrollHeight > el.clientHeight + 20 && ['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
          .slice(0, 8)
          .map((el) => ({ tag: el.tagName, className: String(el.className), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
        const beforeY = window.scrollY;
        window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight));
        return {
          url: location.href,
          bodyTextLength: document.body?.innerText?.length || 0,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: innerHeight,
          beforeY,
          afterY: window.scrollY,
          scrollers,
        };
      }).catch((error) => ({ exception: String(error?.stack || error) }));
    }
    result.embedded = { before, after, frameState, screenshot: 'vc-site/_qa-output/interaction-audit/screenshots/guanchao-embedded.png' };
    await page.screenshot({ path: SHOTS + '/guanchao-embedded.png', fullPage: false });
  } catch (error) {
    result.embedded.exception = String(error?.stack || error);
  }
  result.errors.push(...errors);
  await context.close();

  const direct = await newPage({ route: '/guanchao-live/' });
  try {
    await open(direct.page, '/guanchao-live/', 3500);
    result.direct = await direct.page.evaluate(() => {
      const chineseReport = [...document.querySelectorAll('*')].filter((el) => el.textContent?.includes('本周市场周报已更新'));
      const candidates = [...document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="overlay"], [class*="popup"], [class*="notice"]')]
        .filter((el) => {
          const s = getComputedStyle(el); const r = el.getBoundingClientRect();
          return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { tag: el.tagName, className: String(el.className), text: (el.innerText || '').slice(0, 160), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), position: getComputedStyle(el).position, zIndex: getComputedStyle(el).zIndex };
        });
      return {
        url: location.href,
        bodyTextLength: document.body?.innerText?.length || 0,
        reportTextMatches: chineseReport.map((el) => (el.innerText || el.textContent || '').slice(0, 180)).slice(0, 5),
        visibleOverlayCandidates: candidates.slice(0, 20),
      };
    });
    result.direct.screenshot = 'vc-site/_qa-output/interaction-audit/screenshots/guanchao-live-direct.png';
    await direct.page.screenshot({ path: SHOTS + '/guanchao-live-direct.png', fullPage: false });
  } catch (error) {
    result.direct.exception = String(error?.stack || error);
  }
  result.errors.push(...direct.errors);
  await direct.context.close();
  observations.guanchao = result;
}

async function particleCheck() {
  const result = { normal: {}, reduced: {}, errors: [] };
  const normal = await newPage({ route: '/work/qinghua-zaojing' });
  try {
    await open(normal.page, '/work/qinghua-zaojing', 1200);
    const vessel = normal.page.locator('#live-particle');
    await vessel.scrollIntoViewIfNeeded();
    await normal.page.waitForTimeout(14000);
    result.normal.initial = await normal.page.evaluate(() => {
      const root = document.querySelector('#live-particle');
      const canvas = root?.querySelector('canvas'); const img = root?.querySelector('img');
      return { canvas: Boolean(canvas), canvasSize: canvas ? canvas.width + 'x' + canvas.height : null, fallbackOpacity: img ? getComputedStyle(img).opacity : null, fallbackAriaHidden: img?.getAttribute('aria-hidden') ?? null, title: root?.querySelector('h2')?.innerText, stage: root?.querySelector('[data-qinghua-vessel]')?.getAttribute('data-qinghua-stage') };
    });
    const tabs = normal.page.locator('#live-particle [role="tab"]');
    const count = await tabs.count(); const states = [];
    for (const index of [0, 2, 4, 6]) {
      if (index >= count) continue;
      await tabs.nth(index).click(); await normal.page.waitForTimeout(900);
      states.push(await normal.page.evaluate(() => {
        const root = document.querySelector('#live-particle');
        return { stage: root?.querySelector('[data-qinghua-vessel]')?.getAttribute('data-qinghua-stage'), title: root?.querySelector('h2')?.innerText, note: root?.querySelector('[aria-live="polite"]')?.innerText, selected: root?.querySelector('[role="tab"][aria-selected="true"]')?.innerText };
      }));
    }
    await tabs.first().focus(); await normal.page.keyboard.press('ArrowDown');
    const keyboardStage = await normal.page.evaluate(() => ({ focused: document.activeElement?.getAttribute('role') === 'tab', selected: document.querySelector('#live-particle [role="tab"][aria-selected="true"]')?.innerText, stage: document.querySelector('#live-particle [data-qinghua-vessel]')?.getAttribute('data-qinghua-stage') }));
    result.normal = { ...result.normal, tabCount: count, states, keyboardStage, screenshot: 'vc-site/_qa-output/interaction-audit/screenshots/particle-after-stage-switch.png' };
    await normal.page.screenshot({ path: SHOTS + '/particle-after-stage-switch.png', fullPage: false });
  } catch (error) {
    result.normal.exception = String(error?.stack || error);
  }
  result.errors.push(...normal.errors); await normal.context.close();

  const reduced = await newPage({ route: '/work/qinghua-zaojing', reducedMotion: 'reduce' });
  try {
    await open(reduced.page, '/work/qinghua-zaojing', 1200);
    await reduced.page.locator('#live-particle').scrollIntoViewIfNeeded(); await reduced.page.waitForTimeout(5000);
    result.reduced = await reduced.page.evaluate(() => {
      const root = document.querySelector('#live-particle'); const img = root?.querySelector('img'); const canvas = root?.querySelector('canvas');
      return { mediaReduce: matchMedia('(prefers-reduced-motion: reduce)').matches, canvas: Boolean(canvas), fallbackOpacity: img ? getComputedStyle(img).opacity : null, fallbackAriaHidden: img?.getAttribute('aria-hidden') ?? null, imageComplete: img?.complete ?? null, imageNaturalSize: img ? img.naturalWidth + 'x' + img.naturalHeight : null, stage: root?.querySelector('[data-qinghua-vessel]')?.getAttribute('data-qinghua-stage') };
    });
    result.reduced.screenshot = 'vc-site/_qa-output/interaction-audit/screenshots/particle-reduced-motion.png';
    await reduced.page.screenshot({ path: SHOTS + '/particle-reduced-motion.png', fullPage: false });
  } catch (error) {
    result.reduced.exception = String(error?.stack || error);
  }
  result.errors.push(...reduced.errors); await reduced.context.close(); observations.particle = result;
}

async function videoCheck() {
  const result = { videos: [], errors: [] };
  const { context, page, errors } = await newPage({ route: '/work/guge' });
  try {
    await open(page, '/work/guge', 1200); const videos = page.locator('video'); const count = await videos.count();
    for (let index = 0; index < count; index++) {
      const video = videos.nth(index); await video.scrollIntoViewIfNeeded(); await page.waitForTimeout(1100);
      const before = await video.evaluate((v) => ({ poster: v.getAttribute('poster'), posterLoaded: Boolean(v.poster), readyState: v.readyState, currentSrc: v.currentSrc, paused: v.paused, networkState: v.networkState, error: v.error ? { code: v.error.code, message: v.error.message } : null }));
      const playResult = await video.evaluate(async (v) => {
        try { await v.play(); await new Promise((resolve) => setTimeout(resolve, 600)); return { ok: true, paused: v.paused, currentTime: v.currentTime, readyState: v.readyState, error: v.error ? { code: v.error.code, message: v.error.message } : null }; }
        catch (error) { return { ok: false, error: String(error?.message || error), paused: v.paused, readyState: v.readyState, mediaError: v.error ? { code: v.error.code, message: v.error.message } : null }; }
      });
      result.videos.push({ index: index + 1, before, playResult });
    }
    result.count = count; result.screenshot = 'vc-site/_qa-output/interaction-audit/screenshots/guge-videos-last.png';
    await page.screenshot({ path: SHOTS + '/guge-videos-last.png', fullPage: false });
  } catch (error) { result.exception = String(error?.stack || error); }
  result.errors = errors; await context.close(); observations.videos = result;
}

function focusFingerprint(info) { return info.tag + '|' + info.id + '|' + info.href + '|' + info.text; }

async function keyboardCheckRoute(route) {
  const result = { route, steps: [], visibleFocusableCount: 0, errors: [] };
  const { context, page, errors } = await newPage({ route });
  try {
    await open(page, route, 1200);
    result.visibleFocusableCount = await page.evaluate(() => [...document.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter((el) => {
      const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0 && !el.disabled;
    }).length);
    await page.locator('body').click({ position: { x: 4, y: 4 } });
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement; if (!el) return null; const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        const labelled = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        return { tag: el.tagName, id: el.id, href: el.getAttribute('href'), text: labelled, focusVisible: typeof el.matches === 'function' && el.matches(':focus-visible'), outline: s.outlineStyle + '/' + s.outlineWidth + '/' + s.outlineColor, boxShadow: s.boxShadow, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, hidden: s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0 || r.width === 0 || r.height === 0 || el.closest('[aria-hidden="true"]') !== null };
      });
      if (!info) continue; result.steps.push(info);
      if (i === 0 || (info.focusVisible && !info.hidden && (info.outline.includes('0px') || info.outline.startsWith('none/')) && info.boxShadow === 'none')) await page.screenshot({ path: SHOTS + '/keyboard-' + safeName(route) + '-' + String(i + 1).padStart(2, '0') + '.png', fullPage: false }).catch(() => {});
    }
    result.unique = new Set(result.steps.map(focusFingerprint)).size;
    result.tail = result.steps.slice(-24).map(focusFingerprint);
    result.hiddenFocused = result.steps.filter((step) => step.hidden);
    result.focusVisibleWithoutStyle = result.steps.filter((step) => step.focusVisible && !step.hidden && (step.outline.startsWith('none/') || step.outline.includes('/0px/') || step.boxShadow === 'none'));
    result.trapSuspected = result.unique <= 3 && result.visibleFocusableCount > 5;
  } catch (error) { result.exception = String(error?.stack || error); }
  result.errors = errors; await context.close(); observations.keyboard.push(result);
}

async function languageCheck() {
  for (const route of routes) {
    const result = { route, errors: [] }; const { context, page, errors } = await newPage({ route });
    try {
      await open(page, route, 1200); const toggle = page.getByRole('button', { name: 'EN', exact: true }).first();
      if (!(await visible(toggle))) throw new Error('EN button not visible'); await toggle.click(); await page.waitForTimeout(350);
      result.state = await page.evaluate(() => {
        const isVisible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0; };
        const leaked = [...document.querySelectorAll('p,li,h1,h2,h3,h4,figcaption,dt,dd,button,a,label')]
          .filter((el) => isVisible(el) && /[\u4e00-\u9fff]{8,}/.test(el.innerText || '') && !el.closest('iframe'))
          .map((el) => ({ tag: el.tagName, className: String(el.className), text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 220), langZh: Boolean(el.matches('[data-lang-zh]') || el.closest('[data-lang-zh]')), langEn: Boolean(el.matches('[data-lang-en]') || el.closest('[data-lang-en]')) }))
          .filter((item) => !item.langZh);
        const overflows = [...document.querySelectorAll('h1,h2,h3,h4,p,button,a,li,section,article')]
          .filter((el) => isVisible(el) && el.scrollWidth > el.clientWidth + 1)
          .map((el) => ({ tag: el.tagName, text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth })).slice(0, 20);
        return { htmlLang: document.documentElement.lang, dataLang: document.documentElement.dataset.lang, leaked, overflows, screenshotText: document.body?.innerText?.slice(0, 1200) };
      });
      result.screenshot = 'vc-site/_qa-output/interaction-audit/screenshots/language-' + safeName(route) + '-en.png';
      await page.screenshot({ path: SHOTS + '/language-' + safeName(route) + '-en.png', fullPage: true });
    } catch (error) { result.exception = String(error?.stack || error); }
    result.errors = errors; observations.language.push(result); await context.close();
  }
}

await routeDiagnostics();
await contactCheck();
await guanchaoCheck();
await particleCheck();
await videoCheck();
await keyboardCheckRoute('/');
await keyboardCheckRoute('/work');
await languageCheck();

await writeFile(OUT + '/observations.json', JSON.stringify(observations, null, 2));
const allErrors = [
  ...observations.routeRuns.flatMap((run) => run.errors),
  ...(observations.contact?.errors || []), ...(observations.guanchao?.errors || []), ...(observations.particle?.errors || []), ...(observations.videos?.errors || []),
  ...observations.keyboard.flatMap((run) => run.errors), ...observations.language.flatMap((run) => run.errors),
];
console.log(JSON.stringify({
  base: BASE,
  routeRuns: observations.routeRuns.map((run) => ({ route: run.route, state: run.state, errors: run.errors.length })),
  contact: observations.contact,
  guanchao: observations.guanchao,
  particle: observations.particle,
  videos: observations.videos,
  keyboard: observations.keyboard.map((run) => ({ route: run.route, visibleFocusableCount: run.visibleFocusableCount, unique: run.unique, hiddenFocused: run.hiddenFocused?.length, focusVisibleWithoutStyle: run.focusVisibleWithoutStyle?.length, trapSuspected: run.trapSuspected, errors: run.errors.length })),
  language: observations.language.map((run) => ({ route: run.route, state: run.state, errors: run.errors.length })),
  allErrors: allErrors.length,
}, null, 2));
await browser.close();
