# GUGE_STORYBOARD — 古格王朝旗舰案例 · 滚动结构设计

> PHASE 2 交付物。Desktop 1600×1000 / Mobile 390×844 双档。
> 目标：接住首页前半段（Opening Intro → HELLO → VC Hero → MAKE/SOLVE/BUILD → 黑色拱形）建立的品牌高潮，让古格不是一个「普通项目卡突然出现」，而是整个网站的**旗舰综合案例**。
>
> 设计原则（来自本轮 BRIEF）：
> - `SITE CHROME = VC，PROJECT CONTENT = GUGE` —— 导航、字体体系、页面骨架、基础动效仍是 VC；古格的金/红/纹样/书法只在内容内部发生。
> - 滚动必须**持续前进**。允许短暂 sticky，**禁止长时间 hard pin**。
> - 运动只用 `mask reveal / scale / translate / parallax / image crop / layer reveal / large typography`。
> - 只用 GSAP + Motion + 现有媒体组件，**不新增依赖、不新增 WebGL**。

---

## 0. 节奏总表（tone 与「染色」曲线）

站点通篇是 `paper`（近白 #FBFAF8）/ `ink`（近黑 #0F0F0F）交替的编辑式节奏。古格章节在此之上加一层**逐章染色的色温**：从 VC 的中性骨白，逐渐被古格自己的颜色（古金 `#C9A227`、暗红 `#7A2E22`、土褐 `#6E4434`）浸染，到第 10 章收束回中性。

| 章 | id | tone | 色温 | 视觉主角 | 滚动行为 |
|---|---|---|---|---|---|
| 00 | `dream` | ink | 中性 → 微金 | 全幅电影感主视觉 | 视差 + 缓慢推近 |
| 01 | `site` | **paper** | 中性 | 考察原片、ARCHIVE/NOW | 常规流；横向组图条 |
| 02 | `story` | ink | 微金 | 三层世界结构图 | 分层揭示（clip-path，非滚动劫持） |
| 03 | `people` | ink | 古金 | 人物关系长卷 | 短程横向位移（≈1.2 屏），页面继续前进 |
| 04 | `rebuild` | **paper** | 中性偏褐 | 6s 点云分区循环 | 常规流；技术条 |
| 05 | `built` | ink | 暗红 + 古金 | 12s 3D 过程 reel + 6 张渲染 | 常规流；mosaic 拼版 |
| 06 | `inside` | ink | 暗红 | Unity 实机大图 + 4 玩法节点 | 常规流；视频轻量 sticky |
| 07 | `guide` | ink | 古金 | 梅朵形象 + RAG 链路 | 常规流；链路图揭示 |
| 08 | `proof` | **paper** | 中性（学术） | 考古报告 / 博物馆 / 文物 | 常规流；四栏证据 |
| 09 | `craft` | ink | 古金（最浓） | 4 张展板 + Presentation Mosaic | 常规流；三段式揭示 |
| 10 | `outcome` | ink | 回中性 | 最终场景 + 奖项 | 收束；NEXT PROJECT |

**为什么 04 和 08 是浅色**：两处长深色之后必须有一次「呼吸」。04 是技术图纸，浅底像印刷品；08 是学术考据，浅底建立可信度。其余深色连续成篇，形成「品牌高潮 → 长暗场 → 两次呼吸 → 收束」的导演结构。

---

## 1. 各章故事板

### 00 — DREAM GUGE

**Desktop 1600×1000**
```
┌──────────────────────────────────────────────────────┐
│  [黑色拱形过渡带入 —— 不改首页，只做接口]              │
│                                                      │
│   ███ 全幅主视觉 ███  遮罩从中心横向展开 (mask reveal) │
│   60vh 高，object-position 压到山脊线                   │
│                                                      │
│   FEATURED WORK 01 · 2025            ← eyebrow        │
│   梦 回 古 格                        ← display, 巨大   │
│   DREAM GUGE                         ← 拉丁副行        │
│   古格王朝 AI 智能交互 VR 体验         ← 说明性副标题    │
│   AI · VR · 3D · VISUAL STORYTELLING ← 标签            │
│                                                      │
│   ↓ SCROLL                            ← 滚动提示        │
└──────────────────────────────────────────────────────┘
```
- 进入：遮罩 reveal（clip-path 横向）+ 标题行逐行 rise（stagger 90ms）。
- 离开：滚动时主视觉 `scale 1 → 1.08` + `translateY` 视差，类型整体上移淡出。
- 12s 静音循环（沿用 `mengu-loop`）作为背景层，poster 优先，reduced-motion / 低端机关闭视频只留 poster。

**Mobile 390×844**：不把字压在繁复画面上。
```
┌──────────────┐
│ 主视觉 52vh   │  ← 全宽，不叠字
├──────────────┤
│ FEATURED 01  │
│ 梦回古格      │  ← 仍大，但独立成块
│ DREAM GUGE   │
│ 副标题 / 标签  │
└──────────────┘
```

---

### 01 — THE REAL SITE

**核心信息**：`BEFORE REBUILDING THE WORLD, WE WENT TO SEE WHAT WAS LEFT.`
中文：在重建这个世界之前，我们先去看了剩下什么。

```
EYEBROW  01 / THE REAL SITE
H1       BEFORE REBUILDING THE WORLD,
         WE WENT TO SEE WHAT WAS LEFT.
H1-zh    在重建这个世界之前，我们先去看了剩下什么。
BODY     两段：古格不是凭空想象的对象；遗址正在风化、坍塌、消逝。
         （依据：PPT「那些见证过历史的精美壁画和石窟，正随着岁月的
           剥蚀和自然环境的恶化，逐渐从世人的记忆中褪色。」）

[全幅考察主图 6000×3376 → 2048 宽，caption]

ARCHIVE / NOW  ← 两栏对照
┌─────────────┬─────────────┐
│ ARCHIVE     │ NOW         │
│ 历史资料/壁画 │ 遗址现状     │
│ [图]        │ [图]        │
└─────────────┴─────────────┘

[洞窟守护者] 图 + 引文（原样）：
「在半山腰一个逼仄的洞窟里，我们遇到了一位当地居民。他日复一日地
  守在这里，只为保护里屋墙上仅存的壁画。」

[考察组图条] 4-5 张，横向 snap scroll（桌面 bleed；手机 2 列网格）
```
- 滚动行为：常规流，无 sticky。图片用 `masked` 逐张揭示，延迟递增 90ms。
- Mobile：对照两栏改为上下堆叠；组图条改 2 列网格，不横滑。

---

### 02 — FROM SITE TO STORY

**核心视觉**：`三明治图.png`（3500×4371，透明底，ink 底上极佳）。

```
EYEBROW  02 / FROM SITE TO STORY
H1       FROM SITE TO STORY.
H1-zh    从遗址，到可以被走进去的叙事结构。

┌──────────────── 结构图（右侧 7 栏）────────────────┐
│                                                   │
│   LEVEL 1 人物与展品      ← 第 4 步进入             │
│   ═══════════════                                 │
│   LEVEL 2 剧情结构        ← 第 2 步进入             │
│   ═══════════════                                 │
│   LEVEL 3 场景与地点      ← 第 1 步进入             │
│                                                   │
└───────────────────────────────────────────────────┘
左侧 4 栏：三层各自的说明（用素材里的真实定义）
  LEVEL 1 人物与展品 —— 承载文化记忆与信仰线索
  LEVEL 2 剧情结构 —— 事件与动线挂到具体地点
  LEVEL 3 场景与地点 —— 还原地理地貌与建筑遗址
```
- **分层揭示**（进入视口 25% 时触发一次，不随滚动反复）：
  1. `LEVEL 3` 通过 `clip-path: inset(58% 0 0 0)` → `inset(0)` 揭示（800ms）
  2. `LEVEL 2` 跟随（+700ms）
  3. `LEVEL 1` 跟随（+1400ms）
  4. 图例与标注 `opacity 0 → 1`（+2000ms）
- 只用 `transform / opacity / clip-path`。**不新增 Three.js**。
- 原图可靠分层（三层在图上呈上下堆叠），因此采用**整图 + clip-path 分段揭示**，不做像素切割，不损失画质。
- Mobile：结构图全宽；左侧说明改为图下方纵向列表；揭示时序不变（移动端更紧凑，步进 500ms）。

---

### 03 — A WORLD OF PEOPLE

**核心视觉**：`Group 3.png`（5916×1395，透明底，ink 底）。

**核心信息**：`WE DIDN'T JUST REBUILD A SITE. WE BUILT A WORLD AROUND IT.`
中文：我们不只重建了一处遗址，我们在它周围建了一个世界。

**Desktop**
```
EYEBROW  03 / A WORLD OF PEOPLE
H1       WE DIDN'T JUST REBUILD A SITE.
         WE BUILT A WORLD AROUND IT.

┌── 横向长卷 · 短程位移（滚动 ≈1.2 屏内走完全长）──┐
│  ← 释迦牟尼像/卓玛 · 祖母(果沃琴) · 顿珠 · 梅朵 · 丹增 · 玩家 →  │
└──────────────────────────────────────────────────────┘
角色名单（6 条，中藏双语人名 + 一句定位）

引用（真实剧本原文，分行大字）：
  祖母：「城墙会倒。人会死。可歌声不会。」
  顿珠：「壁画会比人活得更久。」
```
- 位移由该段落的滚动进度驱动：`translateX(0 → -(图宽 - 视口宽))`，映射区间 = 该段高度的 1.2 屏。
- **不是 sticky pin**：段落本身随页面正常上移，长卷在其中横向移动。用户滚动时页面**始终在前进**。
- `prefers-reduced-motion` / 无 JS：长卷以 `overflow-x: auto` 呈现，可手动横向滚动。

**Mobile 390×844**：拆 4 段阅读，不把 5916px 压成 390px。
```
01  遗址与信仰    [裁切 1]   卓玛 · 释迦牟尼像与供养
02  家族与手艺    [裁切 2]   祖母 · 果沃琴；顿珠 · 壁画
03  王族与守护    [裁切 3]   少女梅朵 · 丹增
04  玩家进入世界  [裁切 4]   玩家 · 从现代走进古格
```
每段 = 一张裁切图 + 中藏双语人名 + 1-2 句说明（来自长卷原有标注）。

---

### 04 — REBUILDING THE SITE

**核心**：`屏幕录制 2026-04-04 234124.mp4`（11.54s 点云彩色分区）→ **6s 静音循环**。

```
EYEBROW  04 / REBUILDING THE SITE
H1       FROM REAL SITE TO DIGITAL TERRAIN.
H1-zh    从真实遗址，到可以走进去的数字地形。

流程条（代码绘制，不是图片）：
  REAL SITE → SCAN → POINT CLOUD → SEGMENTATION → TERRAIN → RENDER

[6s 静音循环 rebuild-loop]   ← 视频真裁真转，poster 优先，muted/loop/playsinline

[技术组图 3 张]
  扫描点云 | LOD 分区 | 红殿拆解分层

[建筑图纸条 4 张]  正视图 / 侧视图 / 俯视图 / 平面图

注：真实技术事实（PPT 原文）
  「通过实景扫描技术获取了古格王朝遗址的精确数据，并使用『中心聚焦式
   梯度压缩』（LOD）技术」/「从白模到上色」
```
- 浅色（paper）底，像技术图纸册。
- 视频在移动端仍播放，但下发 1600 宽 / 6 秒 / 无音轨，体积可控。

---

### 05 — BUILT IN 3D ★ 新核心章节

**核心**：`20260403-0912-37.1073483.mp4`（46.2s 3D 制作过程）→ **12s 过程 reel**。

```
EYEBROW  05 / BUILT IN 3D
H1       BUILT IN 3D.
SUB      DESIGNED FOR THE STORY.
H1-zh    在三维里建出来，为故事而设计。

[12s process-reel，全幅居中]
  0-3s   mesh / point cloud
  3-6s   terrain geometry
  6-9s   material / atmosphere
  9-12s  final rendered environment

四段标签轨（与 reel 真实分段对齐，不伪造阶段）：
  MESH → TERRAIN → MATERIAL & ATMOSPHERE → FINAL WORLD

[6 张最终渲染 · mosaic 拼版]
  ┌───────────────┬───────┬───────┐
  │ 红殿交互壁画   │ 红殿外景│ 祈福场景│
  │   (大, 2×2)   ├───────┼───────┤
  │               │ 建筑图 │ 梅朵低语│
  └───────────────┴───────┴───────┘
  + 古格大场景（通栏）

一句明确主张：
  「这些画面来自实际的三维构建与渲染流程，不是 AI 生成的概念图。」
```
- 深色（ink）底，渲染图在暗场里有存在感。
- 每张渲染图带**原板上的中藏双语标注**（如「梅朵低语场景 · མེ་ཏོག་སྐད་ཆ」）。
- 移动端：reel 全宽；mosaic 塌成单列，最大的那张仍最大。

---

### 06 — STEP INSIDE

**核心**：Unity 实机（`…04-23-18.mp4` 59.7s → **10s 静音循环** + 抽帧静图）。

```
EYEBROW  06 / STEP INSIDE
H1       STEP INSIDE THE RUINS.
H1-zh    走进遗址内部。

[大体验图 全幅]  +  [10s play-loop]

4 个玩法节点（错落编辑式排布，不是四张等大卡片）：
  背包界面      系列解谜与探索任务的入口
  壁画解谜      找图 → 解读 → 提交记录
  果沃琴解谜    循着残破壁画的痕迹，补全丢失的内容，
                还原壁画的真实样貌，以此解锁尘封的乐谱
  NPC 深度互动  与「梅朵」并肩同行
```
- 用**1 张大体验图 + 4 个具体玩法节点**，不用一堆小截图堆满页面。
- 移动端：大图 → 视频 → 节点纵向单列，每个节点图 + 3 行内文案。

---

### 07 — MEIDO / AI GUIDE

**核心**：梅朵（`渲染场景.png` 的「梅朵低语场景」格）+ `技术路线 (1).png` RAG 链路。

```
EYEBROW  07 / MEIDO · AI GUIDE
H1       A CHARACTER THAT KNOWS THE WORLD.
H1-zh    一个真正懂这个世界的角色。

┌── 左 5 栏 ──┐  ┌── 右 7 栏 ───────────────────┐
│ 梅朵 形象    │  │ KNOWLEDGE   知识库            │
│ (竖构图)     │  │ MEMORY      记忆              │
│              │  │ VOICE       语音克隆           │
│              │  │ NAVIGATION  智能寻路           │
│              │  │ NARRATIVE   叙事              │
└──────────────┘  └───────────────────────────────┘

玩家实际做的事（四步，代码绘制）：
  提问 → 命中知识库 → 基于真实资料回答 → 给出下一步探索线索

[RAG 链路图 技术路线(1).png，alpha，ink 底]

[guide-loop 8s 静音循环]
```
- 先讲体验，再揭示技术。**不放一堆缩写**。
- 技术事实原样引用：「RAG 知识库 + LLM 大语言模型 + 智能寻路算法」「语音克隆还原鲜活的声线」。

---

### 08 — KNOWLEDGE, NOT HALLUCINATION

**核心**：建立可信度。浅色（paper）底。

```
EYEBROW  08 / SOURCES & RECONSTRUCTION
H1       NOT IMAGINED. RECONSTRUCTED.
H1-zh    不是想象出来的，是考证出来的。

四栏证据（每栏图 + 2 行）：
  FIELD RESEARCH        实地考察
  ARCHAEOLOGICAL RECORDS 考古报告
  MUSEUM COLLECTIONS    博物馆藏品
  DIGITAL RECONSTRUCTION 数字复原

[考古报告图] + 引文（原样）：
  「查阅 1991 年《古格故城》考古报告，并与札达县博物馆馆藏文物进行
    仔细比对，确保数字重建的准确性与严谨性。」
  「数字重建并非凭空想象，而是建立在严谨的史料考证之上。」

[博物馆藏品 3 张]
[壁画参考资料 2 张]
[文物依据条]  门框 / 古格原木雕刻材质 / 果沃琴 / 弓箭与箭杆

[塑像复原 · 单独一段]
  红殿释迦牟尼塑像复原工程 —— 消失半世纪的庄严法相
```
- **所有来源均来自素材与 PPT 本身**，不虚构任何考据来源。页面不复制展板 D 的「1997 年」（与 PPT 的 1991 年冲突），统一用 1991 年。

---

### 09 — DESIGNING THE STORY ★ 宣传 VC 的「讲清楚」能力

**核心**：4 张新展板 + Presentation Mosaic + 制作流程图。

```
EYEBROW  09 / PRESENTATION & VISUAL SYSTEM
H1       THE PROJECT WAS COMPLEX.
         SO WAS THE CHALLENGE OF EXPLAINING IT.
H1-zh    项目本身很复杂，把它讲清楚是另一件难事。

能力行（不是服务广告，是能力声明）：
  DECK · POSTER · EXHIBITION BOARD · INFORMATION DESIGN · UI · VIDEO · ART DIRECTION

三段式揭示（避免「PPT 一页接一页」和「三张长板从上到下堆」）：

  ① 局部特写 —— 4 张裁切，展示版式手艺
     [设计说明排版] [三层结构标注] [UI 色板 6E4434/6C6314/A0A215/EAAD00/EFDCA0] [技术路线]

  ② PRESENTATION MOSAIC —— 6 页精选 PPT 组成视觉系统
     实地考察页 / 场景页 / NPC 页 / AI 页 / 考古页 / 技术页
     错落拼版（不是等大网格），逐块 mask 揭示

  ③ ZOOM OUT —— 4 张完整展板并排成「展板墙」
     每张下方：VIEW FULL BOARD（点开看完整大图）

收束句：
  WE DESIGN THE WORK. AND HOW THE WORK IS UNDERSTOOD.
  我们做作品，也做作品被看懂的方式。
```
- 深色（ink）底，像画廊。色温在这一章最浓（古金满格）。
- **不长展板直铺**：主页面只展示裁切与局部，完整图走 `VIEW FULL BOARD`。
- 商业目的：让客户知道 VC 能接 PPT 美化 / 提案设计 / 展板设计 / 复杂项目可视化 —— 但保持工作室定位，不写成「PPT 代做」。
- Mobile：Mosaic 重排为**竖向 editorial composition**（单列错落，不横滑），不让用户读缩到看不清的 PPT 小字。

---

### 10 — OUTCOME

```
EYEBROW  10 / OUTCOME
H1       A DIGITAL GUGE THAT DOESN'T COLLAPSE.
H1-zh    一座不会坍塌的数字古格。

[最终场景 全幅] + [成片循环 mengu-loop]

[三个奖项 3 张证书]  ← 作为验证，不作为核心叙事
  中国好创意暨全国数字艺术设计大赛 · 全国总决赛一等奖《古格拾忆录》
  未来设计师 NCDA · 全国总决赛三等奖《古格拾忆录》
  米兰设计周 · 全国决赛二等奖《梦回古格——尘封的凝望》

[制作信息 CREDITS —— 沿用现有谨慎措辞，不扩大团队职责]

NEXT PROJECT → 李花花 / VC-AI-Pet
```
- 收束回中性色温，回到 VC 的骨架。
- 最后一句作为本节拍点，然后交棒给下一个项目。

---

## 2. 移动端专项（Mobile 不是桌面缩小版）

| 项 | 桌面 | 手机 390 |
|---|---|---|
| 人物长卷 | 横向位移长卷 | **拆 4 段**独立阅读 |
| 三层结构图 | 右侧大图 + 左侧说明 | 全宽图 + 下方纵向列表；揭示时序压缩 |
| 长展板 | 局部特写 + 完整图入口 | 只出裁切 + VIEW FULL BOARD |
| Blender reel | 12s / 1920 宽 | 仍播放，下发 1600 宽 6-12s / 无音轨 |
| PPT Mosaic | 错落拼版 | 竖向 editorial 单列 |
| Hero 标题 | 压在画面上 | **移到画面下方**，不压在繁复图像上 |

## 3. 动画清单（克制、连续、有导演感）

**用**：mask reveal（clip-path 横向/纵向）、scale（1.00→1.04 缓慢推近）、translate（视差 0-8%）、image crop（object-position 定点）、layer reveal（三层结构图）、large typography（逐行 rise）、continuous transition（章节 tone 之间的拱形过渡沿用现有）。

**不用**：glitch、粒子爆炸、蓝紫科技光、复杂 mouse trail、新 WebGL、无意义 3D 旋转、炫技型滚动劫持、长时间 hard pin。

**降级路径**：
- `prefers-reduced-motion`：全部静态呈现，长卷改 `overflow-x:auto`，视频只留 poster。
- 无 JS：所有内容立即可见（沿用现有 `data-js` 机制），长卷可手动横滑。
- 低端机：视频不加载，只出 poster。

## 4. 实现分工（不新增依赖）

| 层 | 复用 | 新增 |
|---|---|---|
| 数据 | `content/types.ts` 的 `CaseSection` 扩可选字段；`content/projects.ts` 的 guge 段重写为 00–10 共 11 章 | `CaseBlock` 联合类型（media / mediaRow / video / quote / compare / flow / note） |
| 骨架 | `Band` / `Container` / `Eyebrow`（primitives） | `GugeChapter`（章节壳，处理染色与节奏） |
| 动效 | `Reveal`（rise / masked / fade / rule）+ `observeReveal` + `nearViewport` | 4 个专用客户端组件：Hero 遮罩、Layers 分层、Panorama 长卷位移、Deck 三段揭示 |
| 媒体 | `VcImage`（picture/srcset/lqip）、`VcVideo`（poster 优先 / 静音循环） | 无 |
| 隔离 | 其他三个旗舰项目零改动 | `CaseStudy.tsx` 只加一个 `slug === 'guge'` 分支 |

## 5. 自检（开工前）

- [x] 每章有**不同的视觉节奏**：全幅电影 / 双栏对照 / 分层揭示 / 横向长卷 / 技术图纸册 / 视频 mosaic / 实机节点 / 人物-能力对置 / 四栏证据 / 三段式展板墙 / 收束。
- [x] 每章**主要视觉 + 文案 + 滚动行为 + 动画 + 进入/离开方式**均已定。
- [x] 无长时间 hard pin；滚动全程前进。
- [x] 未推翻首页前半段；只做「黑色拱形 → 古格」的最小衔接。
- [x] 不新增依赖、不新增 WebGL。
- [x] 所有文案与事实均可溯源到 PPT / 剧本 / 素材本身。
- [x] 移动端 4 项特殊处理（长卷 / 结构图 / 长展板 / Mosaic）已定。
