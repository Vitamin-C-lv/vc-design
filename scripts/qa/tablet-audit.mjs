import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = process.env.TABLET_AUDIT_OUT || '/tmp/tablet-audit';
const ROUTES = (process.env.ROUTES ?? '/,/work,/lab,/work/guge,/work/lihuahua,/work/guanchao,/work/qinghua-zaojing')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);
const VIEWPORTS = (process.env.VIEWPORTS ?? '768x1024,834x1112,1180x820')
  .split(',')
  .map((value) => {
    const [width, height] = value.split('x').map(Number);
    return { width, height };
  });

fs.mkdirSync(OUT, { recursive: true });

const slugFor = (route) => route === '/' ? 'home' : route.replace(/^\/+/, '').replaceAll('/', '-');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const pages = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport, locale: 'zh-CN' });
  for (const route of ROUTES) {
    const page = await context.newPage();
    const screenshot = path.join(OUT, `${viewport.width}-${slugFor(route)}.png`);
    const record = {
      route,
      viewport,
      screenshot,
      status: null,
      metrics: null,
      error: null,
    };
    try {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      record.status = response?.status() ?? null;
      if (response?.status() === 404) {
        record.error = '404';
        pages.push(record);
        await page.close();
        continue;
      }
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1200);

      // Walk the whole document so lazy media is requested before the evidence shot.
      const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= initialHeight; y += 600) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await sleep(50);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await sleep(1500);
      await page.screenshot({ path: screenshot, fullPage: true });

      // Return to the top before measuring: this avoids treating scroll position as
      // a layout change while retaining all lazy-loaded assets.
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(100);
      record.metrics = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const selectorFor = (el) => {
          if (!(el instanceof Element)) return '';
          if (el.id) return `#${CSS.escape(el.id)}`;
          const parts = [];
          let node = el;
          for (let depth = 0; node && depth < 4 && node.nodeType === 1; depth += 1, node = node.parentElement) {
            let part = node.tagName.toLowerCase();
            if (node.classList.length) part += `.${Array.from(node.classList).slice(0, 2).map((name) => CSS.escape(name)).join('.')}`;
            const siblings = node.parentElement ? Array.from(node.parentElement.children).filter((sibling) => sibling.tagName === node.tagName) : [];
            if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
            parts.unshift(part);
          }
          return parts.join(' > ');
        };
        const srcFor = (img) => img.currentSrc || img.src || '';
        const isRendered = (el) => {
          if (!(el instanceof Element)) return false;
          for (let node = el; node; node = node.parentElement) {
            const cs = getComputedStyle(node);
            if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
          }
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };
        const containedOverflow = (el) => {
          for (let parent = el.parentElement; parent; parent = parent.parentElement) {
            const cs = getComputedStyle(parent);
            if (/hidden|clip/.test(cs.overflowX)) return { type: 'clipped', selector: selectorFor(parent) };
            if (/auto|scroll/.test(cs.overflowX) && parent.scrollWidth > parent.clientWidth + 2) {
              return { type: 'scrollable', selector: selectorFor(parent) };
            }
          }
          return null;
        };
        const isKnownHorizontalScroller = (el) => {
          for (let parent = el.parentElement; parent; parent = parent.parentElement) {
            const cs = getComputedStyle(parent);
            if (/auto|scroll/.test(cs.overflowX) && parent.scrollWidth > parent.clientWidth + 2) return true;
          }
          return false;
        };

        const mediaRows = [];
        document.querySelectorAll('[data-media-row]').forEach((row, rowIndex) => {
          const images = Array.from(row.querySelectorAll('img')).filter(isRendered);
          const measurements = images.map((img, order) => ({
            order,
            top: Number(img.getBoundingClientRect().top.toFixed(2)),
            height: Number(img.getBoundingClientRect().height.toFixed(2)),
            width: Number(img.getBoundingClientRect().width.toFixed(2)),
            src: srcFor(img),
            selector: selectorFor(img),
          }));
          const visualRows = [];
          for (const measurement of measurements) {
            let visualRow = visualRows.find((candidate) => Math.abs(candidate.top - measurement.top) <= 2);
            if (!visualRow) {
              visualRow = { top: measurement.top, images: [] };
              visualRows.push(visualRow);
            }
            visualRow.images.push(measurement);
          }
          visualRows.forEach((visualRow, visualRowIndex) => {
            if (visualRow.images.length < 2) return;
            const heights = visualRow.images.map((item) => item.height);
            const min = Math.min(...heights);
            const max = Math.max(...heights);
            mediaRows.push({
              rowIndex,
              visualRowIndex,
              top: visualRow.top,
              declaredItems: row.getAttribute('data-media-row'),
              spread: Number((max - min).toFixed(2)),
              images: visualRow.images,
            });
          });
        });

        const deadWhite = [];
        document.querySelectorAll('figure').forEach((figure, figureIndex) => {
          if (!isRendered(figure)) return;
          const image = Array.from(figure.querySelectorAll('img')).find(isRendered);
          if (!image) return;
          const figureRect = figure.getBoundingClientRect();
          const imageRect = image.getBoundingClientRect();
          const gap = figureRect.height - imageRect.height;
          if (gap > 120) {
            deadWhite.push({
              figureIndex,
              figureHeight: Number(figureRect.height.toFixed(2)),
              imageHeight: Number(imageRect.height.toFixed(2)),
              gap: Number(gap.toFixed(2)),
              imageSrc: srcFor(image),
              selector: selectorFor(figure),
            });
          }
        });

        const pageOverflow = {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: vw,
          overflow: document.documentElement.scrollWidth > vw,
        };

        const clippedText = [];
        document.querySelectorAll('*').forEach((el) => {
          if (el === document.documentElement || el === document.body || !isRendered(el)) return;
          const cs = getComputedStyle(el);
          if (!/hidden|clip/.test(cs.overflow) && !/hidden|clip/.test(cs.overflowY)) return;
          if (el.scrollHeight <= el.clientHeight + 2) return;
          if (isKnownHorizontalScroller(el)) return;
          const text = (el.innerText || '').trim().replace(/\s+/g, ' ');
          if (!text) return;
          clippedText.push({
            selector: selectorFor(el),
            tag: el.tagName,
            text: text.slice(0, 120),
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            overflow: cs.overflow,
            overflowY: cs.overflowY,
          });
        });

        const outOfBounds = [];
        document.querySelectorAll('*').forEach((el) => {
          if (el === document.documentElement || el === document.body || !isRendered(el)) return;
          const rect = el.getBoundingClientRect();
          if (rect.left >= -0.01 && rect.right <= vw + 1) return;
          const container = containedOverflow(el);
          if (container) return;
          outOfBounds.push({
            selector: selectorFor(el),
            tag: el.tagName,
            left: Number(rect.left.toFixed(2)),
            right: Number(rect.right.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            viewportWidth: vw,
            text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 100),
          });
        });

        return { mediaRows, deadWhite, pageOverflow, clippedText, outOfBounds, viewportHeight: vh };
      });
    } catch (error) {
      record.error = String(error);
    }
    pages.push(record);
    await page.close();
  }
  await context.close();
}

await browser.close();
const output = { base: BASE, checked: { viewports: VIEWPORTS, routes: ROUTES }, pages };
fs.writeFileSync(path.join(OUT, 'metrics.json'), `${JSON.stringify(output, null, 2)}\n`);
for (const page of pages) {
  if (page.error) console.log(`[${page.viewport.width}] ${page.route} ERROR ${page.error}`);
  else console.log(`[${page.viewport.width}] ${page.route} -> ${page.screenshot}`);
}
