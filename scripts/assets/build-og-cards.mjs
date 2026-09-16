/**
 * Render the four flagship Open Graph cards from local site assets.
 *
 * The HTML is rendered with page.setContent(), so this tool never starts a
 * Next.js server. Cover images come from content/media.json and public/works.
 *
 * Usage:
 *   node scripts/assets/build-og-cards.mjs
 *   CHROMIUM=/path/to/chromium node scripts/assets/build-og-cards.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../qa/node_modules/playwright-core/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MEDIA_PATH = path.join(ROOT, 'content/media.json');
const FONT_ROOT = path.join(ROOT, 'app/fonts');
const WORKS_ROOT = path.join(ROOT, 'public/works');
const OUTPUT_ROOT = path.join(ROOT, 'public/og');
const CHROMIUM = process.env.CHROMIUM ?? '/usr/bin/chromium';
const WIDTH = 1200;
const HEIGHT = 630;

const projects = [
  {
    slug: 'guge',
    titleZh: '古格王朝 AI 智能导览系统',
    title: 'GUGE',
    tagline: '把一个消失的王朝，做成可以被走进、被提问的世界。',
    accent: '#C9A227',
    coverKey: 'guge/guge_landscape_01',
  },
  {
    slug: 'lihuahua',
    titleZh: '李花花 · VC-AI-PET',
    title: 'LIHUAHUA',
    tagline: '不是聊天套壳，是一个会记得你的长期陪伴型 AI。',
    accent: '#A9714A',
    coverKey: 'lihuahua/relaxed',
  },
  {
    slug: 'guanchao',
    titleZh: '观潮 Daily Brief',
    title: 'GUANCHAO',
    tagline: '把每天的信息洪流，压成一份能读完的简报。',
    accent: '#6D5BD0',
    coverKey: 'guanchao/dashboard',
  },
  {
    slug: 'qinghua-zaojing',
    titleZh: '青花造境',
    title: 'QINGHUA',
    tagline: '在浏览器里，从一抔土开始，亲手做一件瓷器。',
    accent: '#3E7A63',
    coverKey: 'qinghua/desktop-full',
  },
];

const media = JSON.parse(await fs.readFile(MEDIA_PATH, 'utf8'));

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function dataUrl(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const mime = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
  return `data:${mime};base64,${(await fs.readFile(filePath)).toString('base64')}`;
}

async function fontFace(fileName, family) {
  const source = await fs.readFile(path.join(FONT_ROOT, fileName));
  return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${source.toString('base64')}) format('woff2');font-style:normal;font-weight:100 900;font-display:block;}`;
}

function template(project, cover) {
  const titleZh = escapeHtml(project.titleZh);
  const title = escapeHtml(project.title);
  const tagline = escapeHtml(project.tagline);
  const accent = escapeHtml(project.accent);
  const titleMarkup = project.slug === 'guge'
    ? `<span class="title-line">古格王朝 AI</span><span class="title-line">智能导览系统</span>`
    : titleZh;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
      body {
        background: #FBFAF8;
        color: #0F0F0F;
        font-family: 'VC Sans', 'Noto Sans CJK SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
      .card { position: relative; width: 100%; height: 100%; padding: 48px 52px; display: grid; grid-template-columns: 47% 53%; gap: 32px; }
      .rule { position: absolute; left: 52px; right: 52px; top: 38px; height: 2px; background: ${accent}; }
      .copy { min-width: 0; padding-top: 30px; display: flex; flex-direction: column; }
      .eyebrow { display: flex; align-items: center; gap: 11px; color: #6F6A62; font: 700 16px/1 'VC Mono', ui-monospace, monospace; letter-spacing: .08em; }
      .dot { width: 8px; height: 8px; flex: 0 0 auto; background: ${accent}; }
      h1 { margin: 50px 0 0; font: 700 47px/1.08 'Noto Sans CJK SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: -.045em; max-width: 430px; text-wrap: balance; }
      .title-line { display: block; white-space: nowrap; }
      .english { margin-top: 18px; font: 700 27px/1 'VC Display', 'Arial Narrow', sans-serif; letter-spacing: .08em; }
      .tagline { margin: auto 0 2px; max-width: 500px; color: #3A3730; font: 500 20px/1.5 'Noto Sans CJK SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: -.02em; }
      .cover-wrap { min-width: 0; min-height: 0; padding-top: 30px; display: flex; align-items: center; }
      .cover { display: block; width: 100%; height: 454px; object-fit: contain; object-position: center; background: #F1EFEB; border: 1px solid #0F0F0F; }
      .footer { position: absolute; right: 52px; bottom: 43px; color: #6F6A62; font: 700 15px/1 'VC Mono', ui-monospace, monospace; letter-spacing: .1em; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="rule"></div>
      <section class="copy">
        <div class="eyebrow"><span class="dot"></span><span>FEATURED WORK / ${title}</span></div>
        <h1>${titleMarkup}</h1>
        <div class="english">${title}</div>
        <p class="tagline">${tagline}</p>
      </section>
      <section class="cover-wrap"><img class="cover" src="${cover}" alt="${titleZh} 项目封面"></section>
      <div class="footer">VC / 维C</div>
    </main>
  </body>
</html>`;
}

async function main() {
  await fs.access(CHROMIUM);
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  const styles = `${await fontFace('archivo-latin.woff2', 'VC Display')}${await fontFace('inter-latin.woff2', 'VC Sans')}${await fontFace('jetbrains-mono-latin.woff2', 'VC Mono')}`;
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  try {
    for (const project of projects) {
      const entry = media[project.coverKey];
      if (!entry?.fallback) throw new Error(`media.json 缺少 ${project.coverKey} 的 fallback`);
      const coverPath = path.join(WORKS_ROOT, entry.fallback);
      await fs.access(coverPath);
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
      await page.setContent(`<style>${styles}</style>${template(project, await dataUrl(coverPath))}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => {
        const textNodes = [...document.querySelectorAll('.eyebrow, h1, .english, .tagline, .footer')];
        const cover = document.querySelector('.cover').getBoundingClientRect();
        const copy = document.querySelector('.copy').getBoundingClientRect();
        const title = document.querySelector('h1');
        const titleLinesByTop = new Map();
        const range = document.createRange();
        const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
          let offset = 0;
          for (const character of Array.from(textNode.textContent ?? '')) {
            range.setStart(textNode, offset);
            range.setEnd(textNode, offset + character.length);
            const rect = range.getClientRects()[0];
            if (rect) {
              const top = Math.round(rect.top);
              const line = titleLinesByTop.get(top) ?? '';
              titleLinesByTop.set(top, line + character);
            }
            offset += character.length;
          }
        }
        const titleLines = [...titleLinesByTop.values()].map((line) => line.trim()).filter(Boolean);
        const titleHasSingletonChineseLine = titleLines.some((line) => /^[\u3400-\u9fff]$/.test(line));
        const textFits = textNodes.map((node) => {
          const box = node.getBoundingClientRect();
          return {
            selector: node.className || node.tagName,
            fits: box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight
              && node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 3,
            box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
            scroll: { width: node.scrollWidth, height: node.scrollHeight, clientWidth: node.clientWidth, clientHeight: node.clientHeight },
          };
        });
        return {
          pageFits: document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight,
          textFits: textFits.every((item) => item.fits),
          textFailures: textFits.filter((item) => !item.fits),
          columnsDoNotOverlap: copy.right <= cover.left,
          titleLines,
          titleLineCounts: titleLines.map((line) => Array.from(line.replaceAll(/\s/g, '')).length),
          titleHasSingletonChineseLine,
        };
      });
      if (!layout.pageFits || !layout.textFits || !layout.columnsDoNotOverlap || layout.titleHasSingletonChineseLine) {
        throw new Error(`${project.slug} 版式检查失败：${JSON.stringify(layout)}`);
      }
      const output = path.join(OUTPUT_ROOT, `${project.slug}.png`);
      await page.screenshot({ path: output, type: 'png' });
      await page.close();
      console.log(`已生成 ${path.relative(ROOT, output)}（cover: ${entry.fallback}；标题 ${layout.titleLines.length} 行：${layout.titleLines.map((line, index) => `「${line}」${layout.titleLineCounts[index]} 字`).join(' / ')}）`);
    }
  } finally {
    await browser.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(`OG 卡片生成失败：${error.message}`);
  process.exitCode = 1;
}
