#!/usr/bin/env node
/**
 * VISUAL PASS 02 — scoped re-record.
 *
 * The 2026-09-19 compression pass touched Chapter 09 only. Re-running the full
 * `guge-case.mjs` sweep would re-shoot ten chapters that nobody changed and
 * would bury the one thing worth looking at. This records a single continuous
 * take from the top of Chapter 08 (AI 导览) through the end of the page —
 * Chapter 08 → 09 → 10 — so the new chapter can be watched *in rhythm* with
 * what comes before and after it, which is the only way to tell whether the cut
 * actually helped.
 *
 * Recording path is the same as `guge-case.mjs`: CDP screencast to JPEG frames,
 * then system ffmpeg to VP9. Playwright's own `recordVideo` is not used because
 * it depends on a separately-downloaded Playwright ffmpeg that this machine does
 * not have.
 *
 *   BASE=http://127.0.0.1:3200 node scripts/qa/guge-pass02.mjs
 */
import { mkdir, writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright-core';

const execFileAsync = promisify(execFile);

const BASE = process.env.BASE;
if (!BASE) {
  console.error('需要 BASE，例如 BASE=http://127.0.0.1:3200 node scripts/qa/guge-pass02.mjs');
  process.exit(1);
}

const PATH = '/work/guge';
const START_ANCHOR = 'guide';
const OUT = join(process.cwd(), '_qa-output', 'guge-pass02');
const EXECUTABLE = process.env.CHROMIUM ?? '/usr/bin/chromium';

const VIEWPORTS = [
  { name: 'desktop-1600x1000', width: 1600, height: 1000, dsf: 1 },
  { name: 'mobile-390x844', width: 390, height: 844, dsf: 2 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.dsf,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${PATH}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  return { context, page };
}

/** Warm every lazy image so nothing pops in mid-take. */
async function prewalk(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }
  });
  await sleep(2600);
}

async function record(browser, viewport) {
  const frameDir = await mkdtemp(join(tmpdir(), 'vc-guge-p02-'));
  const { context, page } = await openPage(browser, viewport);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    void cdp.send('Page.screencastFrameAck', { sessionId });
  });

  await prewalk(page);

  // Park a little above the chapter so the visitor sees Chapter 08 arrive.
  const start = await page.evaluate((id) => {
    const el = document.getElementById(id);
    return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35));
  }, START_ANCHOR);

  await page.evaluate((y) => window.scrollTo(0, y), start);
  await sleep(1800);

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1 });

  const end = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const step = 150;
  for (let y = start; y <= end; y += step) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await sleep(105);
  }
  await page.evaluate((to) => window.scrollTo(0, to), end);
  await sleep(1600);

  await cdp.send('Page.stopScreencast');
  await context.close();

  if (frames.length < 2) throw new Error(`CDP screencast 帧数不足：${frames.length}`);
  for (let index = 0; index < frames.length; index += 1) {
    await writeFile(join(frameDir, `frame-${String(index + 1).padStart(6, '0')}.jpg`), frames[index]);
  }

  const outputPath = join(OUT, `pass02-ch08-10-${viewport.name}.webm`);
  await execFileAsync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', '24',
    '-i', join(frameDir, 'frame-%06d.jpg'),
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-cpu-used', '3',
    '-pix_fmt', 'yuv420p',
    outputPath,
  ]);
  await rm(frameDir, { recursive: true, force: true });

  return { outputPath, frameCount: frames.length, startY: start, endY: end, chapterPx: end - start };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  });
  const report = { base: BASE, scope: '08 → 09 → 10', videos: [] };
  try {
    for (const viewport of VIEWPORTS) {
      process.stdout.write(`\n▶ 录制 ch.08→10 @ ${viewport.name}\n`);
      const result = await record(browser, viewport);
      report.videos.push({ viewport: viewport.name, ...result });
      process.stdout.write(`  · ${result.frameCount} 帧 / ${Math.round(result.chapterPx)}px → ${result.outputPath}\n`);
    }
  } finally {
    await browser.close();
  }
  await writeFile(join(OUT, 'pass02-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write('\n完成。\n');
}

await main();
