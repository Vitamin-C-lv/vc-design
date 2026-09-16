/**
 * Build responsive image derivatives from a private source directory.
 *
 * Usage:
 *   node scripts/assets/build-images.mjs <private-source-root> [output-root]
 *
 * The source root is intentionally required: original images stay outside Git.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceArg = process.argv[2] ?? process.env.ASSET_SOURCE_ROOT;
if (!sourceArg) throw new Error('用法：node scripts/assets/build-images.mjs <private-source-root> [output-root]');

const SOURCE_ROOT = path.resolve(sourceArg);
const OUTPUT_ROOT = path.resolve(
  process.argv[3] ?? process.env.ASSET_OUTPUT_ROOT ?? path.join(process.cwd(), 'public/works'),
);
const WIDTHS = [480, 768, 1200, 1600, 2048];

const descriptions = {
  'awards/guge_china_creative_first_prize': '中国好创意暨全国数字艺术设计大赛文化遗产类全国总决赛一等奖证书，彩色像素边框与中文证书信息构成视觉主体。',
  'awards/guge_milan_design_week_second_prize': '米兰设计周中国高校设计学科师生优秀作品展全国决赛二等奖证书，带有华丽金色纹样边框。',
  'awards/guge_ncda_third_prize': 'NCDA未来设计师全国高校数字艺术设计大赛三等奖证书，白底搭配左侧蓝紫粉渐变艺术图形。',
  'blender/flooded_corridor': '昏暗的积水走廊渲染场景，水面倒映顶灯与漂浮时钟，营造悬疑电影般的氛围。',
  'blender/liquid_material_study': '透明液体从玻璃容器中飞溅而出的材质研究渲染，背景呈现柔和的日落渐变。',
  'blender/old_apartment_scene_01': '暖色阳光照进老公寓楼道，铁艺栏杆、斑驳墙面与门口盆栽形成生活化室内场景。',
  'blender/old_apartment_scene_02': '老式居民楼楼梯转角的阳光场景，门窗贴着喜庆春联，锈蚀栏杆与植物增添年代感。',
  'guanchao/dashboard': '观潮数据产品仪表盘界面，展示政策路径、市场数据卡片与近期热点的浅紫色信息可视化布局。',
  'guge/guge_landscape_01': '古格王朝遗址坐落在层叠土林与群山之间的宽幅风景，夕阳将岩壁染成橙金色。',
  'guge/guge_landscape_02': '古格遗址与荒凉山谷的黄昏全景，紫蓝云层和暖橙色土林形成鲜明对比。',
  'guge/guge_landscape_03': '古格王朝土林遗址横幅风景，低机位展现沉静山地与紫色暮云。',
  'guge/guge_master_poster': '《梦回古格》项目总海报，以古格遗址、骑马人物和金色书法标题串联历史叙事与AI交互VR游戏设计。',
  'guge/guge_world_layers': '古格世界三层关系图，透明背景上叠放人物、剧情节点、场景地形与连线结构。',
  'lihuahua/finding': '花花宠物应用的寻找状态页面，像素风三色小狗坐在米白背景中央并显示“正在寻找花花”。',
  'lihuahua/relaxed': '花花宠物应用的 relaxed 状态界面，像素风三色犬趴卧在卡片中，周围是互动按钮与状态数据。',
  'lihuahua/sleep': '花花宠物应用的 sleep 状态界面，像素风三色小狗闭眼蜷睡，页面以柔和米色营造安静氛围。',
  'misc/smart_planter_concept': '智能花盆产品概念图，白色环抱式容器内生长绿植，黑色屏幕显示湿度72%与温度23℃。',
};

async function listSources(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listSources(full)));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files.sort();
}

async function buildOne(source) {
  const relative = path.relative(SOURCE_ROOT, source).replaceAll(path.sep, '/');
  const category = path.posix.dirname(relative);
  const ext = path.extname(relative);
  const basename = path.basename(relative, ext);
  const key = `${category}/${basename}`;
  const outDir = path.join(OUTPUT_ROOT, category);
  await fs.mkdir(outDir, { recursive: true });

  const stat = await fs.stat(source);
  const image = sharp(source);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error(`无法读取尺寸：${relative}`);

  const base = ext.toLowerCase() === '.png' && meta.hasAlpha && key !== 'guge/guge_world_layers'
    ? image.flatten({ background: '#0a0a0a' })
    : image;
  const widths = WIDTHS.filter((width) => width <= meta.width);
  const webp = [];
  const avif = [];
  const products = [];

  for (const width of widths) {
    const webpName = `${basename}-${width}.webp`;
    const avifName = `${basename}-${width}.avif`;
    await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outDir, webpName));
    await base.clone().resize({ width, withoutEnlargement: true }).avif({ quality: 55 }).toFile(path.join(outDir, avifName));
    webp.push(`${key}-${width}.webp`);
    avif.push(`${key}-${width}.avif`);
    products.push(path.join(outDir, webpName), path.join(outDir, avifName));
  }

  const fallbackWidth = widths.at(-1) ?? meta.width;
  const fallbackName = `${basename}-${fallbackWidth}.jpg`;
  const lqipName = `${basename}-lqip.webp`;
  await base.clone().resize({ width: fallbackWidth, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(path.join(outDir, fallbackName));
  await base.clone().resize({ width: 24, withoutEnlargement: true }).webp({ quality: 40 }).toFile(path.join(outDir, lqipName));
  products.push(path.join(outDir, fallbackName), path.join(outDir, lqipName));

  const totalBytes = (await Promise.all(products.map(async (file) => (await fs.stat(file)).size)))
    .reduce((sum, bytes) => sum + bytes, 0);
  return {
    key,
    relative,
    width: meta.width,
    height: meta.height,
    bytes: stat.size,
    widths,
    webp,
    avif,
    lqip: `${key}-${lqipName.replace(`${basename}-`, '')}`,
    fallback: `${key}-${fallbackName.replace(`${basename}-`, '')}`,
    aspect: Number((meta.width / meta.height).toFixed(4)),
    totalBytes,
    description: descriptions[key] ?? '图像内容已检查，暂无描述。',
  };
}

await fs.access(SOURCE_ROOT);
await fs.mkdir(OUTPUT_ROOT, { recursive: true });
const sources = await listSources(SOURCE_ROOT);
const manifest = {};
const reportRows = [];
const failures = [];

for (const source of sources) {
  try {
    const item = await buildOne(source);
    manifest[item.key] = {
      src: item.key,
      original: { width: item.width, height: item.height, bytes: item.bytes },
      aspect: item.aspect,
      widths: item.widths,
      webp: item.webp,
      avif: item.avif,
      lqip: item.lqip,
      fallback: item.fallback,
    };
    reportRows.push(item);
  } catch (error) {
    failures.push({ source: path.relative(SOURCE_ROOT, source), error: error.message });
  }
}

await fs.writeFile(path.join(OUTPUT_ROOT, '_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const report = [
  '# 静态图片资产报告', '',
  '| 源文件名 | 输出 key | 原始尺寸 | 主观内容描述 |',
  '|---|---|---:|---|',
  ...reportRows.map((item) => `| ${item.relative} | ${item.key} | ${item.width} × ${item.height} | ${item.description} |`),
  '', `共 ${reportRows.length} 张源图；失败 ${failures.length} 张。`,
];
if (failures.length) report.push('', '## 失败项', ...failures.map((failure) => `- ${failure.source}：${failure.error}`));
await fs.writeFile(path.join(OUTPUT_ROOT, '_asset-report.md'), `${report.join('\n')}\n`);

console.log(`源图 ${sources.length} 张，成功 ${reportRows.length} 张，失败 ${failures.length} 张`);
if (failures.length) {
  for (const failure of failures) console.error(`失败：${failure.source} - ${failure.error}`);
  process.exitCode = 1;
}
