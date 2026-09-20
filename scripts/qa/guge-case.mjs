/**
 * 古格旗舰案例的视觉取证。
 *
 * Usage:
 *   BASE=http://127.0.0.1:3100 node scripts/qa/guge-case.mjs
 *   BASE=http://127.0.0.1:3100 GUGE_OUT=_qa-output/guge-case node scripts/qa/guge-case.mjs
 *
 * 产出（默认写入 `_qa-output/guge-case/`）：
 *   - guge-desktop-1600x1000.webm   桌面整页滚动录像
 *   - guge-mobile-390x844.webm      手机整页滚动录像
 *   - keyframes/<name>-<viewport>.png   BRIEF 指定的十张关键帧
 *   - report.json                   每张关键帧的锚点、滚动位置与尺寸
 *
 * 为什么不用 Playwright 的 recordVideo：它需要单独下载的 Playwright ffmpeg，
 * 本机只有系统 ffmpeg。CDP screencast 是等价路径，`opening-sequence.mjs` 已经在用。
 *
 * 关键帧必须等**分层揭示**跑完再拍：`FROM SITE TO STORY` 的图是 clip-path 逐层
 * 展开的，动画未结束就截图会拿到一张只铺了底层的图，看起来像坏掉。
 */
import { chromium } from 'playwright-core';
import { mkdir, writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE;
if (!BASE) {
  throw new Error('缺少 BASE。用法：BASE=http://127.0.0.1:3100 node scripts/qa/guge-case.mjs');
}
const OUT = resolve(process.env.GUGE_OUT ?? join(ROOT, '_qa-output/guge-case'));
const EXECUTABLE = process.env.CHROMIUM || '/usr/bin/chromium';
const execFileAsync = promisify(execFile);

const PATH = '/work/guge';

const VIEWPORTS = [
  { name: 'desktop-1600x1000', width: 1600, height: 1000, deviceScaleFactor: 1 },
  { name: 'mobile-390x844', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

/**
 * BRIEF 要求的十张关键帧。
 *
 * `advance` 是**从章节顶部再往下滚动多少个视口高度**。章节一进来先是标题，
 * 而 BRIEF 要的是"三层结构完整状态""Blender final""VR experience"这些**视觉主体**，
 * 所以每张都落到该章的主视觉上，而不是停在标题行——不然交出去的十张图会全部
 * 长成"一个标题 + 一点内容"，等于没有证据。
 */
const KEYFRAMES = [
  { slug: '01-dream', anchor: 'dream', advance: 0, label: '古格首次登场' },
  { slug: '02-site', anchor: 'site', advance: 1.15, label: 'THE REAL SITE / 实地考察' },
  { slug: '03-story-layers', anchor: 'story', advance: 1.05, label: '三层结构完整状态' },
  { slug: '04-people', anchor: 'people', advance: 0.72, label: 'A WORLD OF PEOPLE / 人物长卷' },
  { slug: '05-rebuild', anchor: 'rebuild', advance: 2.1, label: '数字重建 / 点云分区循环' },
  { slug: '06-built-in-3d', anchor: 'built', advance: 1.15, label: 'BUILT IN 3D / 过程 reel' },
  { slug: '07-inside', anchor: 'inside', advance: 1.15, label: 'STEP INSIDE / 实机场景' },
  { slug: '08-guide', anchor: 'guide', advance: 1.35, label: 'MEIDO / AI GUIDE' },
  { slug: '09-craft', anchor: 'craft', advance: 1.5, label: 'PRESENTATION / 展板与版式' },
  { slug: '10-outcome', anchor: 'outcome', advance: 1.15, label: 'OUTCOME' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.hasTouch),
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${PATH}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  // 首页有开片门闸；案例页没有，但等它落定是无害的，且能兼容以后加回来。
  await page
    .waitForFunction(() => document.documentElement.dataset.intro !== 'playing', null, { timeout: 8000 })
    .catch(() => {});
  await sleep(1200);
  return { context, page };
}

/** 把整页走一遍，让所有懒加载媒体与揭示都发生，最后回到顶部。 */
async function prewalk(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  await sleep(600);
}

/** 滚动到某个章节，并把标题对齐到视口顶部下方一点。 */
async function scrollToAnchor(page, anchor, advance = 0) {
  await page.evaluate(
    ({ id, advance }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 8 + advance * window.innerHeight));
    },
    { id: anchor, advance },
  );
}

async function captureKeyframes(page, viewport, report) {
  const dir = join(OUT, 'keyframes');
  await mkdir(dir, { recursive: true });

  for (const frame of KEYFRAMES) {
    await scrollToAnchor(page, frame.anchor, frame.advance);
    // 让 Reveal 的过渡与分层揭示跑完。`story` 的 clip-path 是 1.9s，标签还各自
    // 带 0.75/1.25/1.75s 的延迟；视频也要时间真的开始播放。
    await sleep(frame.anchor === 'story' ? 5200 : 3000);
    const file = join(dir, `${frame.slug}-${viewport.name}.png`);
    await page.screenshot({ path: file, timeout: 60000 });
    const info = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const rect = el?.getBoundingClientRect();
      return {
        scrollY: Math.round(window.scrollY),
        docHeight: document.body.scrollHeight,
        sectionTop: rect ? Math.round(rect.top) : null,
      };
    }, frame.anchor);
    report.keyframes.push({ ...frame, viewport: viewport.name, file, ...info });
    process.stdout.write(`  · ${frame.slug} @ ${viewport.name} (y=${info.scrollY})\n`);
  }
}

async function recordScroll(browser, viewport) {
  const videoDir = await mkdtemp(join(tmpdir(), 'vc-guge-video-'));
  const { context, page } = await openPage(browser, viewport);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    void cdp.send('Page.screencastFrameAck', { sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1 });

  await prewalk(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1400);

  /*
   * 真实时间滚动，不用假时钟：这一段的目的就是记录揭示动画本身，而揭示是
   * IntersectionObserver + CSS 过渡驱动的，假时钟不会让 CSS 过渡推进。
   */
  const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const step = 150;
  for (let y = 0; y <= total; y += step) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await sleep(110);
  }
  await sleep(900);
  await cdp.send('Page.stopScreencast');
  await context.close();

  if (frames.length < 2) throw new Error(`CDP screencast 帧数不足：${frames.length}`);
  for (let index = 0; index < frames.length; index += 1) {
    await writeFile(join(videoDir, `frame-${String(index + 1).padStart(6, '0')}.jpg`), frames[index]);
  }

  const outputPath = join(OUT, `guge-${viewport.name}.webm`);
  await execFileAsync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', '24',
    '-i', join(videoDir, 'frame-%06d.jpg'),
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-cpu-used', '3',
    '-pix_fmt', 'yuv420p',
    outputPath,
  ]);
  await rm(videoDir, { recursive: true, force: true });
  return { outputPath, frameCount: frames.length, scrolledPx: total };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const report = { base: BASE, path: PATH, keyframes: [], videos: [] };

  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  });

  try {
    for (const viewport of VIEWPORTS) {
      process.stdout.write(`\n▶ keyframes @ ${viewport.name}\n`);
      const { context, page } = await openPage(browser, viewport);
      try {
        await prewalk(page);
        await captureKeyframes(page, viewport, report);
      } finally {
        await context.close();
      }
    }

    for (const viewport of VIEWPORTS) {
      process.stdout.write(`\n▶ scroll video @ ${viewport.name}\n`);
      const result = await recordScroll(browser, viewport);
      report.videos.push({ viewport: viewport.name, ...result });
      process.stdout.write(`  · ${result.outputPath} (${result.frameCount} frames, ${result.scrolledPx}px)\n`);
    }
  } finally {
    await browser.close();
  }

  await writeFile(join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`\n✔ ${OUT}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
