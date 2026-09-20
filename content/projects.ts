/**
 * Project content.
 *
 * Four flagships in a locked order (Guge → Lihua → Guanchao → Qinghua) plus the
 * capability reel. Copy rules from the brief:
 *
 * - Write commercial case studies, not a thesis or an academic poster dump.
 * - Never invent clients, quotes, result metrics, team size or awards.
 * - Where authorship is shared, say so plainly in `credits`.
 *
 * Media keys resolve through `lib/media.ts` against `public/works/_manifest.json`.
 */

import type { MoreWorkItem, Project, VideoRef } from './types';

/* ==========================================================================
   FEATURED 01 — 梦回古格 / DREAM GUGE
   The flagship. Proof that VC can carry a genuinely complex problem from
   cultural research and field work, through world building, 3D and AI, all the
   way to a running interactive system — and then design how all of that gets
   explained to someone else.

   ── Naming, resolved ──────────────────────────────────────────────────────
   The project carries four names in its own material, and they are not
   synonyms:
     梦回古格 / DREAM GUGE            the project's name                 → the site's title
     古格拾忆录                        the competition / exhibition edition of the boards
     梦回古格——尘封的凝望              the Milan Design Week entry title
     数字重建古格王朝文化遗产          the SRTP research课题's full name
   The boards are physical artefacts and keep the name printed on them; the case
   study says so out loud in chapter 09 rather than pretending one title wins.

   ── Structure ────────────────────────────────────────────────────────────
   Eleven chapters, and the light/dark rhythm is *directed* rather than
   alternated: two light chapters (the technical plate, the evidence wall) give
   the long dark acts somewhere to breathe. See `GugeCaseStudy` for the curve.
   ========================================================================== */

/* The three silent loops. All three are real screen recordings, trimmed and
   re-encoded — never synthesised, and never presented as a stage the footage
   does not actually contain. */
const gugeRebuildLoop: VideoRef = {
  mp4: '/works/guge/video/rebuild-loop.mp4',
  webm: '/works/guge/video/rebuild-loop.webm',
  poster: '/works/guge/video/poster-rebuild.jpg',
  aspect: 16 / 9,
  caption: '点云彩色分区：地形与建筑被逐块归类（项目实机录屏，6 秒静音循环）',
};

const gugeProcessReel: VideoRef = {
  mp4: '/works/guge/video/process-reel.mp4',
  webm: '/works/guge/video/process-reel.webm',
  poster: '/works/guge/video/poster-reel.jpg',
  aspect: 16 / 9,
  caption: '三维制作过程节选：网格 → 地形 → 材质与大气 → 最终世界（12 秒，静音）',
};

const gugePlayLoop: VideoRef = {
  mp4: '/works/guge/video/play-loop.mp4',
  webm: '/works/guge/video/play-loop.webm',
  poster: '/works/guge/video/poster-play.jpg',
  aspect: 16 / 9,
  caption: 'Unity 第一人称漫游：红殿内部与壁画检视（10 秒静音循环）',
};

const gugeGuideLoop: VideoRef = {
  mp4: '/works/guge/video/guide-loop.mp4',
  webm: '/works/guge/video/guide-loop.webm',
  poster: '/works/guge/video/poster-guide.jpg',
  aspect: 16 / 9,
  caption: 'AI 导览对话：提问、基于知识库回答、给出下一步线索（静音循环）',
};

/** The five boards-and-film stills shared across chapters. */
const gugeFilm: VideoRef = {
  mp4: '/works/guge/video/mengu-loop.mp4',
  webm: '/works/guge/video/mengu-loop.webm',
  poster: '/works/guge/video/poster-1600.jpg',
  posterSrcSet:
    '/works/guge/video/poster-1200.jpg 1200w, /works/guge/video/poster-1600.jpg 1600w, /works/guge/video/poster-2048.jpg 2048w',
  aspect: 3838 / 2160,
  caption: '《梦回古格》项目实拍：阿里札达土林与古格遗址（静音循环）',
};

export const guge: Project = {
  slug: 'guge',
  order: 1,
  featured: true,
  title: 'DREAM GUGE',
  titleZh: '梦回古格',
  tagline: 'A vanished kingdom you can walk into, and ask questions of.',
  taglineZh: '一个消失的王朝，一套可以走进去、可以提问的完整系统。',
  tags: ['AI', 'VR', '3D', 'VISUAL STORYTELLING'],
  year: '2025',
  accent: '#C9A227',
  badge: 'NATIONAL AWARDS ×3',
  /*
   * The banner is 3.19:1; the shared `/work` tile is 1.55:1 and kept 48% of it —
   * half the banner, with the figure against the right edge. This crop is
   * composed for that tile from the same source, so the tile shows a picture
   * rather than a slice.
   */
  coverTile: {
    key: 'guge/hero/site_and_meido_card',
    alt: '《梦回古格》主视觉：土林遗址与手持酥油灯的主角梅朵',
    focal: '50% 50%',
  },
  cover: {
    key: 'guge/hero/site_and_meido',
    alt: '古格王朝遗址山体与《梦回古格》主角梅朵，暖金色黄昏光线下的项目主视觉',
    focal: '40% 46%',
  },
  meta: [
    { label: 'PROJECT', value: '数字重建古格王朝文化遗产（SRTP 课题）' },
    { label: 'TYPE', value: 'AI + VR 沉浸式文化体验' },
    { label: 'SCOPE', value: '文化研究 / 视觉系统 / 三维构建 / 交互叙事 / AI / 展陈设计' },
    { label: 'STACK', value: 'RAG 知识引擎 · LLM · 语音克隆 · 实时三维 · VR' },
    { label: 'STATUS', value: '可运行原型 + 完整展陈方案' },
  ],
  summary:
    '古格王朝留下的不是一件可以单独陈列的展品，而是一整片遗址、壁画、造像与文献——信息分散、门槛高、而且正在消失。这个项目先做了实地考察与资料考证，再把庞杂的文化材料整理成「人物／剧情／地点」三层结构，用实景扫描与三维流程重建可以走进去的世界，再用 RAG 知识引擎驱动一个叫梅朵的 AI 导览。从研究、世界构建、三维与 AI，到最终的展板与演示设计，整套成果由同一条链路完成。',
  summaryEn:
    'Field research → world building → 3D → AI → interaction → and the design of how all of it is explained.',
  sections: [
    /* ------------------------------------------------------------------ 00 */
    {
      id: 'dream',
      index: '00',
      eyebrow: 'DREAM GUGE',
      title: 'DREAM GUGE',
      titleZh: '梦回古格',
      body: [],
      layout: 'full',
      media: [
        {
          key: 'guge/hero/site_and_meido',
          alt: '古格王朝遗址山体与《梦回古格》主角梅朵，暖金色黄昏光线下的项目主视觉',
          focal: '40% 46%',
        },
      ],
    },

    /* ------------------------------------------------------------------ 01 */
    {
      id: 'site',
      index: '01',
      eyebrow: 'THE REAL SITE',
      tone: 'paper',
      title: 'BEFORE REBUILDING THE WORLD, WE WENT TO SEE WHAT WAS LEFT.',
      titleZh: '在重建这个世界之前，我们先去看了剩下什么。',
      body: [
        '古格王朝在西藏阿里存在了七百年，留下了遗址、壁画、造像与文献。但这些材料不是为某个项目准备好的：它们散落在考古报告、学术论文、地方资料与图像档案里，彼此之间没有一条现成的线索。',
        '更紧迫的是，它们正在消失。那些见证过历史的精美壁画和石窟，正随着岁月的剥蚀和自然环境的恶化，逐渐从世人的记忆中褪色。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'media',
          span: 'full',
          media: {
            key: 'guge/field/site_hero_01',
            alt: '古格王朝遗址所在的土林与荒原全景，蓝天白云下可见远处层叠的山体',
            caption: '古格王朝遗址：土林、洞窟与山顶王城构成的空间关系（2025 年 6 月实地拍摄）',
          },
        },
        {
          kind: 'compare',
          left: {
            label: 'ARCHIVE',
            zh: '历史资料与壁画',
            media: {
              key: 'guge/field/mural_before',
              alt: '古格壁画与造像的历史影像资料',
              caption: '资料中的壁画与造像',
            },
          },
          right: {
            label: 'NOW',
            zh: '遗址现状',
            media: {
              key: 'guge/field/mural_after',
              alt: '古格遗址现存壁画与洞窟的现状照片',
              caption: '今天还能看到的残存',
            },
          },
        },
        {
          kind: 'quote',
          zh: '在半山腰一个逼仄的洞窟里，我们遇到了一位当地居民。他日复一日地守在这里，只为保护里屋墙上仅存的壁画。',
          attribution: '《梦回古格》项目实地考察记录',
        },
        /*
         * `guge/field/cave_guardian` was here. The file is 1600×900 at 51 KB —
         * a mountain-and-cloud landscape that both looked blown up at full
         * width and did not show the cave interior its alt text described. The
         * asset stays registered for use as a background; the sentence it
         * carried is kept as a note.
         */
        {
          kind: 'note',
          zh: '古格不只是冰冷的遗迹，它依然是鲜活的信仰与传承。',
        },
        {
          kind: 'mediaRow',
          columns: 4,
          mobile: 'scroll',
          items: [
            {
              key: 'guge/field/survey_01',
              alt: '实地考察照片：用卷尺丈量壁画的残损与裂隙',
              caption: '壁画现状勘察',
            },
            {
              key: 'guge/field/survey_02',
              alt: '实地考察照片：崖壁上的洞窟群与下方的河谷',
              caption: '洞窟与崖壁',
            },
            {
              /*
               * Was `guge/field/survey_03`, which is a photograph of the red
               * temple's interior — not the site panorama its caption claimed.
               * This is an actual aerial of the ruins, from the same shoot.
               */
              key: 'guge/field/site_aerial_01',
              alt: '实地考察照片：从空中俯瞰古格遗址的城墙、殿宇与土林地貌',
              caption: '遗址全景',
            },
            {
              key: 'guge/field/cave_arch',
              alt: '由洞窟内部向外望去的框景，远处是土林与山谷',
              caption: '洞窟框景',
            },
          ],
        },
      ],
      note: '考察影像为项目团队 2025 年 6 月在西藏阿里札达实地拍摄的原始素材。',
    },

    /* ------------------------------------------------------------------ 02 */
    {
      id: 'story',
      index: '02',
      eyebrow: 'FROM SITE TO STORY',
      tone: 'ink',
      title: 'FROM SITE TO STORY.',
      titleZh: '从遗址，到可以被走进去的叙事结构。',
      body: [
        '把庞杂的文化资料整理成能同时被程序与叙事使用的三层结构，是整个项目最关键的一次抽象。资料先被归位，才可能被漫游。',
        '三层的分工是逐层收敛的：底层给出真实的物理空间，中层把事件与动线挂到具体地点上，上层承载人物、文物与信仰线索。三者在同一套坐标里对齐——观众走到哪里，故事和人就在哪里出现。',
      ],
      bullets: [
        'LEVEL 1 · 人物与展品 —— 承载文化记忆与信仰线索：人物、文物、壁画与信仰脉络',
        'LEVEL 2 · 剧情结构 —— 把事件与动线挂到具体地点上：古格遗址、洞窟场景、第 85 窟',
        'LEVEL 3 · 场景与地点 —— 还原地理地貌与建筑遗址，为叙事搭建真实的空间载体',
      ],
      piece: 'layers',
      layout: 'full',
      media: [
        {
          key: 'guge/world/guge_world_map',
          alt: '古格项目三层世界结构图：上层为人物与展品，中层为剧情结构，下层为遗址场景与地点，三层以轴线对齐',
          caption: '底层场景与地点 → 中层剧情结构 → 上层人物与展品：三层在同一套坐标里对齐',
          focal: '50% 50%',
        },
      ],
      note: '结构图出自项目展板。三层共用一套坐标，是场景、剧情与导览数据能够互相对齐的前提。',
    },

    /* ------------------------------------------------------------------ 03 */
    {
      id: 'people',
      index: '03',
      eyebrow: 'A WORLD OF PEOPLE',
      tone: 'ink',
      title: "WE DIDN'T JUST REBUILD A SITE. WE BUILT A WORLD AROUND IT.",
      titleZh: '我们不只重建了一处遗址，我们在它周围建了一个世界。',
      body: [
        '遗址本身不构成体验。真正让这个项目成立的，是围绕遗址建立起的人物关系网：王宫画师顿珠、他的女儿梅朵、边境守将丹增、母亲卓玛，以及把果沃琴和古老史诗传下去的祖母。',
        '项目围绕少女「梅朵」的成长与情感线，构建了完整的人物关系网。作为玩家的向导与伙伴，梅朵不只是剧情的推动者，也是连接过去与现在的纽带。',
      ],
      piece: 'panorama',
      layout: 'full',
      media: [
        {
          key: 'guge/people/character_scroll',
          alt: '古格项目人物关系长卷：释迦牟尼像与卓玛、弹奏果沃琴的祖母、壁画师顿珠、披甲的少女梅朵、骑马守将丹增，以及来自现代的玩家',
          caption: '人物关系长卷：信仰、家族、王族与守护，以及走进这个世界的玩家',
        },
        {
          key: 'guge/people/scroll_seg_01',
          alt: '人物关系长卷第一段：释迦牟尼像、卓玛与年幼的梅朵在佛殿祈福',
          caption: '01 · 遗址与信仰 —— 卓玛与年幼的梅朵在古格佛殿祈福',
        },
        {
          key: 'guge/people/scroll_seg_02',
          alt: '人物关系长卷第二段：祖母弹奏果沃琴，壁画师顿珠在墙壁上绘制壁画',
          caption: '02 · 家族与手艺 —— 祖母的果沃琴，顿珠的壁画',
        },
        {
          key: 'guge/people/scroll_seg_03',
          alt: '人物关系长卷第三段：披甲的少女梅朵与骑马戍边的守将丹增',
          caption: '03 · 王族与守护 —— 梅朵与丹增',
        },
        {
          key: 'guge/people/scroll_seg_04',
          alt: '人物关系长卷第四段：身着现代服装的玩家走向古格的世界',
          caption: '04 · 玩家进入世界 —— 从现代走进古格',
        },
      ],
      blocks: [
        {
          kind: 'quote',
          zh: '城墙会倒。人会死。可歌声不会。',
          attribution: '祖母 · 剧情设定',
        },
        {
          kind: 'quote',
          zh: '壁画会比人活得更久。',
          attribution: '顿珠 · 剧情设定',
        },
        {
          kind: 'pillars',
          columns: 4,
          items: [
            { label: '梅朵', zh: '王宫画师顿珠之女。玩家的向导与伙伴，连接过去与现在的纽带。' },
            { label: '顿珠', zh: '宫廷壁画师。他把女儿的发辫样式悄悄画进壁画角落，成了藏在信仰里的家庭暗号。' },
            { label: '丹增', zh: '边境守将，梅朵的恋人。出征前把佩刀交给她保管。' },
            { label: '卓玛 · 祖母', zh: '母亲与祖母——信仰、果沃琴、宣舞与羌姆的传续者。' },
          ],
        },
        {
          kind: 'note',
          zh: '人物与台词出自项目剧情设定文档。三版剧情大纲（穿越、学徒、遗物触发）中的角色体系一致，此处引用的是它们共同的部分。',
        },
      ],
    },

    /* ------------------------------------------------------------------ 04 */
    {
      id: 'rebuild',
      index: '04',
      eyebrow: 'REBUILDING THE SITE',
      tone: 'paper',
      title: 'FROM REAL SITE TO DIGITAL TERRAIN.',
      titleZh: '从真实遗址，到可以走进去的数字地形。',
      body: [
        '三维不是凭想象搭出来的。项目先通过实景扫描获取遗址的精确数据，再逐层清理、分区、重构地形与建筑，最后才进入材质与灯光——从白模到上色，每一步都留下了记录。',
        '为了让这些模型能在实时环境里跑动，团队使用了「中心聚焦式梯度压缩」（LOD）：远处降低精度、近处保留细节，在极致还原的同时保障探索过程的流畅。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'flow',
          label: 'PIPELINE',
          steps: ['REAL SITE', 'SCAN', 'POINT CLOUD', 'SEGMENTATION', 'TERRAIN', 'RENDER'],
        },
        { kind: 'video', video: gugeRebuildLoop },
        /* 分组规则：同一排里的图，比例要接近，否则矮的那张下面会空出一大块。
           两张点云同为 1.77 配对；竖版展板（0.89）与白模（1.35）配对；
           3.57:1 的图纸条独占整幅——它塞进任何半栏都会变成一条缝。 */
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/rebuild/point_cloud',
              alt: '由实景扫描得到的点云模型',
              caption: '扫描点云',
            },
            {
              key: 'guge/rebuild/lod_segmentation',
              alt: '按 LOD 分区的点云模型，不同区域以不同颜色标注',
              caption: 'LOD 分区',
            },
          ],
        },
        /*
         * This row used to pair the exploded diagram with
         * `guge/rebuild/wireframe`, captioned 「白模：未上色的地形与建筑网格」.
         * That file is a dark, atmospheric landscape render — no mesh, no white
         * model — and the source material has no untextured model to swap in
         * (the only candidate on the boards is 520×320, which would ship blurry
         * again). The row is now the diagram alone, re-cut from the 5486px board
         * so it carries its five layer labels at full resolution.
         */
        {
          kind: 'media',
          span: 'plate',
          media: {
            key: 'guge/rebuild/red_temple_layers',
            alt: '红殿拆解分层图：从屋顶层、结构层、内部空间、围墙层到地基层的红殿结构拆解',
            caption: '红殿拆解分层：屋顶层 / 结构层 / 内部空间 / 围墙层 / 地基层',
          },
        },
        {
          kind: 'media',
          span: 'full',
          media: {
            key: 'guge/rebuild/red_temple_drawings',
            alt: '红殿的正视图、侧视图、俯视图与平面图',
            caption: '红殿正视图 / 侧视图 / 俯视图与平面图',
          },
        },
      ],
      note: '点云分区与地形重建来自项目真实录屏；建筑图纸出自展板上的红殿拆解图。',
    },

    /* ------------------------------------------------------------------ 05 */
    {
      id: 'built',
      index: '05',
      eyebrow: 'BUILT IN 3D',
      tone: 'ink',
      title: 'BUILT IN 3D. DESIGNED FOR THE STORY.',
      titleZh: '在三维里建出来，为故事而设计。',
      body: [
        '项目里的大量画面是实际构建与渲染的结果，不是 AI 生成的概念图。地形、建筑、材质、大气与最终镜头，全部在三维流程里完成。',
        '下面这段过程影片是真实工作录屏的节选：从点云与网格，到地形几何，再到材质与大气，最后落到成片里的世界。',
      ],
      layout: 'full',
      blocks: [
        { kind: 'video', video: gugeProcessReel },
        {
          kind: 'flow',
          label: 'THREE-DIMENSIONAL PROCESS',
          steps: ['MESH', 'TERRAIN', 'MATERIAL & ATMOSPHERE', 'FINAL WORLD'],
        },
        {
          kind: 'mediaRow',
          columns: 3,
          items: [
            {
              key: 'guge/reel/render_01',
              alt: '红殿内部渲染：壁画与殿内结构在暖光下被照亮',
              caption: '红殿交互壁画 · དམར་ཐང་ འཇུག་ ཕྱོགས་ བརྗོད་',
            },
            {
              key: 'guge/reel/render_02',
              alt: '红殿外景渲染：雪地与建筑在高对比天光下',
              caption: '红殿外景 · དམར་ཐང་ ཕྱི་ རོལ་',
            },
            {
              key: 'guge/reel/render_03',
              alt: '梅朵与母亲在佛殿祈福的场景渲染',
              caption: '梅朵与母亲祈福场景 · མེ་ཏོག་ དང་ ཨ་མ་',
            },
          ],
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/reel/render_04',
              alt: '红殿建筑外观渲染：白墙红顶的殿体与土林背景',
              caption: '红殿建筑图 · དམར་ཐང་ གི་ བཟོ་ བཀོད་',
            },
            {
              key: 'guge/reel/render_05',
              alt: '梅朵低语场景渲染：少女手持酥油灯的近景',
              caption: '梅朵低语场景 · མེ་ཏོག་ གི་ སྐད་ཆ་',
            },
          ],
        },
        {
          kind: 'media',
          span: 'full',
          media: {
            key: 'guge/reel/render_06',
            alt: '古格大场景渲染：土林、峡谷与遗址整体在云层之下',
            caption: '古格大场景 · གུ་གེ་ ཡི་ ཡོངས་ སུ་ གནས་ པ།',
          },
        },
      ],
      note: '渲染图与过程影片均来自项目自身的三维制作与展板，未使用 AI 生成图像。',
    },

    /* ------------------------------------------------------------------ 06 */
    {
      id: 'inside',
      index: '06',
      eyebrow: 'STEP INSIDE',
      tone: 'ink',
      title: 'STEP INSIDE THE RUINS.',
      titleZh: '走进遗址内部。',
      body: [
        '体验层由四部分构成：VR 探索、NPC 对话、任务系统与智能导览。玩家以第一人称视角在深度还原的红殿与洞窟之间行走，遇到角色、接受任务、提出问题。',
        '背包、壁画解谜与果沃琴解谜把「看」变成「做」：循着残破壁画的痕迹补全丢失的内容，还原壁画的真实样貌，以此解锁尘封的乐谱，奏响曾在这片土地上久久回响的古老乐曲。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'media',
          span: 'full',
          media: {
            key: 'guge/play/experience_main',
            alt: 'Unity 实时场景：玩家第一人称视角下的红殿内部与壁画',
            caption: '第一人称视角下的红殿：玩家可以走近、检视并解读每一幅壁画',
          },
        },
        { kind: 'video', video: gugePlayLoop },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              /*
               * Was captioned 「背包界面」. The file is an in-game view of a
               * multi-armed deity mural with the interaction cursor on it —
               * there is no inventory UI in the frame, and no screenshot of
               * one exists in the source material (the only candidate is a
               * 300px panel inside the deck page below, which would ship
               * blurry). Caption now describes what is actually shown.
               */
              key: 'guge/play/node_inventory',
              alt: '游戏内场景：第一人称凑近检视多臂神像壁画，画面中央为交互光标',
              caption: '壁画检视 —— 凑近看每一处细节',
            },
            {
              key: 'guge/play/node_mural',
              alt: '壁画解谜界面：对比壁画细节并填写解读',
              caption: '壁画解谜 —— 找图、解读、提交记录',
            },
          ],
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              /* Same situation: the frame is a stone offering table, not the
                 lute-playing UI the old caption described. */
              key: 'guge/play/node_guowoqin',
              alt: '游戏内场景特写：红墙前的石供桌，桌面刻有盘长纹样，右侧为交互高光',
              caption: '供桌与盘长纹样',
            },
            {
              key: 'guge/play/node_npc',
              alt: 'NPC 深度互动界面：与角色梅朵的对话面板',
              caption: 'NPC 深度互动 —— 与梅朵并肩同行',
            },
          ],
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/play/scene_red_temple',
              alt: '演示页面：核心交互场景红殿 —— 团队 VR 测试实拍、Unity 编辑器界面，以及艺术巅峰之地、NPC 深度互动、历史探索使命三栏说明',
              caption: '核心交互场景：红殿',
            },
            {
              key: 'guge/play/core_gameplay',
              alt: '演示页面：核心交互玩法 —— 供桌、壁画解谜、背包与果沃琴弹奏界面，以及果沃琴解谜说明',
              caption: '核心交互玩法',
            },
          ],
        },
      ],
      note: '以上为项目实机界面截图与 Unity 录屏，不是设计稿或效果图。',
    },

    /* ------------------------------------------------------------------ 07 */
    {
      id: 'guide',
      index: '07',
      eyebrow: 'MEIDO · AI GUIDE',
      tone: 'ink',
      title: 'A CHARACTER THAT KNOWS THE WORLD.',
      titleZh: '一个真正懂这个世界的角色。',
      body: [
        '梅朵不只是向导，她是玩家的伙伴。玩家可以随时向她提问，她会基于真实资料回答，并把话题引回场景里值得看的地方。',
        '这背后是三条链路：RAG 知识库负责事实，LLM 负责表达，语音克隆负责声线；再加上智能寻路，让每一次回答都能落到具体地点与下一步线索上。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'media',
          span: 'half',
          media: {
            key: 'guge/guide/meido_portrait',
            alt: '《梦回古格》主角梅朵的形象：少女手持酥油灯，闭眼祈福',
            caption: '梅朵 —— 玩家的向导与伙伴',
          },
        },
        {
          kind: 'pillars',
          columns: 4,
          items: [
            { label: 'KNOWLEDGE', zh: '知识库：壁画、文物、历史文献、考古资料与专家解读，先归位再检索。' },
            { label: 'MEMORY', zh: '记忆：记住玩家问过什么、走到哪里，让对话接得上。' },
            { label: 'VOICE', zh: '语音：语音转文字进入模型，语音克隆还原角色声线。' },
            { label: 'NAVIGATION', zh: '寻路：回答之后给出下一步线索，把话题接回场景。' },
            { label: 'NARRATIVE', zh: '叙事：回答按角色设定与所处地点组织，而不是通用百科口吻。' },
          ],
        },
        {
          kind: 'flow',
          steps: ['提问', '检索知识库', '基于真实资料回答', '给出下一步探索线索'],
        },
        {
          kind: 'media',
          span: 'wide',
          media: {
            key: 'guge/guide/rag_pipeline',
            alt: 'RAG 增强生成式 AI 助手链路图：用户经语音转文字进入 LLM，检索 RAG 知识库后生成引导指令与文本，再由语音合成输出到虚拟角色',
            caption: 'RAG 增强生成式 AI 助手链路（出自项目技术说明）',
          },
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/guide/ui_dialogue',
              alt: '游戏内 AI 导览对话界面：玩家提问与角色回答',
              caption: '导览对话界面（实机）',
            },
            {
              key: 'guge/guide/ui_voice',
              alt: '游戏内语音输入界面',
              caption: '语音输入界面（实机）',
            },
          ],
        },
        { kind: 'video', video: gugeGuideLoop },
      ],
      note: '对话界面为项目实机截图；链路图出自项目自身的技术说明。',
    },

    /* ------------------------------------------------------------------ 08 */
    {
      id: 'proof',
      index: '08',
      eyebrow: 'SOURCES & RECONSTRUCTION',
      tone: 'paper',
      title: 'NOT IMAGINED. RECONSTRUCTED.',
      titleZh: '不是想象出来的，是考证出来的。',
      body: [
        '文化类内容一旦出现事实性错误，前面建立的信任会立刻归零。所以项目里每一件物品——从弓箭、短剑到果沃琴——都要求有史料依据。',
        '团队查阅了 1991 年《古格故城》考古报告，并与札达县博物馆馆藏文物进行仔细比对，确保数字重建的准确性与严谨性。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'quote',
          zh: '数字重建并非凭空想象，而是建立在严谨的史料考证之上。',
          attribution: '项目资产溯源说明',
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/sources/archaeology_report',
              alt: '1991 年《古格故城》考古报告书影',
              caption: '1991 年《古格故城》考古报告（西藏自治区文物管理委员会编）',
            },
            {
              key: 'guge/sources/artifact_evidence',
              alt: '文物依据图解：武器的形制与结构示意',
              caption: '物品形制依据：每一件道具都能追到具体出处',
            },
          ],
        },
        {
          kind: 'pillars',
          columns: 4,
          items: [
            { label: 'FIELD RESEARCH', zh: '实地考察：2025 年 6 月，西藏阿里札达。' },
            { label: 'ARCHAEOLOGICAL RECORDS', zh: '考古报告：1991 年《古格故城》。' },
            { label: 'MUSEUM COLLECTIONS', zh: '馆藏比对：札达县博物馆藏品。' },
            { label: 'DIGITAL RECONSTRUCTION', zh: '数字复原：塑像、壁画、乐器和器物。' },
          ],
        },
        {
          kind: 'media',
          span: 'wide',
          media: {
            key: 'guge/sources/statue_restoration',
            alt: '红殿释迦牟尼塑像复原工程：依据考古资料重建的造像三维形象',
            caption: '重点文物复原：红殿释迦牟尼塑像——消失半世纪的庄严法相',
          },
        },
        {
          kind: 'mediaRow',
          columns: 3,
          items: [
            {
              key: 'guge/sources/museum_01',
              alt: '札达县博物馆馆藏文物照片',
              caption: '札达县博物馆藏品',
            },
            {
              key: 'guge/sources/museum_02',
              alt: '札达县博物馆馆藏文物照片',
              caption: '札达县博物馆藏品',
            },
            {
              key: 'guge/sources/museum_03',
              alt: '札达县博物馆馆藏文物照片',
              caption: '札达县博物馆藏品',
            },
          ],
        },
        {
          kind: 'mediaRow',
          columns: 2,
          items: [
            {
              key: 'guge/sources/mural_ref_01',
              alt: '敦煌研究院整理的古格壁画画册资料',
              caption: '壁画参考资料（敦煌研究院）',
            },
            {
              key: 'guge/sources/mural_ref_02',
              alt: '敦煌研究院整理的古格壁画画册资料',
              caption: '壁画参考资料（敦煌研究院）',
            },
          ],
        },
      ],
      note: '本页所有来源均为项目自身引用过的资料：1991 年《古格故城》考古报告、札达县博物馆馆藏、敦煌研究院壁画资料，以及团队实地拍摄的影像。',
    },

    /* ------------------------------------------------------------------ 09 */
    {
      id: 'craft',
      index: '09',
      eyebrow: 'PRESENTATION & VISUAL SYSTEM',
      tone: 'ink',
      title: 'THE PROJECT WAS COMPLEX. SO WAS THE CHALLENGE OF EXPLAINING IT.',
      titleZh: '项目本身很复杂，把它讲清楚是另一件难事。',
      body: [
        '研究、三维、交互和考据叠在一起，很容易变成一堆谁也看不懂的图。这个项目最终交付的不只是系统，还有一整套把它讲清楚的视觉方案：展板、演示文稿、界面规范与信息图表。',
      ],
      layout: 'full',
      piece: 'mosaic',
      media: [
        {
          key: 'guge/deck/detail_04',
          alt: '展板局部特写：语音链路与 RAG 检索流程的信息图表',
          caption: '技术架构 · 语音为桥，RAG 为证',
          focal: '35% 50%',
        },
        {
          key: 'guge/deck/detail_cast',
          alt: '展板局部特写：人物关系长卷，卓玛、祖母、顿珠、少女梅朵与丹增各有中藏双语标注与说明',
          caption: '场景与角色关系 · 一群有名字的人',
          focal: '50% 50%',
        },
        {
          key: 'guge/deck/detail_02',
          alt: '展板局部特写：界面设计规范中的色彩与图标系统',
          caption: 'UI / 图标系统 · 色板与图形语言',
          focal: '42% 50%',
        },
        {
          key: 'guge/deck/detail_03',
          alt: '展板局部特写：红殿建筑结构的拆解与标注',
          caption: '三维结构 / 信息图 · 把建筑讲成一张图',
          focal: '50% 42%',
        },
      ],
      blocks: [
        {
          kind: 'mediaLinkRow',
          columns: 4,
          layered: true,
          label: '02 / PORTFOLIO WALL · 展板墙',
          items: [
            {
              href: '/works/guge/deck/board_01-2048.jpg',
              label: 'BOARD 01',
              note: '主视觉与设计说明',
              media: {
                key: 'guge/deck/board_01',
                alt: '《古格拾忆录》展板一：总览版',
                caption: '总览版',
              },
            },
            {
              href: '/works/guge/deck/board_02-2048.jpg',
              label: 'BOARD 02',
              note: '信息结构与技术图解',
              media: {
                key: 'guge/deck/board_02',
                alt: '《古格拾忆录》展板二：叙事与技术版',
                caption: '叙事与技术',
              },
            },
            {
              href: '/works/guge/deck/board_03-2048.jpg',
              label: 'BOARD 03',
              note: '玩法流程与 AI 链路',
              media: {
                key: 'guge/deck/board_03',
                alt: '《古格拾忆录》展板三：玩法与 AI 版',
                caption: '玩法与 AI',
              },
            },
            {
              href: '/works/guge/deck/board_04-2048.jpg',
              label: 'BOARD 04',
              note: '考据资料与界面规范',
              media: {
                key: 'guge/deck/board_04',
                alt: '《古格拾忆录》展板四：考据与界面版',
                caption: '考据与界面',
              },
            },
          ],
        },
        {
          kind: 'deckMosaic',
          label: '03 / PRESENTATION DESIGN · 演示设计',
          zh: '两套演示文稿共五十余页，这里放视觉最强的八页。要证明的是「被设计过」，不是「页数多」。',
          items: [
            {
              key: 'guge/deck/ppt_01',
              alt: '演示文稿第 3 页：01 掩埋在土林中的回音，项目背景与价值',
              caption: '章节页 · 项目背景与价值',
            },
            {
              key: 'guge/deck/ppt_02',
              alt: '演示文稿第 5 页：七百年的辉煌骤然消亡，配壁画与遗址照片',
              caption: '叙事页 · 七百年的辉煌骤然消亡',
            },
            {
              key: 'guge/deck/ppt_03',
              alt: '演示文稿第 9 页：02 VR 实机演示与交互设计',
              caption: '章节页 · VR 实机演示与交互设计',
            },
            {
              key: 'guge/deck/ppt_04',
              alt: '演示文稿第 11 页：核心玩法——第一人称视角的深度探索',
              caption: '玩法页 · 第一人称深度探索',
            },
            {
              key: 'guge/deck/ppt_05',
              alt: '演示文稿第 12 页：核心交互场景红殿，三栏信息结构',
              caption: '场景页 · 红殿',
            },
            {
              key: 'guge/deck/ppt_06',
              alt: '演示文稿第 15 页：核心交互玩法 NPC 深度互动与 RAG 链路',
              caption: 'AI 页 · NPC 深度互动',
            },
            {
              key: 'guge/deck/ppt_07',
              alt: '演示文稿第 21 页：重点文物复原——红殿释迦牟尼塑像复原工程',
              caption: '考据页 · 塑像复原工程',
            },
            {
              key: 'guge/deck/ppt_08',
              alt: '演示文稿第 23 页：资产溯源，引用 1991 年《古格故城》考古报告',
              caption: '考据页 · 资产溯源',
            },
          ],
        },
        {
          kind: 'flow',
          label: 'ONE LINE THROUGH ALL OF IT',
          steps: ['RESEARCH', 'SYSTEM', 'STORY', 'PRESENTATION'],
        },
        {
          kind: 'quote',
          size: 'lg',
          zh: '我们做作品，也做作品被看懂的方式。',
          en: 'WE DESIGN THE WORK. AND HOW THE WORK IS UNDERSTOOD.',
        },
        {
          kind: 'note',
          zh: '展板上印的标题是《古格拾忆录》，那是本项目的参赛与展陈版次；课题与叙事的正式名称是《梦回古格》。两者是同一套成果的不同版次，展板实物保持原样。',
        },
      ],
    },

    /* ------------------------------------------------------------------ 10 */
    {
      id: 'outcome',
      index: '10',
      eyebrow: 'OUTCOME',
      tone: 'ink',
      title: "A DIGITAL GUGE THAT DOESN'T COLLAPSE.",
      titleZh: '一座不会坍塌的数字古格。',
      body: [
        '项目最终交付了可运行的交互原型与完整的展陈方案：扫描与建模数据、Unity 实时场景、由 RAG 知识引擎驱动的 AI 导览，以及四张展板与两套演示文稿。',
        '这些材料随后参加了多个全国性设计竞赛，在三个不同的评审体系中获得全国总决赛奖项。奖项的意义不在名次，而在于它证明：从研究到实现的完整链路，经得起外部专业评审的检验。',
      ],
      layout: 'full',
      blocks: [
        {
          kind: 'media',
          span: 'full',
          media: {
            key: 'guge/finale/plateau',
            alt: '《梦回古格》项目实拍：阿里高原与古格遗址的开场画面',
            caption: '古格王朝（约 10 世纪—17 世纪）——虽已消失，但从未被遗忘',
          },
        },
        { kind: 'video', video: gugeFilm },
      ],
      note: '本项目为团队协作完成的研究与设计实践成果，所获奖项归属于项目本身。',
    },
  ],
  recognition: [
    {
      work: '《古格拾忆录》',
      award: '中国好创意暨全国数字艺术设计大赛',
      result: '全国总决赛一等奖',
      mediaKey: 'awards/guge_china_creative_first_prize',
    },
    {
      work: '《古格拾忆录》',
      award: '未来设计师 · 全国高校数字艺术设计大赛（NCDA）',
      result: '全国总决赛三等奖',
      mediaKey: 'awards/guge_ncda_third_prize',
    },
    {
      work: '《梦回古格——尘封的凝望》',
      award: '米兰设计周 · 中国高校设计学科师生优秀作品展',
      result: '全国决赛二等奖',
      mediaKey: 'awards/guge_milan_design_week_second_prize',
    },
  ],
  /*
   * Credits state authorship plainly and stay inside what is actually known.
   * The project is a five-person SRTP team; VC's part is named, and nothing is
   * claimed about anyone else's contribution.
   */
  credits: [
    '本项目为团队协作完成的研究与设计实践，所获奖项归属于项目本身。',
    'VC 参与文化研究、视觉提取、视觉系统与三维资产设计。',
    'VC 参与交互叙事、AI 导览方案与交互原型实现。',
  ],
  video: gugeFilm,
  /*
   * The home-page mini case.
   *
   * Guge is the one project broad enough that a cover image alone undersells it:
   * a visitor could reasonably read any single frame as "a culture-themed VR
   * student project". Three slices — a built world, three-dimensional craft, and
   * a working AI guide — are the minimum that makes the real scale legible. Each
   * one links to the chapter that proves it, so the home page promises and the
   * case page delivers.
   */
  homeSlices: [
    {
      label: 'WORLD BUILDING',
      zh: '不是复原一处废墟，是围绕它建起一个有人的世界。',
      anchor: 'people',
      media: {
        key: 'guge/people/scroll_seg_03',
        alt: '古格项目人物关系长卷第三段：披甲的少女梅朵与骑马戍边的守将丹增',
      },
    },
    {
      label: '3D / BLENDER / CGI',
      zh: '地形、建筑、材质与大气，全部在三维流程里建出来并渲染。',
      anchor: 'built',
      media: {
        key: 'guge/reel/render_06',
        alt: '古格大场景渲染：土林、峡谷与遗址整体在云层之下',
      },
    },
    {
      label: 'AI / VR',
      zh: 'RAG 知识库驱动的角色梅朵，在 Unity 实时场景里回答问题、给出线索。',
      anchor: 'guide',
      media: {
        key: 'guge/guide/meido_portrait',
        alt: '《梦回古格》主角梅朵的形象：少女手持酥油灯，闭眼祈福',
      },
    },
  ],
};

/* ==========================================================================
   FEATURED 02 — 李花花 / VC-AI-Pet
   An AI product flagship. The UI is an MVP, so the case study leads with system
   capability and product thinking, and uses the real screenshots only as
   evidence that it runs.
   ========================================================================== */

export const lihuahua: Project = {
  slug: 'lihuahua',
  order: 2,
  featured: true,
  title: 'LIHUAHUA',
  titleZh: '李花花 · VC-AI-PET',
  tagline: 'A long-term local AI companion — not a chat wrapper.',
  taglineZh: '不是聊天套壳，是一个会记得你的长期陪伴型 AI。',
  tags: ['AI COMPANION', 'MEMORY', 'VISION', 'EMOTION', 'LOCAL AI'],
  year: '2026',
  accent: '#A9714A',
  badge: 'WORKING PROTOTYPE',
  /*
   * The three Lihuahua covers are portrait phone screenshots (0.45). Forced into
   * the shared landscape tile with `cover` they kept 29–34% of the frame — the
   * dog survived, the app did not: header, input and the whole control row were
   * outside the box. The screenshots were shot on a warm off-white (252,246,241)
   * that is within a couple of values of this site's paper, so `contain` reads as
   * the screen resting on the same surface rather than a letterboxed image.
   */
  coverFit: 'contain',
  cover: {
    key: 'lihuahua/relaxed',
    alt: '李花花手机界面：一只像素风格的伯恩山犬，显示当前状态与情绪数值',
    focal: '50% 55%',
  },
  meta: [
    { label: 'TYPE', value: '长期陪伴型 AI 产品' },
    { label: 'CODENAME', value: 'VC-AI-PET' },
    { label: 'SCOPE', value: '产品定义 / 状态系统 / 记忆架构 / 界面与实现' },
    { label: 'STATUS', value: 'Working prototype（真实可运行）' },
  ],
  summary:
    '大部分「AI 宠物」只是把聊天框换了一张皮：关掉页面，它就不记得你。李花花要解决的是另一个问题 —— 一个 AI 能不能拥有连续的身份、自己的情绪状态和跨越数月的记忆，从而和你形成真正的共同经历。它有自己的小世界、会做梦、会在你不在的时候继续生活，并且整套推理跑在本地。',
  summaryEn: 'From tool → assistant → companion. The product question is continuity, not conversation.',
  sections: [
    {
      id: 'thesis',
      index: '01',
      eyebrow: 'PRODUCT THESIS',
      title: 'From tool to assistant to companion.',
      titleZh: '从工具，到助手，到陪伴者。',
      body: [
        '工具被使用完就被放下；助手被需要时被唤醒；陪伴者在你不在的时候依然存在。这三者的差别不在界面，而在于系统是否拥有「连续的自己」。',
        '因此这个产品的第一性问题不是「怎么让对话更自然」，而是「怎么让它昨天是它，今天还是它」。',
      ],
      bullets: [
        'TOOL —— 每次交互互相独立，状态不保留',
        'ASSISTANT —— 保留上下文，但身份随会话重置',
        'COMPANION —— 身份、情绪与记忆连续，关系随时间积累',
      ],
      layout: 'sequence',
    },
    {
      id: 'identity',
      index: '02',
      eyebrow: 'IDENTITY / PERSONALITY',
      title: 'It has to be someone, not something.',
      titleZh: '先有「是谁」，才有「说了什么」。',
      body: [
        '李花花有固定的性格设定、说话方式和偏好。人格不是提示词里的一段描述，而是参与每一次输出组织的约束条件 —— 同一件事，它会用自己的方式反应，而不是给出通用答案。',
        '人格层与场景层分离：无论是聊天、玩耍还是它的梦境，输出的都是同一个角色。',
      ],
      bullets: [
        '固定人格设定与语言风格',
        '偏好、习惯与关系状态随相处时间变化',
        '人格层统一约束对话、行为与梦境内容',
      ],
      media: [
        {
          key: 'lihuahua/relaxed',
          alt: '李花花界面：放松状态下的像素犬形象与状态数值',
          caption: 'Working prototype：真实运行界面（放松状态）',
          surface: 'light',
        },
      ],
      layout: 'split',
    },
    {
      id: 'state',
      index: '03',
      eyebrow: 'STATE / EMOTION',
      title: 'A state machine that feels like a mood.',
      titleZh: '情绪不是贴图，是一套会变化的状态。',
      body: [
        '开心与精力是两个持续衰减与恢复的数值，行为、表情、动画与对话语气都由当前状态决定。它会累、会困、会因为你长时间不来而变得低落。',
        '状态是驱动整套表现系统的单一来源：界面展示什么、它说什么、能做什么，全部读取同一份状态。',
      ],
      media: [
        {
          key: 'lihuahua/sleep',
          alt: '李花花界面：sleep 状态，像素犬蜷缩入睡，开心 8%、精力 3%',
          caption: 'Working prototype：睡眠状态下的数值与表现（开心 8% / 精力 3%）',
          surface: 'light',
        },
      ],
      layout: 'diagram',
      diagram: 'emotion-state',
    },
    {
      id: 'memory',
      index: '04',
      eyebrow: 'MEMORY',
      title: 'Memory that survives months, not messages.',
      titleZh: '记忆要能撑过几个月，而不是一个会话。',
      body: [
        '记忆不是把聊天记录存下来。原始对话既冗余又矛盾，直接塞回上下文只会让它越来越混乱。',
        '系统把经历整理成可检索的结构化记忆：什么值得记、什么时候该想起来、哪些已经过时，都由记忆层判断。这样它在几个月后仍然认识你，而不是记得一堆零散的句子。',
      ],
      bullets: [
        '经历被提炼为结构化记忆条目，而不是原文堆积',
        '按相关度与时间共同检索，旧记忆会随时间衰减',
        '记忆与状态联动：想起来的内容会影响当下的情绪',
      ],
      layout: 'diagram',
      diagram: 'memory',
    },
    {
      id: 'world',
      index: '05',
      eyebrow: 'DREAM / REFLECTION',
      title: 'It keeps living when you are not looking.',
      titleZh: '你不在的时候，它也在过自己的生活。',
      body: [
        '李花花有自己的小世界和玩具，也会做梦。Dream 与 Reflection 是离线发生的整理过程：把这段时间的经历重新组织、遗忘掉不重要的部分、形成新的自我描述。',
        '这是「陪伴者」和「助手」最关键的分界线 —— 关系需要一段你不在场的时间来生长。',
      ],
      bullets: [
        '离线周期性地回顾近期经历',
        '整理记忆、形成新的自我描述',
        '梦境内容会反向影响之后的状态与话题',
      ],
      media: [
        {
          key: 'lihuahua/finding',
          alt: '李花花界面：寻找/回家过程中的加载画面',
          caption: 'Working prototype：独立的加载与状态过渡画面',
          surface: 'light',
        },
      ],
      layout: 'split',
    },
    {
      id: 'vision',
      index: '06',
      eyebrow: 'VISION / INPUT',
      title: 'It can see, not just read.',
      titleZh: '它看得见，不只是读得到。',
      body: [
        '视觉输入让它可以对现实中的画面做出反应，而不是只处理文字。图像、语音与文本进入同一套上下文，形成对当下情境的统一理解。',
        '这也是多模态在这里的真正意义：不是并列三种功能，而是让它们共同构成「此刻发生了什么」。',
      ],
      layout: 'statement',
    },
    {
      id: 'runtime',
      index: '07',
      eyebrow: 'LOCAL RUNTIME',
      title: 'Two layers, deliberately decoupled.',
      titleZh: '产品层与运行时层，刻意解耦。',
      body: [
        '产品层负责身份、情绪、记忆、对话与业务逻辑；底层运行时负责模型加载、推理调度与资源管理。两层之间只有清晰的边界，各自独立演进。',
        '推理跑在本地，数据不出设备。这既是隐私选择，也是产品选择：长期陪伴意味着长期数据，而长期数据不该被放在别人的服务器上。',
      ],
      bullets: [
        '产品层：人格 / 情绪 / 记忆 / 对话 / 业务逻辑',
        '运行时层：模型加载 / 推理调度 / 资源占用',
        '本地优先：数据保留在用户设备上',
      ],
      layout: 'diagram',
      diagram: 'local-runtime',
      note: '底层能力详见 VC LAB。出于安全考虑，本页不公开内部实现、运行环境与配置细节。',
    },
  ],
  credits: [
    '本页展示的手机界面为产品原型（MVP）阶段的真实运行画面，视觉精修仍在推进中。',
    '系统架构图依据真实实现整理，已隐去内部接口与环境细节。',
  ],
  relatedNote:
    '底层推理由 VC LAB 的 Local Brain 提供。李花花负责产品层，Local Brain 负责运行时 —— 两层解耦。',
};

/* ==========================================================================
   FEATURED 03 — 观潮 Daily Brief
   A genuinely running product. This is the flagship that proves VC ships.
   ========================================================================== */

export const guanchao: Project = {
  slug: 'guanchao',
  order: 3,
  featured: true,
  title: 'GUANCHAO',
  titleZh: '观潮 Daily Brief',
  tagline: 'A daily intelligence brief that reads the market for you.',
  taglineZh: '把每天的信息洪流，压成一份能读完的简报。',
  tags: ['DIGITAL PRODUCT', 'INFORMATION DESIGN', 'DATA', 'AUTOMATION', 'AI'],
  year: '2026',
  accent: '#6D5BD0',
  badge: 'LIVE PRODUCT',
  cover: {
    key: 'guanchao/dashboard',
    alt: '观潮 Daily Brief 首页：政策路径图表、AI 解读卡片、三大市场数据概览与近期热点',
    focal: '50% 30%',
  },
  live: [
    {
      url: 'https://guanchao-daily-brief.vercel.app/',
      label: 'LIVE PRODUCT',
      note: '真实上线，可直接访问。',
    },
  ],
  meta: [
    { label: 'TYPE', value: '信息型数字产品 / Dashboard' },
    { label: 'SCOPE', value: '信息架构 / 数据组织 / 界面设计 / 前端实现' },
    { label: 'COVERAGE', value: '政策 · A股 / 港股 / 美股 · 热点 · 来源引用' },
    { label: 'STATUS', value: 'Live product' },
  ],
  summary:
    '金融信息的问题从来不是不够多，而是多到无法判断。观潮每天把政策动向、三大市场数据与热点事件重新组织成一份有层级的简报：该先看什么、今天最值得理解的是什么、每条结论的依据来自哪里。它不是新闻聚合页，而是一套为「读完并做出判断」而设计的信息结构。',
  summaryEn: 'Not a news aggregator — an information structure designed to be finished and acted on.',
  sections: [
    {
      id: 'problem',
      index: '01',
      eyebrow: 'CONTEXT / CHALLENGE',
      title: 'Too much information, too little judgement.',
      titleZh: '信息过剩，判断稀缺。',
      body: [
        '每天影响市场的信号分散在政策文本、行情页面、研报与新闻流里。真正的问题不是找不到信息，而是信息之间没有优先级 —— 读完之后仍然不知道今天最该关注什么。',
        '更麻烦的是可信度：一条结论如果没有来源，读者只能选择相信或不信，而这两者都不算是理解。',
      ],
      bullets: [
        '信息源分散，缺少统一的阅读入口',
        '缺少层级：重要与否无法一眼判断',
        '结论没有出处，难以验证',
        '阅读成本高，难以坚持每天看完',
      ],
      layout: 'statement',
    },
    {
      id: 'ia',
      index: '02',
      eyebrow: 'INFORMATION ARCHITECTURE',
      title: 'Five modules, one reading order.',
      titleZh: '五个模块，一条阅读顺序。',
      body: [
        '首页不是把数据铺满，而是排出一条阅读顺序：先给结论，再给数据，最后给依据。读者可以只读第一屏就得到今天的判断，也可以继续往下核对每一个数字。',
      ],
      bullets: [
        '政策路径 —— 把政策预期与时间节点串成可视化的区间变化',
        'AI Takeaway —— 用一段话回答「今天怎样理解这些信号」，并提供查看原文的入口',
        '市场数据概览 —— A股 / 港股 / 美股三个市场并列，关键指数、涨跌与要闻同一屏呈现',
        '近期热点 —— 按热度排序的事件流，越靠前越值得读',
        '数据来源与引用 —— 每条结论都可以点回去看出处',
      ],
      media: [
        {
          key: 'guanchao/dashboard',
          alt: '观潮首页信息结构：政策路径图表与 AI 解读卡片位于上方，市场数据概览居中，近期热点在下方',
          caption: '首页信息结构：结论在前，数据在后，来源始终可追溯',
          surface: 'light',
        },
      ],
      layout: 'full',
    },
    {
      id: 'design',
      index: '03',
      eyebrow: 'VISUAL SYSTEM',
      title: 'Dense data, calm surface.',
      titleZh: '数据可以密，界面必须安静。',
      body: [
        '信息密度高，界面就必须承担降噪的责任。颜色只用来表达涨跌与状态，其余全部交给字重、间距和留白来控制层级。',
        '卡片承担分组而不是装饰：同一种信息在任何一个模块里都是同一种呈现方式，读者学会一次就够了。',
      ],
      bullets: [
        '颜色只承担语义：涨 / 跌 / 关注，不做装饰',
        '用字重与间距建立层级，而不是用边框和阴影',
        '同类信息保持一致的呈现方式，降低学习成本',
        '支持移动端阅读，长内容在窄屏下重新编排',
      ],
      layout: 'statement',
    },
    {
      id: 'pipeline',
      index: '04',
      eyebrow: 'AUTOMATION',
      title: 'It has to update itself every day.',
      titleZh: '一份每天都要更新的简报，必须自己会跑。',
      body: [
        '日更产品真正的难点不在界面，而在于每天都要重新完成一次采集、整理、生成与发布的闭环。任何需要人工介入的环节，都会在第一周之后变成停更的理由。',
        '因此数据流、摘要生成与页面渲染被拆成一条可持续运行的链路，人可以只负责判断，而不是负责搬运。',
      ],
      layout: 'diagram',
      diagram: 'data-flow',
    },
    {
      id: 'live',
      index: '05',
      eyebrow: 'LIVE PRODUCT',
      title: 'It is running right now.',
      titleZh: '它现在就在运行。',
      body: [
        '观潮不是概念稿。它有真实的数据、真实的每日更新和真实的访问地址 —— 这也是 VC 与「只会做图」之间最直接的区别。',
        '下面嵌的就是它本身的界面：能点击、能翻页、能自己走一遍。为了让它长期可访问，这里放的是一份本地留存副本，数据停留在留存当天，而不是实时抓取。',
      ],
      /*
       * The embed is the point of this chapter, so the three captures drop to a
       * supporting role: the first becomes the frame's poster/loading state, and
       * the rest stay as a small record of what the live build looked like.
       */
      embed: {
        src: '/guanchao-live',
        title: '观潮 Daily Brief —— 可交互副本',
        poster: {
          key: 'guanchao/live/desktop-view-01',
          alt: '观潮线上版本首屏：政策路径图表与 AI 解读卡片',
          surface: 'light',
        },
        openLabel: '全屏打开副本',
        note: '本地留存副本：结构与交互与线上一致，数据停留在留存当天。线上的实时版本可通过上方 LIVE PRODUCT 按钮访问。',
      },
      media: [
        {
          key: 'guanchao/live/desktop-view-02',
          alt: '观潮线上版本市场数据概览：A股、港股、美股三个市场并列',
          caption: '线上版本 · 市场数据概览',
          surface: 'light',
        },
        {
          key: 'guanchao/live/desktop-view-03',
          alt: '观潮线上版本近期热点与数据来源区块',
          caption: '线上版本 · 近期热点与来源引用',
          surface: 'light',
        },
      ],
      layout: 'reel',
    },
  ],
  credits: ['线上版本持续更新中，页面结构与信息模块可能随版本迭代调整。'],
};

/* ==========================================================================
   FEATURED 04 — 青花造境
   The aesthetic flagship. Deliberately kept visual: no forced technical
   explanation. Local screenshots are captured from the live build.
   ========================================================================== */

export const qinghua: Project = {
  slug: 'qinghua-zaojing',
  order: 4,
  featured: true,
  title: 'QINGHUA',
  titleZh: '青花造境',
  tagline: 'An interactive porcelain studio you actually work in.',
  taglineZh: '在浏览器里，从一抔土开始，亲手做一件瓷器。',
  tags: ['WEB', 'DIGITAL EXPERIENCE', 'VISUAL'],
  year: '2026',
  accent: '#3E7A63',
  badge: 'LIVE EXPERIENCE',
  cover: {
    key: 'qinghua/desktop-full',
    alt: '青花造境「泥土初生 / CLAY AWAKENING」画面：深墨绿背景上由发光粒子聚成的器物形态，金色中英文标题与工艺信息面板',
    focal: '50% 50%',
  },
  live: [
    {
      url: 'https://qinghua-zaojing.vercel.app/',
      label: 'LIVE EXPERIENCE',
      note: '真实上线，建议在桌面端完整做完一件。',
    },
  ],
  meta: [
    { label: 'TYPE', value: '网页 / 交互式数字体验' },
    { label: 'SCOPE', value: '概念 / 交互设计 / 视觉语言 / 前端实现' },
    /*
     * 「五道」 is the craft stages; the particle section further down counts
     * seven because it renders the five plus the start and end states. Calling
     * both simply 「工序」 read as a contradiction (found 2026-09-20), so the
     * craft count names itself.
     */
    { label: 'MEDIUM', value: 'Web · 五道制瓷工序 · 桌面与移动端各自编排' },
    { label: 'STATUS', value: 'Live experience' },
  ],
  summary:
    '青花造境不是一件瓷器的展示页，而是一个可以动手的制瓷工坊（PORCELAIN CREATION STUDIO）。体验被拆成五道工序，从数字拉坯开始：拖动器物轮廓改变各高度的半径，在旋转中定下器型；然后以钴蓝为墨，用画笔、浓淡与笔触在坯体上绘饰，并可以调用本地纹样生成建议；再一层清釉由上而下覆盖，用滑杆调整釉层厚度与表面光泽。深墨绿的底、金色的中英文排版、随工序变化的粒子器物，整个过程的每一步都有真实的操作界面 —— 而不是一段观看用的动画。',
  summaryEn: 'A hands-on craft simulator: throwing, painting, glazing — each step with a real toolset, not a video.',
  sections: [
    {
      id: 'concept',
      index: '01',
      eyebrow: 'CONCEPT',
      title: 'Not a showcase of porcelain. A workshop.',
      titleZh: '不是展示瓷器，是让人亲手做一件。',
      body: [
        '大多数文化类网页把成品放在最前面，观众看完仍然不知道它是怎么做出来的。青花造境反过来：把器物藏起来，先把工具交出去。',
        '整个体验被定义成一间工坊 —— PORCELAIN CREATION STUDIO。进入之后你要做的不是往下滚，而是动手。',
      ],
      layout: 'statement',
    },
    {
      id: 'structure',
      index: '02',
      eyebrow: 'NARRATIVE STRUCTURE',
      title: 'Five craft stages, numbered like a workshop.',
      titleZh: '五道制瓷工序，按编号推进。',
      body: [
        '体验被切成编号工序（01 → 05），底部有进度指示与当前工序名，每一步必须先完成手上的操作，才能进入下一步。',
        '仪式感来自节奏被明确划分，而不是来自页面有多长；观众始终知道自己做到哪了、还剩几道。',
      ],
      bullets: [
        '01 · 数字拉坯 / THROWING WORKBENCH —— 以轮为轴，在旋转中建立属于你的器型',
        '02 · 青花绘饰 / PORCELAIN PAINTING —— 以钴蓝为墨，让纹样沿器物表面生长',
        '03 · 清釉覆彩 / TRANSPARENT GLAZING —— 一层清釉由上而下覆盖坯体，封存笔意',
        '每屏只做一道工序，信息不跨屏堆叠',
        '首次进入有引导流程（可跳过），之后按工序逐步解锁',
      ],
      layout: 'statement',
    },
    {
      id: 'interaction',
      index: '03',
      eyebrow: 'INTERACTION DESIGN',
      title: 'Every stage hands you a real toolset.',
      titleZh: '每一道工序，都给你一套真的工具。',
      body: [
        '这不是「点一下看动画」。每一道工序都对应一组真实可用的操作，而且操作结果直接改变画面里的器物。',
        '界面本身就承担教学：右下角常驻「操作方式」提示，按钮名称与当前动作严格对应 —— 完成塑形、完成绘饰、开始施釉。',
      ],
      bullets: [
        '数字拉坯 —— 拖动器物轮廓，改变对应高度的半径，实时重建器型',
        '青花绘饰 —— 画笔 / 橡皮 / 撤销 / 重做 / 清空，笔触与浓淡滑杆，左键落笔、右键或空格拖动旋转',
        '清釉覆彩 —— 釉层厚度与表面光泽两条滑杆，调节之后才真正开始施釉',
        '工序之间有明确的状态门槛，未完成的操作不能跳过',
      ],
      media: [
        {
          key: 'qinghua/step-01',
          alt: '青花造境「青花绘饰 / PORCELAIN PAINTING」工序画面：白色坯体、绘饰控制面板、笔触与浓淡滑杆、本地纹样生成建议',
          caption: '02 · 青花绘饰 / PORCELAIN PAINTING：画笔、浓淡滑杆与本地纹样生成',
          surface: 'dark',
        },
      ],
      layout: 'full',
    },
    {
      id: 'ai',
      index: '04',
      eyebrow: 'AI AS A TOOL',
      title: 'The AI suggests. You still hold the brush.',
      titleZh: 'AI 只出建议，笔还在你手里。',
      body: [
        '绘饰工序里有一个「本地纹样生成」面板：AI 生成纹样、换一组、清除 AI 纹样 —— 它给出的是起点，不是结果。所有操作仍然由人完成。',
        '这个位置是刻意的：在一个关于手工的体验里，AI 如果抢走笔，整件事就没有意义了。它应该站在工具那一侧。',
      ],
      bullets: [
        '本地纹样生成（LOCAL PATTERN SUGGESTIONS）提供可替换的纹样起点',
        '生成结果可以一键清除，不会污染你自己的绘制',
        'AI 不写入、不覆盖、不代替任何一步手工操作',
      ],
      media: [
        {
          key: 'qinghua/step-02',
          alt: '青花造境「清釉覆彩 / TRANSPARENT GLAZING」工序画面：成形的白色器物与釉层厚度、表面光泽滑杆',
          caption: '03 · 清釉覆彩 / TRANSPARENT GLAZING：成形之后的器物与釉层参数',
          surface: 'dark',
        },
      ],
      layout: 'split',
    },
    {
      id: 'visual',
      index: '05',
      eyebrow: 'VISUAL LANGUAGE',
      title: 'Deep green, gold type, a vessel made of light.',
      titleZh: '深墨绿的底，金色的字，一件由光聚成的器物。',
      body: [
        '画面压在一层很深的墨绿底上，文字用金色与米白，器物以两种形态交替出现：拉坯阶段的粒子点云，与绘饰、施釉阶段已经成形的实体。',
        '粒子从弥散到聚拢，正好对应「泥土成为器」这件事本身 —— 视觉的运动和操作的进度是同一件事，而不是两层互相装饰的效果。',
      ],
      bullets: [
        '深墨绿底色 + 金色 / 米白排版，克制到只有两个色系',
        '器物在粒子形态与实体形态之间切换，随工序推进',
        '元素极少，靠呼吸感与留白推进，而不是堆叠装饰',
      ],
      layout: 'statement',
    },
    {
      id: 'live',
      index: '06',
      eyebrow: 'LIVE EXPERIENCE',
      title: 'Better performed than described.',
      titleZh: '这个项目更适合直接打开，从头做一件。',
      body: [
        '青花造境是一个真实的线上体验，桌面端与移动端各有自己的操作方式：宽屏用左键落笔、右键或空格旋转器物，窄屏则以拖动轮廓、点按工具为主。任何截图都不如亲手做一遍。',
      ],
      media: [
        {
          key: 'qinghua/mobile-step-01',
          alt: '青花造境移动端「数字拉坯 / THROWING WORKBENCH」画面：窄屏下重新编排的标题、器物与操作提示',
          caption: '移动端 · 01 数字拉坯 / THROWING WORKBENCH：窄屏重新编排的操作界面',
          surface: 'dark',
        },
      ],
      layout: 'split',
      note: '首页的 LIVE EXPERIENCE 按钮可以直接打开线上版本。',
    },
  ],
  /**
   * The live particle sequence.
   *
   * Stage names, English titles, one-line notes, particle colours and the
   * underlying point clouds are all taken from the shipped project — nothing
   * here is decorative invention. Rendering the actual artefact on the page is a
   * much stronger proof than a screenshot of it: the visitor can drive the same
   * seven stages the product ships with.
   */
  particle: {
    eyebrowZh: '实时粒子',
    eyebrowEn: 'LIVE PARTICLE RENDER',
    titleZh: '七道工序，在一团光里完成',
    titleEn: 'SEVEN STAGES, RENDERED AS LIGHT',
    body: '下面是这个项目真实的渲染管线 —— 不是视频，也不是截图。器物由一万多个采样点构成，两层点云叠加出发光感；拖动或以键盘切换工序，配色与运动模式会随之改变。',
    fallback: {
      key: 'qinghua/desktop-full',
      alt: '青花造境「泥土初生」画面：深墨绿背景上由发光粒子聚成的器物形态',
      caption: '粒子渲染的静止帧（在减少动态效果或低性能设备上显示）',
      surface: 'dark',
    },
    stages: [
      { id: 'origin', zh: '泥土初生', en: 'CLAY AWAKENING', note: '万物始于一抔土', noteEn: 'Everything begins with a handful of earth', model: 'clay', color: '#bfc8be' },
      { id: 'pulling', zh: '拉坯', en: 'FORMING THE VESSEL', note: '以轮为轴，使泥土向上生长', noteEn: 'On the wheel, the clay is drawn upward', model: 'pulling', color: '#c2c0aa' },
      { id: 'trimming', zh: '修型', en: 'REFINING THE SILHOUETTE', note: '削繁为简，轮廓渐明', noteEn: 'Trimming away until the silhouette reads', model: 'bisque', color: '#dedfd6' },
      { id: 'painting', zh: '绘饰', en: 'COBALT AS INK', note: '以钴为墨，在素坯之上落笔', noteEn: 'Cobalt laid on raw clay like ink on paper', model: 'bisque', color: '#4f79a5' },
      { id: 'glazing', zh: '施釉', en: 'SEALING THE BRUSHWORK', note: '一层清釉，封存笔意', noteEn: 'A clear glaze seals the brushwork in', model: 'bisque', color: '#a7d5d0' },
      { id: 'firing', zh: '烧制', en: 'TEMPERED BY FIRE', note: '高温淬炼，釉色初现', noteEn: 'Heat tempers the body and wakes the glaze', model: 'bisque', color: '#ff8d52' },
      { id: 'finished', zh: '成器', en: 'A VESSEL IS BORN', note: '泥、火、釉与纹样相合', noteEn: 'Clay, fire, glaze and pattern become one', model: 'bisque', color: '#d6ece8' },
    ],
  },
  credits: ['本页截图为线上版本的本地留存，页面内容可能随版本迭代调整。'],
};

/* ==========================================================================
   CAPABILITY REEL — proof of coverage, not four more case studies.
   ========================================================================== */

export const moreWorkItems: MoreWorkItem[] = [
  {
    id: 'cg',
    title: '3D / VISUALIZATION',
    titleZh: '三维与可视化',
    role: 'MODELING · MATERIAL · LIGHTING · ATMOSPHERE',
    roleZh: '建模、材质、灯光与氛围',
    tags: ['3D', 'PBR', 'MATERIAL STUDY', 'SPATIAL STORYTELLING'],
    accent: '#8C93A8',
    summary:
      '不把三维当作软件技能，而是当作摄影：先决定画面要说什么，再决定材质、光线与镜头。以下为材质实验与空间场景渲染。',
    media: [
      {
        key: 'blender/flooded_corridor',
        alt: 'Blender 渲染：被水淹没的室内走廊，水面反射与冷调光线',
        caption: '室内水淹场景 —— 水面反射与光衰减',
        surface: 'dark',
      },
      {
        key: 'blender/old_apartment_scene_01',
        alt: 'Blender 渲染：老居民楼内部空间，自然光从窗口进入',
        caption: '老居民楼空间 —— 自然光与旧材质',
        surface: 'dark',
      },
      {
        key: 'blender/old_apartment_scene_02',
        alt: 'Blender 渲染：老居民楼楼梯间另一视角',
        caption: '老居民楼空间 —— 结构与纵深',
        surface: 'dark',
      },
      {
        key: 'blender/liquid_material_study',
        alt: 'Blender 渲染：液体与材质实验，竖构图特写',
        caption: '液体与材质实验 —— PBR 表面研究',
        surface: 'dark',
      },
    ],
  },
  {
    id: 'train-cabin',
    title: 'TRAIN CABIN',
    titleZh: '川藏列车双人标间',
    role: 'SPACE · ERGONOMICS · INTERIOR',
    roleZh: '空间、人机工程与内饰',
    tags: ['SPATIAL DESIGN', 'ERGONOMICS', 'INTERIOR', 'CONCEPT'],
    accent: '#7E8C6A',
    summary:
      '在极度受限的包厢尺寸里安排两个人的完整生活动线：睡眠、收纳、观景与通行。传统设计基本功的证明 —— 尺寸、动线与人体尺度必须同时成立。',
  },
  {
    id: 'diet-system',
    title: 'DIETARY CARE SYSTEM',
    titleZh: '轻养智能膳食干预系统',
    role: 'SERVICE · UX · SYSTEM THINKING',
    roleZh: '服务设计、体验与系统思考',
    tags: ['SERVICE DESIGN', 'UX', 'SYSTEM', 'HEALTH'],
    accent: '#6E9C8A',
    summary:
      '把「吃得健康」这件模糊的事，拆成可执行的日常流程：数据采集、状态判断、干预建议与反馈闭环。重点在于把多方角色（用户、家人、专业建议）组织进同一套服务里。',
  },
  {
    id: 'cgm',
    title: 'CGM DEVICE',
    titleZh: '动态血糖仪',
    role: 'MEDICAL · INDUSTRIAL DESIGN',
    roleZh: '医疗产品与工业设计',
    tags: ['MEDICAL', 'INDUSTRIAL DESIGN', 'PRODUCT', 'WEARABLE'],
    accent: '#5E8CA8',
    summary:
      '面向长期佩戴场景的连续血糖监测设备。医疗产品的设计约束比消费电子严苛得多：佩戴舒适度、皮肤接触、更换频率与使用心理都必须同时处理。',
  },
];

/* ==========================================================================
   Exports
   ========================================================================== */

export const projects: Project[] = [guge, lihuahua, guanchao, qinghua];

export const featuredProjects: Project[] = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const ordered = featuredProjects;
  const index = ordered.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? ordered[index - 1] : ordered[ordered.length - 1],
    next: index < ordered.length - 1 ? ordered[index + 1] : ordered[0],
  };
}
