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
  'guge/hero/site_and_meido': '《梦回古格》主视觉横幅：左侧为黄昏光线下的古格遗址山体，右侧为主角梅朵手持酥油灯的形象。',
  'guge/hero/site_and_meido_portrait': '《梦回古格》手机英雄图专用竖版裁切：同框保留古格土林遗址与主角梅朵的完整脸部、手持酥油灯主体。',
  'guge/hero/site_and_meido_card': '《梦回古格》作品卡片专用横版裁切：平衡保留古格土林遗址与主角梅朵、酥油灯的主视觉关系。',
  'guge/hero/poster_key': '《梦回古格》横版主视觉海报：古格遗址土林山体与主角梅朵手持酥油灯的半身像，右侧为金色书法标题「梦回古格」与竖排「尘封的凝望」，底部为项目设计说明。',
  'guge/hero/board_banner': '展板顶部的完整主视觉带，含「古格拾忆录」书法标题与中藏双语副题。',
  'guge/field/site_hero_01': '古格王朝遗址所在的土林与荒原全景，蓝天白云下可见远处层叠的山体。',
  'guge/field/site_aerial_01': '无人机俯拍的古格遗址建筑群，可见红殿、白殿与洞窟在崖壁上的分布。',
  'guge/field/site_aerial_02': '无人机俯拍的古格遗址核心区，土林包围中的殿堂与僧舍遗迹。',
  'guge/field/site_valley': '无人机视角下的札达土林峡谷，蜿蜒的道路穿过谷底。',
  'guge/field/site_plain': '阿里高原的广阔荒原与远处土林崖壁，蓝天白云。',
  'guge/field/cave_arch': '由遗址洞窟内部向外望去的框景，远处是土林与山谷。',
  'guge/field/cave_guardian': '古格遗址半山腰洞窟内部，昏暗光线下的供桌与残存壁画。',
  'guge/field/mural_before': '历史资料中的古格壁画与造像影像。',
  'guge/field/mural_after': '古格遗址现存壁画与洞窟的现状照片。',
  'guge/field/survey_01': '实地考察照片：古格遗址洞窟与崖壁结构。',
  'guge/field/survey_02': '实地考察照片：遗址现场的建筑残迹。',
  'guge/field/survey_03': '实地考察照片：古格遗址全景。',
  'guge/world/guge_world_map': '古格项目三层世界结构图：上层人物与展品、中层剧情结构、下层场景与地点，含图例连线。',
  'guge/people/character_scroll': '古格项目人物关系长卷：佛像与卓玛、弹奏果沃琴的祖母、壁画师顿珠、披甲的梅朵、骑马守将丹增与来自现代的玩家。',
  'guge/people/scroll_seg_01': '人物关系长卷第一段：释迦牟尼像、卓玛与年幼的梅朵在佛殿祈福。',
  'guge/people/scroll_seg_02': '人物关系长卷第二段：祖母弹奏果沃琴，壁画师顿珠绘制壁画。',
  'guge/people/scroll_seg_03': '人物关系长卷第三段：披甲的少女梅朵与骑马戍边的守将丹增。',
  'guge/people/scroll_seg_04': '人物关系长卷第四段：身着现代服装的玩家走向古格的世界。',
  'guge/rebuild/wireframe': '三维地形白模：未上色的地形与建筑网格。',
  'guge/rebuild/point_cloud': '由实景扫描得到的点云模型，地形以伪彩色分区呈现。',
  'guge/rebuild/lod_segmentation': '按 LOD 梯度分区的点云模型，不同区域以不同颜色标注。',
  'guge/rebuild/red_temple_layers': '红殿拆解分层图：屋顶层、结构层、内部空间、墙体层与地基层。',
  'guge/rebuild/red_temple_drawings': '红殿的俯视图、正视图与侧视图，附《古格故城》考古报告的复原说明。',
  'guge/reel/render_01': '红殿内部渲染：壁画与殿内结构在暖光下被照亮。',
  'guge/reel/render_02': '红殿外景渲染：雪地与建筑在高对比天光下。',
  'guge/reel/render_03': '梅朵与母亲在佛殿祈福的场景渲染。',
  'guge/reel/render_04': '红殿建筑外观渲染：白墙红顶的殿体与土林背景。',
  'guge/reel/render_05': '梅朵低语场景渲染：少女手持酥油灯的近景。',
  'guge/reel/render_06': '古格大场景渲染：土林、峡谷与遗址整体在云层之下。',
  'guge/play/experience_main': 'Unity 实时场景：红殿内部的释迦牟尼塑像与两侧壁画，第一人称视角。',
  'guge/play/gameplay_mural': 'Unity 实时场景：玩家走近红殿壁画进行检视。',
  'guge/play/node_inventory': '游戏背包界面：九格物品栏与已收集道具。',
  'guge/play/node_mural': '壁画解谜界面：对比壁画细节并填写解读。',
  'guge/play/node_guowoqin': '果沃琴弹奏玩法界面：琴弦与音位提示。',
  'guge/play/node_npc': 'NPC 深度互动界面：与角色梅朵的对话面板。',
  'guge/play/ui_hud': '游戏内 HUD 与任务提示界面。',
  'guge/play/ui_panel': '游戏内信息面板界面。',
  'guge/guide/meido_portrait': '《梦回古格》主角梅朵的形象：少女手持酥油灯，闭眼祈福。',
  'guge/guide/rag_pipeline': 'RAG 增强生成式 AI 助手链路图：语音转文字、LLM、RAG 知识库与语音合成。',
  'guge/guide/ui_dialogue': '游戏内 AI 导览对话界面：玩家提问与角色回答。',
  'guge/guide/ui_voice': '游戏内语音输入界面。',
  'guge/sources/archaeology_report': '1991 年《古格故城》考古报告书影。',
  'guge/sources/artifact_evidence': '文物依据图解：武器与器物的形制结构示意。',
  'guge/sources/statue_restoration': '红殿释迦牟尼塑像复原工程：依据考古资料重建的造像三维形象。',
  'guge/sources/museum_01': '札达县博物馆馆藏文物照片。',
  'guge/sources/museum_02': '札达县博物馆馆藏文物照片。',
  'guge/sources/museum_03': '札达县博物馆馆藏文物照片。',
  'guge/sources/mural_ref_01': '敦煌研究院整理的古格壁画画册资料。',
  'guge/sources/mural_ref_02': '敦煌研究院整理的古格壁画画册资料。',
  'guge/deck/detail_01': '展板局部特写：设计说明与正文段落的排版。',
  'guge/deck/detail_02': '展板局部特写：界面设计规范中的色彩与图标系统。',
  'guge/deck/detail_03': '展板局部特写：红殿建筑结构的拆解与标注，含书法标题。',
  'guge/deck/detail_04': '展板局部特写：语音链路与 RAG 检索流程的信息图表。',
  'guge/deck/mosaic_01': '展板信息结构区域：界面设计、交互流程与角色设定。',
  'guge/deck/mosaic_02': '展板信息结构区域：建筑模型、造像与文物。',
  'guge/deck/mosaic_03': '展板信息结构区域：核心界面展示。',
  'guge/deck/mosaic_04': '展板信息结构区域：关卡一至三的流程与玩法。',
  'guge/deck/mosaic_05': '展板信息结构区域：游戏内截图。',
  'guge/deck/mosaic_06': '展板信息结构区域：关卡设置等距场景与界面。',
  'guge/deck/board_01': '《古格拾忆录》展板一（总览版）：主视觉、设计说明、建筑结构与界面设计。',
  'guge/deck/board_02': '《古格拾忆录》展板二（叙事与技术版）：剧情长卷、三层结构图与技术路线。',
  'guge/deck/board_03': '《古格拾忆录》展板三（玩法与 AI 版）：语音链路、RAG 检索与关卡流程。',
  'guge/deck/board_04': '《古格拾忆录》展板四（考据与界面版）：红殿拆解、扫描模型、文物依据与 UI 规范。',
  'guge/deck/production_flow': '制作流程说明图：从资料整理到最终展示的各个环节。',
  'guge/finale/plateau': '《梦回古格》项目实拍：阿里高原与古格遗址的开场画面。',
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
let manifest = {};
try {
  manifest = JSON.parse(await fs.readFile(path.join(OUTPUT_ROOT, '_manifest.json'), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
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
