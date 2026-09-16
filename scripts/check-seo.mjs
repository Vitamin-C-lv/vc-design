/**
 * No-browser SEO smoke test for the built site.
 *
 * The four case slugs are read from content/projects.ts with a deliberately
 * narrow `slug: '...'` regex. Node cannot import the TypeScript source directly
 * without a loader, and reading the source keeps this check independent of the
 * build output's route manifest.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = new URL(process.env.BASE ?? 'http://localhost:3210');
BASE.pathname = BASE.pathname.replace(/\/$/, '');

const fail = (message) => {
  throw new Error(message);
};

async function get(route) {
  const url = new URL(route, BASE);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (response.status !== 200) fail(`${route} 返回 ${response.status}`);
  return { url, body: await response.text() };
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)) result[match[1].toLowerCase()] = match[2];
  return result;
}

function canonical(body, url) {
  const links = [...body.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attrs(match[0]))
    .filter((attributes) => attributes.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  if (links.length !== 1 || !links[0].href) fail(`${url.pathname} canonical 数量不是 1`);
  return new URL(links[0].href, url).href;
}

function assertLang(body, route) {
  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(body)) fail(`${route} 缺少 <html lang>`);
}

function ogImage(body, url, expectedOrigin) {
  const metas = [...body.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => attrs(match[0]))
    .filter((attributes) => attributes.property?.toLowerCase() === 'og:image');
  if (!metas.length || !metas[0].content) fail(`${url.pathname} 缺少 og:image`);
  let imageUrl;
  try {
    imageUrl = new URL(metas[0].content, url);
  } catch {
    fail(`${url.pathname} og:image 不是有效 URL：${metas[0].content}`);
  }
  if (!/^https?:\/\/[^/]+/i.test(metas[0].content) || !/^https?:$/.test(imageUrl.protocol) || imageUrl.origin !== expectedOrigin) {
    fail(`${url.pathname} og:image 必须是站点绝对 URL（${expectedOrigin}）：${imageUrl.href}`);
  }
  return imageUrl;
}

async function main() {
  const projects = await fs.readFile(path.join(ROOT, 'content/projects.ts'), 'utf8');
  const slugs = [...projects.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)].map((match) => match[1]);
  if (slugs.length !== 4) fail(`content/projects.ts 读取到 ${slugs.length} 个 slug，预期 4 个`);

  const routes = ['/', '/work', '/lab', ...slugs.map((slug) => `/work/${slug}`)];
  const pages = new Map();
  for (const route of routes) {
    const page = await get(route);
    assertLang(page.body, route);
    pages.set(route, page);
  }

  // metadataBase is the production origin even when the smoke test targets localhost.
  const canonicalOrigin = new URL(canonical(pages.get('/').body, pages.get('/').url)).origin;
  for (const route of routes) {
    const actual = canonical(pages.get(route).body, pages.get(route).url);
    const expected = new URL(route, `${canonicalOrigin}/`).href;
    if (actual !== expected) fail(`${route} canonical 应为 ${expected}，实际为 ${actual}`);
    const image = ogImage(pages.get(route).body, pages.get(route).url, canonicalOrigin);
    if (slugs.includes(route.split('/').at(-1)) && image.pathname !== `/og/${route.split('/').at(-1)}.png`) {
      fail(`${route} og:image 应指向 /og/${route.split('/').at(-1)}.png，实际为 ${image.pathname}`);
    }
  }

  const sitemap = await get('/sitemap.xml');
  const locations = new Set([...sitemap.body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim()));
  for (const route of routes) {
    const expected = new URL(route, `${canonicalOrigin}/`).href;
    if (!locations.has(expected)) fail(`sitemap.xml 缺少 ${expected}`);
  }

  const robots = await get('/robots.txt');
  const sitemapUrl = new URL('/sitemap.xml', `${canonicalOrigin}/`).href;
  if (!robots.body.includes(sitemapUrl) && !/sitemap:\s*\S*\/sitemap\.xml/i.test(robots.body)) {
    fail(`robots.txt 未指向 sitemap.xml（预期 ${sitemapUrl}）`);
  }

  console.log(`SEO smoke passed: ${routes.length} routes, sitemap, robots`);
}

try {
  await main();
} catch (error) {
  console.error(`SEO smoke failed: ${error.message}`);
  process.exitCode = 1;
}
