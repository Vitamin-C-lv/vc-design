/**
 * Capture a public live site into responsive image derivatives.
 *
 * Usage:
 *   node scripts/assets/capture-live.mjs <url> <name> [output-root]
 *   CHROMIUM=/path/to/chromium node scripts/assets/capture-live.mjs <url> <name>
 *
 * PNG screenshots are temporary files in the OS temp directory. The repository
 * receives only the responsive derivatives, manifest entry, and asset report.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? process.env.LIVE_URL;
const name = process.argv[3] ?? process.env.LIVE_NAME;
if (!url || !name) throw new Error('用法：node scripts/assets/capture-live.mjs <url> <name> [output-root]');
if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) throw new Error('name 只能包含字母、数字和连字符');

const OUTPUT_ROOT = path.resolve(
  process.argv[4] ?? process.env.ASSET_OUTPUT_ROOT ?? path.join(process.cwd(), 'public/works'),
);
const OUT_DIR = path.join(OUTPUT_ROOT, name);
const CHROMIUM = process.env.CHROMIUM ?? '/usr/bin/chromium';
const WIDTHS = [480, 768, 1200, 1600, 2048];
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'vc-live-capture-'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(page) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await sleep(1500);
}

async function capture() {
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const desktop = await desktopContext.newPage();
    await settle(desktop);
    await desktop.screenshot({ path: path.join(tempRoot, 'desktop-full.png'), fullPage: true });
    const scrollHeight = await desktop.evaluate(() => document.documentElement.scrollHeight);
    const maxScroll = Math.max(0, scrollHeight - 1000);
    for (const [index, fraction] of [0, 0.35, 0.7].entries()) {
      await desktop.evaluate((y) => window.scrollTo(0, y), maxScroll * fraction);
      await sleep(600);
      await desktop.screenshot({ path: path.join(tempRoot, `desktop-view-0${index + 1}.png`) });
    }
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    await settle(mobile);
    const mobileHeight = await mobile.evaluate(() => document.documentElement.scrollHeight);
    if (mobileHeight > 6000) {
      await mobile.evaluate(() => {
        document.documentElement.style.height = '6000px';
        document.body.style.height = '6000px';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      });
    }
    await mobile.screenshot({ path: path.join(tempRoot, 'mobile-full.png'), fullPage: true });
    await mobileContext.close();
  } finally {
    await browser.close();
  }
}

async function derivative(basename) {
  const source = path.join(tempRoot, `${basename}.png`);
  const meta = await sharp(source).metadata();
  if (!meta.width || !meta.height) throw new Error(`无法读取截图尺寸：${basename}`);
  const widths = WIDTHS.filter((width) => width <= meta.width);
  for (const width of widths) {
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(OUT_DIR, `${basename}-${width}.webp`));
    await sharp(source).resize({ width, withoutEnlargement: true }).avif({ quality: 55 }).toFile(path.join(OUT_DIR, `${basename}-${width}.avif`));
  }
  const fallbackWidth = widths.at(-1) ?? meta.width;
  await sharp(source).resize({ width: fallbackWidth, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(path.join(OUT_DIR, `${basename}-${fallbackWidth}.jpg`));
  await sharp(source).resize({ width: 24, withoutEnlargement: true }).webp({ quality: 40 }).toFile(path.join(OUT_DIR, `${basename}-lqip.webp`));
  return {
    src: `${name}/${basename}`,
    original: { width: meta.width, height: meta.height, bytes: (await fs.stat(source)).size },
    aspect: Number((meta.width / meta.height).toFixed(4)),
    widths,
    webp: widths.map((width) => `${name}/${basename}-${width}.webp`),
    avif: widths.map((width) => `${name}/${basename}-${width}.avif`),
    lqip: `${name}/${basename}-lqip.webp`,
    fallback: `${name}/${basename}-${fallbackWidth}.jpg`,
  };
}

try {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await capture();
  const entries = [];
  for (const basename of ['desktop-full', 'desktop-view-01', 'desktop-view-02', 'desktop-view-03', 'mobile-full']) {
    entries.push(await derivative(basename));
  }
  const manifestPath = path.join(OUTPUT_ROOT, '_manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const entry of entries) manifest[entry.src] = entry;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const reportPath = path.join(OUTPUT_ROOT, '_asset-report.md');
  const report = await fs.readFile(reportPath, 'utf8');
  await fs.writeFile(reportPath, `${report.trimEnd()}\n\n## Live 站点截图\n\n- **${name}**：从 ${url} 抓取桌面与移动端截图，并生成响应式衍生图。\n`);
  console.log(`[${name}] 已生成 ${entries.length} 组响应式截图素材`);
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}
