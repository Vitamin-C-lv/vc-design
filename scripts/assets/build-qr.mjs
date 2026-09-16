/**
 * Build the WeChat QR derivative from a private card image.
 *
 * Usage:
 *   node scripts/assets/build-qr.mjs <private-card-image> [output-root]
 *
 * The default crop matches the card supplied for this site. Override it with
 * QR_CROP=left,top,width,height when the private card has the same QR layout at
 * another pixel position. The source image and all temporary pixels stay out of
 * Git; only the derived assets and manifest entry are written to output-root.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceArg = process.argv[2] ?? process.env.QR_SOURCE;
if (!sourceArg) throw new Error('用法：node scripts/assets/build-qr.mjs <private-card-image> [output-root]');

const SOURCE = path.resolve(sourceArg);
const OUTPUT_ROOT = path.resolve(
  process.argv[3] ?? process.env.ASSET_OUTPUT_ROOT ?? path.join(process.cwd(), 'public/works'),
);
const KEY = 'brand/wechat-qr';
const BASENAME = 'wechat-qr';
const OUT_DIR = path.join(OUTPUT_ROOT, 'brand');
const WIDTHS = [480, 669];
const cropParts = (process.env.QR_CROP ?? '144,423,669,669').split(',').map(Number);
if (cropParts.length !== 4 || cropParts.some((value) => !Number.isInteger(value) || value < 0)) {
  throw new Error('QR_CROP 必须是 left,top,width,height 四个非负整数');
}
const [left, top, width, height] = cropParts;
if (width !== height) throw new Error('二维码裁剪必须是正方形');

const description = 'VC 维C 微信二维码，紫色码点居中放置微信图标，扫码可添加为好友。';
await fs.access(SOURCE);
await fs.mkdir(OUT_DIR, { recursive: true });

const croppedBuffer = await sharp(SOURCE).extract({ left, top, width, height }).png().toBuffer();
const cropped = sharp(croppedBuffer);
const webp = [];
const avif = [];
const products = [];
for (const targetWidth of WIDTHS.filter((value) => value <= width)) {
  const webpName = `${BASENAME}-${targetWidth}.webp`;
  const avifName = `${BASENAME}-${targetWidth}.avif`;
  await cropped.clone().resize({ width: targetWidth, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toFile(path.join(OUT_DIR, webpName));
  await cropped.clone().resize({ width: targetWidth, withoutEnlargement: true }).avif({ quality: 72, effort: 6 }).toFile(path.join(OUT_DIR, avifName));
  webp.push(`${KEY}-${targetWidth}.webp`);
  avif.push(`${KEY}-${targetWidth}.avif`);
  products.push(path.join(OUT_DIR, webpName), path.join(OUT_DIR, avifName));
}

const fallbackWidth = WIDTHS.filter((value) => value <= width).at(-1) ?? width;
const fallbackName = `${BASENAME}-${fallbackWidth}.jpg`;
const lqipName = `${BASENAME}-lqip.webp`;
await cropped.clone().resize({ width: fallbackWidth, withoutEnlargement: true }).jpeg({ quality: 88, chromaSubsampling: '4:2:0', mozjpeg: true }).toFile(path.join(OUT_DIR, fallbackName));
await cropped.clone().resize({ width: 24, withoutEnlargement: true }).webp({ quality: 40 }).toFile(path.join(OUT_DIR, lqipName));
products.push(path.join(OUT_DIR, fallbackName), path.join(OUT_DIR, lqipName));

const manifestPath = path.join(OUTPUT_ROOT, '_manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
manifest[KEY] = {
  src: KEY,
  original: { width, height, bytes: (await fs.stat(SOURCE)).size },
  aspect: 1,
  widths: WIDTHS.filter((value) => value <= width),
  webp,
  avif,
  lqip: `${KEY}-${lqipName.replace(`${BASENAME}-`, '')}`,
  fallback: `${KEY}-${fallbackName.replace(`${BASENAME}-`, '')}`,
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const reportPath = path.join(OUTPUT_ROOT, '_asset-report.md');
const report = await fs.readFile(reportPath, 'utf8');
if (!report.includes(KEY)) {
  const lines = report.split('\n');
  const totalIndex = lines.findIndex((line) => line.startsWith('共 '));
  lines.splice(totalIndex, 0, `| brand/wechat-qr（私有名片裁剪） | ${KEY} | ${width} × ${height} | ${description} |`);
  lines[totalIndex + 1] = lines[totalIndex + 1].replace(/共 (\d+) 张源图/, (_, count) => `共 ${Number(count) + 1} 张源图`);
  await fs.writeFile(reportPath, `${lines.join('\n')}\n`);
}

const totalBytes = (await Promise.all(products.map(async (file) => (await fs.stat(file)).size)))
  .reduce((sum, bytes) => sum + bytes, 0);
console.log(`已生成 ${KEY}（${products.length} 个产物，${(totalBytes / 1024).toFixed(1)} KiB）`);
