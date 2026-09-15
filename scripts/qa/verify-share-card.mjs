import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Resolve output from the repository so the checker remains portable across clones.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = ROOT + '_qa-output/verify-share-card.json';

const checks = [];
const check = (name, expected, actual, pass) => {
  checks.push({ name, expected, actual, pass });
  console.log(`${pass ? '  ✅' : '  ❌'} ${name} | 期望: ${expected} | 实际: ${actual}`);
};

const quote = value => value == null ? '(不存在)' : JSON.stringify(value);

// Read attributes without depending on their order, because HTML serializers may reorder them.
function attributes(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function metaContent(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.property?.toLowerCase() === name || attrs.name?.toLowerCase() === name) {
      return attrs.content || '';
    }
  }
  return null;
}

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.rel?.toLowerCase().split(/\s+/).includes('canonical')) return attrs.href || '';
  }
  return null;
}

function isAbsoluteHttp(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function pngSize(bytes) {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 24 || !signature.every((byte, index) => bytes[index] === byte)) return null;
  if (String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR') return null;
  return {
    width: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(16),
    height: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(20),
  };
}

/*
 * This deliberately reads *through* the CDN instead of bypassing it: what WeChat
 * and other platforms scrape is the edge copy, so the edge copy is what has to
 * be correct. The consequence is that for a few minutes after a deploy the edge
 * may still serve the previous build and this check will report stale values.
 * Observed 2026-09-15: immediately after shipping the share card, production
 * returned the old HTML (no og:image, no canonical) for roughly three minutes
 * and then settled. Re-run before concluding the metadata is broken.
 */
let html = '';
let pageStatus = 'request failed';
try {
  const response = await fetch(new URL('/', BASE), { signal: AbortSignal.timeout(30000) });
  pageStatus = response.status;
  html = await response.text();
} catch (error) {
  pageStatus = `${pageStatus}: ${error.message}`;
}

const ogTitle = metaContent(html, 'og:title');
const ogDescription = metaContent(html, 'og:description');
const ogUrl = metaContent(html, 'og:url');
const ogImage = metaContent(html, 'og:image');
const ogWidth = metaContent(html, 'og:image:width');
const ogHeight = metaContent(html, 'og:image:height');
const twitterCard = metaContent(html, 'twitter:card');
const twitterImage = metaContent(html, 'twitter:image');
const canonical = canonicalHref(html);

check('首页有 og:title', '存在', quote(ogTitle), ogTitle !== null);
check('首页有 og:description', '存在', quote(ogDescription), ogDescription !== null);
check('首页有 og:url', '存在', quote(ogUrl), ogUrl !== null);
check('og:image 是绝对 URL', '以 http 开头的 URL', quote(ogImage), isAbsoluteHttp(ogImage));
check('og:image:width = 1200', '1200', quote(ogWidth), ogWidth === '1200');
check('og:image:height = 630', '630', quote(ogHeight), ogHeight === '630');
check('twitter:card = summary_large_image', 'summary_large_image', quote(twitterCard), twitterCard === 'summary_large_image');
check('存在 twitter:image', '存在', quote(twitterImage), twitterImage !== null);
check('存在绝对 URL canonical', '存在且以 http 开头', quote(canonical), isAbsoluteHttp(canonical));

let imageStatus = '(未请求)';
let imageContentType = '(未请求)';
let imageDimensions = null;
if (isAbsoluteHttp(ogImage)) {
  try {
    const imageResponse = await fetch(ogImage, { signal: AbortSignal.timeout(30000) });
    imageStatus = imageResponse.status;
    imageContentType = imageResponse.headers.get('content-type') || '(缺少 content-type)';
    const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
    imageDimensions = pngSize(imageBytes);
  } catch (error) {
    imageStatus = `request failed: ${error.message}`;
  }
}
check('og:image HTTP 200', '200', quote(imageStatus), imageStatus === 200);
check('og:image content-type 是图片', 'image/*', quote(imageContentType), /^image\//i.test(imageContentType));
check('PNG 文件头像素 = 1200×630', '1200×630', quote(imageDimensions ? `${imageDimensions.width}×${imageDimensions.height}` : null), imageDimensions?.width === 1200 && imageDimensions?.height === 630);

if (!html) {
  check('首页 HTML 请求成功', '可读取 HTML', quote(pageStatus), false);
}

const baseUrl = new URL(BASE);
if (!['localhost', '127.0.0.1', '::1'].includes(baseUrl.hostname)) {
  let actualHost = '(无法解析)';
  try { actualHost = new URL(ogUrl).hostname; } catch {}
  check('线上 BASE 与 og:url host 一致', baseUrl.hostname, actualHost, actualHost === baseUrl.hostname);
}

const result = {
  base: BASE,
  pageStatus,
  checks,
  passed: checks.filter(item => item.pass).length,
  total: checks.length,
};
await mkdir(ROOT + '_qa-output/', { recursive: true });
await writeFile(OUT, JSON.stringify(result, null, 2) + '\n');

const failed = checks.filter(item => !item.pass);
console.log(`\n${result.passed}/${result.total} passed`);
console.log('JSON 结果:', OUT);
if (failed.length) process.exit(1);
console.log('社交分享卡验收通过');
