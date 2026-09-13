# VC / 维C — 独立设计单元官网 V1

> **YOU BRING THE BRIEF. WE FIGURE OUT THE REST.**
> 把需求交给 VC，剩下的交给我们。

VC / 维C 的接单官网。以高质量滚动叙事展示 4 个旗舰项目，建立「复杂需求交给 VC 就能被完整解决」的客户心智，并把访问者引导到项目咨询。

内容主轴固定为：**作品 → 能力 → 方法 → 联系方式**。

> 改这个项目之前，先看 **[`CHANGELOG.md`](CHANGELOG.md)**。那里只记「为什么这么改」和「改完怎么验证」——踩过的坑、被否掉的方案、不可回的取舍都在里面。**每做一个有实质改动的提交，就往 `## 未发布` 下加一条。**

---

## 快速开始

环境要求：**Node.js ≥ 20.9**（开发机验证版本 24.x）。

```bash
cd vc-site
npm install
npm run dev          # http://localhost:3000
```

其他命令：

```bash
npm run build        # 生产构建
npm start            # 启动生产构建
npm run lint         # ESLint（flat config）
npm run typecheck    # tsc --noEmit
npm run check        # typecheck + lint
npm run sync-manifest  # public/works/_manifest.json → content/media.json
npm run fonts        # 重新下载并本地化字体（需要网络）
```

---

## 技术栈

| 层 | 选择 | 说明 |
|---|---|---|
| 框架 | Next.js 16（App Router） | 全部路由静态预渲染 |
| 语言 | TypeScript（`strict: true`） | 类型错误会让 `next build` 失败 |
| 样式 | Tailwind CSS v4（CSS-first `@theme`） | 设计令牌定义在 `app/globals.css` |
| 平滑滚动 | Lenis | 全站**唯一**平滑滚动实现，由 GSAP ticker 驱动 |
| 滚动叙事 | GSAP + ScrollTrigger | 仅用于 pin / parallax / scrub |
| 微交互 | Motion | 导航、移动菜单、hover、展开收起 |
| 字体 | `next/font/local`（自托管） | 运行时零第三方字体请求 |

> 依赖是刻意收窄的：**不引入 Three.js**，不引入组件库，不引入 CSS-in-JS。视觉密度由排版与留白承担，不由特效承担。

---

## 目录结构

```text
vc-site/
├─ app/
│  ├─ layout.tsx              根布局：字体、平滑滚动、页头页脚、SEO
│  ├─ page.tsx                首页（装配 9 个 band，顺序即销售逻辑）
│  ├─ globals.css             设计令牌 / tone 系统 / 揭示系统 / 排版工具类
│  ├─ fonts/                  自托管 WOFF2 + localFont 声明
│  ├─ work/[slug]/page.tsx    案例详情页（4 个旗舰共用模板）
│  ├─ work/page.tsx           全部作品索引
│  └─ lab/page.tsx            VC LAB
├─ proxy.ts                   把 /guanchao-live/<目录> 重写到它的 index.html（见「内嵌观潮」）
├─ components/
│  ├─ site/                   页头、页脚、移动菜单
│  ├─ home/                   首页 9 个段落，一段一文件
│  ├─ work/                   案例页组件、项目卡、奖项、上下篇
│  ├─ diagrams/               代码绘制的架构图（SVG + CSS，非图片）
│  ├─ media/                  VcImage / VcVideo —— 全站唯一的媒体入口
│  ├─ motion/                 Reveal / SmoothScrollProvider / RouteScrollHandler
│  └─ primitives/             Band、Eyebrow、TagList、SectionIntro、ArrowLink …
├─ content/
│  ├─ site.ts                 品牌、导航、能力、方法、VC LAB、联系方式
│  ├─ projects.ts             4 个旗舰 + 能力 Reel 的全部文案与素材引用
│  ├─ types.ts                内容模型的类型定义
│  └─ media.json              由素材管线生成的清单（勿手改）
├─ lib/
│  ├─ media.ts                key → <picture> 所需的一切
│  ├─ motion/                 gsap / lenis / device / reveal / useGsap
│  ├─ fonts.ts                字体 re-export
│  └─ utils.ts
├─ public/
│  ├─ works/                  素材管线的产物（响应式图片、视频、点云）
│  ├─ brand/                  图标、微信二维码等品牌资产
│  └─ guanchao-live/          观潮的离线静态副本（707 文件 / 24MB，构建产物，需提交）
├─ docs/
│  └─ ASSETS.md               资产映射：原始文件 → 输出 key → 网站位置
├─ scripts/
│  ├─ fetch-fonts.mjs         字体本地化
│  ├─ sync-manifest.mjs       素材清单同步进内容层
│  └─ qa/                     本地验收脚本（不参与构建，见 scripts/qa/README.md）
├─ CHANGELOG.md               开发日志：为什么改 + 怎么验证
└─ proxy.ts
```

---

## 内容模型：怎么改文案

**所有对外文字、链接、联系方式都在 `content/` 下，组件里没有硬编码文案。** 这是一个硬约束：新增第 5 个案例应当是改数据，不是改组件。

### 改品牌信息 / 导航 / 联系方式 → `content/site.ts`

- `brand` —— 品牌名、品牌定义、Hero 文案、discipline line
- `slogan` —— 主 slogan（英文两行 + 中文）
- `primaryNav` / `secondaryNav` —— 导航（`href` 用 `/#section-id` 形式）
- `capabilityPillars` —— MAKE / SOLVE / BUILD 三根支柱
- `whoToHire` —— One-stop 营销高潮段落
- `approachSteps` / `approachIntro` —— BRIEF → DELIVER 六步
- `lab` —— VC LAB 与 Local Brain
- `contact` —— 联系方式（微信已上线，邮箱仍缺，见下方「上线前必做」）
- `footer` / `seo`

### 改项目 → `content/projects.ts`

四个旗舰（`guge` / `lihuahua` / `guanchao` / `qinghua`）和 `moreWorkItems`。每个项目：

```ts
{
  slug, order, featured,
  title, titleZh, tagline, taglineZh,
  tags, year, accent, badge,
  cover: MediaRef,
  live: [{ url, label, note }],
  meta: [{ label, value }],
  summary, summaryEn,
  sections: CaseSection[],     // 详情页的滚动章节
  recognition: [...],          // 奖项（禁止编造）
  credits: [...],              // 协作信息（诚实呈现）
  video, relatedNote,
}
```

`CaseSection.layout` 决定该章节怎么排：

| layout | 呈现 |
|---|---|
| `statement` | 纯文字，超大留白 |
| `full` | 文字在上，全宽图在下 |
| `split` | 文字与图左右并置，移动端纵向堆叠 |
| `pair` | 两张图错位偏移 |
| `reel` | 横向滚动图像条（移动端可滑动） |
| `sequence` | 编号流程列表 |
| `diagram` | 文字 + 代码绘制的架构图（`diagram: DiagramId`） |

#### 章节可以挂「实况」而不是截图

`CaseSection` 上有三个可选的实况字段。有实况时，首页与案例页都用**真在跑的东西**替换静态封面（`components/work/ProjectLiveMedia.tsx`）：

| 字段 | 跑什么 | 谁在用 |
|---|---|---|
| `particle` | 浏览器里实时渲染的点云序列 | 青花造境 |
| `embed` | 内嵌一个可点击可滚动的真实产品副本（iframe） | 观潮 |
| `video` | 自托管循环短片 | 古格 |

优先级 `particle > embed > video`，都没有就退回静态封面（李花花目前就是封面）。低端设备 / reduced-motion / 省流量模式下**一个字节都不请求**，只显示封面图——封面同时是加载态和失败态。

哪个项目跑起了什么，用 `node scripts/qa/probe-home-blocks.mjs` 一眼看完。

> ⚠️ **`next build` 绝不能在 `next start` 运行期间执行。**
>
> `next build` 会重写 `.next`，而运行中的 next-server 内存里仍是旧构建的清单，它吐出的 HTML 引用的 chunk 已被覆盖删除 → Next 对缺失 chunk 返回 **500**，客户端加载失败，浏览器只显示一句 `This page couldn't load`（这是 Next 的失败视图，**不是**本站的 404 页，极易误判成网络问题）。
>
> 正确顺序：**停服务器 → `next build` → `next start`**。彻底恢复：`rm -rf .next && npm run build && npm start`。判断是否失配：`.next/BUILD_ID` 的修改时间晚于服务进程启动时间即已失配。
>
> 另外 `curl` 只能证明这一个 HTML 的状态码，**证明不了页面能用**。遇到「打不开」先跑 `node scripts/qa/diag-load.mjs`，它用真实浏览器加载并列出失败请求、4xx/5xx 和 JS 错误。

### 引用图片 → `MediaRef`

```ts
{ key: 'guge/guge_landscape_01', alt: '古格王朝土林遗址全景', caption: '可选图注', focal: '50% 45%', surface: 'light' }
```

- `key` 必须存在于 `content/media.json`（由素材管线生成）。
- **`surface: 'light'` 很重要**：深色线稿或浅底 UI 截图（例如古格三级世界结构图、李花花手机 UI、观潮 dashboard）放在深色底上会看不清，必须指定 `surface: 'light'`，渲染时会被包进浅色容器。
- key 不存在时不会崩：`VcImage` 会渲染一个 hairline 占位块并显示 `alt` 文字。

---

## 设计系统

### 令牌与 tone 系统

主底色是**暖近黑**，文字是**骨白**而非纯白 —— 作品承担颜色，VC 本身保持中性。所有令牌在 `app/globals.css` 的 `@theme` 里。

明暗节奏由一个属性驱动：

```tsx
<Band tone="ink" id="work">…</Band>     // 暗band
<Band tone="paper" id="approach">…</Band> // 亮band
```

`data-tone` 会重定向一组 CSS 变量，组件内部**一律**用这些变量，不写死颜色：

`--tone-bg` `--tone-fg` `--tone-fg-2` `--tone-mute` `--tone-line` `--tone-line-soft` `--tone-surface` `--tone-accent`

`--tone-accent` 可由项目注入（`<Band accent={project.accent}>`），**只用于细节**（章节序号、hairline、角标），不做大面积铺色。

> 新增 section 时不要自己发明颜色或间距：用 `Band` + 现有工具类，明暗节奏和垂直尺度才会全站一致。

### 排版

工具类（不要自己设 `font-family`）：

`type-hero` `type-xl` `type-lg` `type-md` `type-lead` `type-body` `type-label` `type-label-sm`

全部用 `clamp()` 做流体缩放，从 360px 到 4K 连续变化。英文大标题 + 中文辅助说明是固定的信息层级。

**字体策略**：英文用自托管的 Archivo（display）/ Inter（正文）/ JetBrains Mono（标签）。
**中文不加载 webfont**，走系统字体栈（PingFang SC / HarmonyOS Sans / Microsoft YaHei …）。理由：完整 CJK 字体有好几 MB，会吃掉整个移动端预算；而系统字体本来就是中文读者最熟悉的字形，小字号下渲染更好。自托管英文字体总体积 **121 KB**。

---

## 动效架构

三层，各自职责清晰：

### 1. 滚动揭示 → IntersectionObserver + CSS 过渡

`components/motion/Reveal.tsx` + `lib/motion/reveal.ts`

**刻意不用 GSAP 做揭示。** IntersectionObserver 不会漏掉元素、滚动时零开销，而且即使动画层没启动，揭示系统仍然工作。GSAP 只留给只有 GSAP 能做的事。

安全性设计：`[data-reveal]` 只在 `<html data-js="on">` 时才隐藏。这个属性由 `app/layout.tsx` 里一段极小的 inline script 在**首次绘制前**设置。所以如果脚本被禁用或被代理剥离，整站会以完全可见的静止状态呈现，而不是一屏全透明。

> ⚠️ **改揭示样式前必读**
>
> 被观察元素（带 `data-reveal` 的那个）**不能**有会改变自身几何或裁剪的隐藏状态。
>
> `clip-path: inset(0 0 100% 0)` 会把元素的 intersection area 归零，于是 IntersectionObserver 的 ratio 永远是 0，阈值永不触发，**元素会永久停留在 opacity: 0**。首屏的元素因为 `flushVisibleReveals()` 兜底还能显示，首屏以下的就彻底消失了 —— 而且在代码评审里完全看不出来。
>
> 所以 `masked` 变体的裁剪被放在**子元素** `[data-reveal-mask]` 上，外层保持正常几何；`rise` / `fade` 只用 opacity + transform，属于几何中性，可以自施加。
>
> 双保险：`SmoothScrollProvider` 里有一个看门狗，每滚动 500px 调一次 `flushVisibleReveals()`，用**边界盒**（而不是 intersection ratio）揭示视口内的元素。即使将来有人再犯同样的错，内容也不会永久隐形。

### 2. 平滑滚动 → Lenis（唯一实现，由 GSAP ticker 驱动）

`components/motion/SmoothScrollProvider.tsx`

- Lenis 由 `gsap.ticker` 驱动，**不是**自己的 rAF 循环 —— 两个循环会产生漂移，表现为 pin 时抖动。
- `globals.css` 显式写了 `scroll-behavior: auto`，避免原生平滑滚动与 Lenis 打架。
- 触摸设备不接管（`syncTouch: false`）：原生惯性滚动体验更好，微信 WebView 对合成滚动也更敏感。
- 路由切换由 `RouteScrollHandler` 处理：重置滚动位置、支持 `/#section` 深链、重新测量 ScrollTrigger、补揭示视口内元素。

### 3. 大型叙事 → GSAP + ScrollTrigger

Hero 入场、作品图视差、pinned 段落、横向 reel。

统一入口是 `useGsapScope(setup, { deps, disabled })`，它在 `gsap.context()` 里运行并自动 `revert()`，避免 App Router 路由切换后残留 ScrollTrigger（这是「返回上一页后页面跳动」的经典成因）。

### 降级

`useDeviceProfile()` 是设备判断的唯一来源：

| 信号 | 结果 |
|---|---|
| `prefers-reduced-motion: reduce` | `static: true`，`tier: 'low'` —— Lenis 不启动、GSAP 不启动、视频不加载 |
| `saveData` / 2G / ≤2 核 / ≤2GB 内存 | `tier: 'low'` —— 关闭视差、pin、marquee |
| `pointer: coarse` | `isTouch: true` |
| 宽度 ≤ 1023px | `isCompact: true` |

**降级后内容必须完整可读** —— 所有动画元素在静止状态下都是最终形态，不存在「不滚动就看不到」的信息。

---

## 响应式与多端策略

原则：**同一品牌语言，不同设备编排**，不允许「桌面做好再缩手机」。

- 断点：Tailwind 默认 + `3xl`(1920) + `4xl`(2560)。
- 横向并置在窄屏改为纵向堆叠（`split` / `pair` / 作品区编排）。
- hover 才出现的信息改为**始终可见**或 tap 触发。
- 移动端减少视差幅度与 pinned 段落时长，不劫持滚动。
- CTA 与所有可点元素触控目标 ≥ 44px。
- 用 `svh` 而不是 `vh` 做整屏高度，避免移动端地址栏导致的高度跳变。
- 目标设备：Desktop 1920/2560/4K、Laptop 1366–1600、iPad 横竖屏、常见 Android/iPhone、微信内置 WebView、Chrome/Edge/Safari。

> ⚠️ **全出血不要用 `w-screen` / `100vw`**
>
> `100vw` **包含**经典滚动条宽度，所以 `.shell` 里的 `w-screen` 子元素永远比视口宽一点，会把整个文档撑出水平滚动条（微信 WebView 下尤其明显）。
>
> 用 `.bleed`（只取消两侧 gutter）或 `.bleed-x`（取消 gutter 并保留内边距，给横向滚动条用）。两者都基于 `.shell` 暴露的 `--shell-pad` 变量，所以在 1920+ 断点也自动对齐。
>
> 另外 `html` / `body` 用的是 `overflow-x: clip` 而**不是** `hidden`：`hidden` 会把另一轴强制成 `auto`，把 `<body>` 变成滚动容器，从而**悄悄破坏所有 `position: sticky` 后代**（pinned 的 who-to-hire 舞台与 approach 侧栏都依赖它）。

---

## 性能策略

- 动画只用 `transform` / `opacity`，不触发 layout/reflow。
- 图片是**构建期**预生成的响应式多档产物（AVIF → WebP → JPEG 兜底，5 档宽度，绝不放大）。
- `VcImage` 用固定宽高比占位 + 24px LQIP 背景，**CLS 结构性归零**。
- 非首屏图片 `loading="lazy"`；LQIP 极小且是 CSS 背景，不占用请求优先级。
- 视频：`preload="none"` + poster 先绘制；进入视口才播放，离开即暂停；`low` tier 设备**完全不下载**。
- `images.unoptimized: true`：图片在构建期已经优化过，运行时不再走图片优化端点（这也是 EdgeOne Pages 可移植性的前提）。

---

## 素材

完整的资产映射（原始文件 → 输出 key → 网站位置 → 体积策略）见 **[`docs/ASSETS.md`](docs/ASSETS.md)**。

要点：

- 原始素材与素材管线脚本（`build-images.mjs` / `build-qr.mjs` / `capture-*.mjs`）在**仓库外**的工作区目录 `_handoff/` 与 `_build/`，不参与构建、不入库。仓库里提交的是它们的**产物**，所以 clone 下来能直接构建、能直接部署，但不能从零重跑素材管线。
- `public/works/` 是管线产物，**需要提交**（部署时要用）。
- `public/guanchao-live/` 是观潮的离线静态副本，同样是产物、同样需要提交，重建流程见 `CHANGELOG.md`。
- 清单流：`public/works/_manifest.json` → `npm run sync-manifest` → `content/media.json` → `lib/media.ts` → `VcImage`。
- 新增图片：先跑管线生成衍生图 → 同步清单 → 在 `content/projects.ts` 里写 `MediaRef`。

> ⚠️ `public/works/_manifest.json` 的键序是**源目录遍历顺序**，不是字母序。加条目要**原地追加**（`obj[key] = v`），不要 `.sort()` 重排 —— 重排会把「加一条」变成几百行无意义的 diff。

---

## 部署（腾讯云 EdgeOne Pages）

代码**不依赖任何 Vercel 特有能力**：没有 `@vercel/*`、没有 Edge Middleware、没有平台存储，图片不走运行时优化端点。所有路由静态预渲染。

```bash
npm run build     # 产物在 .next/
npm start         # 本地验证生产构建
```

接入 EdgeOne Pages 时：

1. 构建命令 `npm run build`，输出目录 `.next`（Node 运行时）。
2. 绑定自定义域名；中国大陆节点需要 **ICP 备案**。
3. 备案与开发可以并行 —— 开发阶段不必等待备案，先用 preview 域名验证。

> 上线前请在 `next.config.ts` / `app/layout.tsx` 里补 `metadataBase` 为正式域名。

---

## 上线前必做

**网站不编造任何联系方式。** 每个真实值都是用户给的；还没给的字段留 `null`，UI 渲染成显式的「待补充」区块，而不是一个看起来像真的假值。这是有意为之，不是未完成的 bug。

已经真实的：

| 字段 | 位置 | 值 |
|---|---|---|
| 微信号 | `contact.channels[0].value` | `Vc1242856346` + 一键复制 |
| 微信二维码 | `contact.qrImage` | `brand/wechat-qr`（从名片裁掉个人信息后生成，二维码本身可解码） |
| 古格 credits | `content/projects.ts` | 三条真实分工 |

还没给的（给到就能直接填）：

| 字段 | 位置 | 现状 |
|---|---|---|
| 联系邮箱 | `contact.channels[1].value` | `null` → 页面显示「待补充：正式联系邮箱」 |
| 需求表单端点 | `contact.formEndpoint` | `''` → 目前是「复制需求 + 加微信」流程，不是坏了 |
| 正式域名 | `next.config.ts` / `metadataBase` | 未设置 |
| 部署 | 腾讯云 EdgeOne Pages | 未做（构建命令 `npm run build`，输出 `.next`，大陆节点需 ICP 备案） |
| VC Logo | `public/brand/icon.svg` 是几何构造的临时 favicon | 可选替换 |
| `misc/smart_planter_concept` 素材 | 归属项目未确认 | 保持不接入 |

其余待补资产（李花花精修 UI、青花造境原始素材）见 `docs/ASSETS.md` 第 5 节。

---

## 验收清单

```bash
npm run check        # typecheck + lint
npm run build        # 生产构建
```

功能、视觉、性能三方面的逐条验收标准见交接文档第 11 节。工程侧要求：

- [x] `npm run build` PASS
- [x] `npm run lint` PASS
- [x] `npm run typecheck` PASS
- [x] 所有文本 / 链接 / 联系方式集中在 `content/`
- [x] 前端不包含任何 secret（已按 `sk-*` / `api_key` / 私钥 / `localhost:端口` 模式扫描 `app components content lib`）
- [x] 素材路径与映射有文档（`docs/ASSETS.md`）
- [x] reduced-motion 全站生效
- [x] 联系信息缺失时是**显式占位**而非虚构

### 浏览器回归

用 Chromium 对 7 条路由 × 4 个视口（1600 / 2560 / 1024 / 390）跑自动回归，另外单独验证 reduced-motion、微信 WebView 与**禁用 JavaScript** 三条路径：

| 检查项 | 结果 |
|---|---|
| 控制台错误 / 页面异常 | 0 |
| 页面级水平溢出 | 无（微信 375px 视口 `scrollWidth == clientWidth`） |
| 未揭示的 `[data-reveal]` 元素 | 无（桌面 7/7 路由、移动端 7/7 路由） |
| reduced-motion 下隐藏内容 | 0 |
| **禁用 JavaScript** 下隐藏内容 | 0（7/7 路由正文与图片完整可见） |
| 未加载 / 破图 | 0 |
| `ASSET PENDING` 占位 | 0（所有引用的 key 都存在于清单中） |

回归脚本在 **[`scripts/qa/`](scripts/qa/README.md)**（随仓库维护，不参与构建）：

```bash
cd vc-site && npx next start -p 3000     # 另开一个终端
node scripts/qa/shoot.mjs                # 全站回归
node scripts/qa/diag-load.mjs            # 只问"站点能不能打开"
```

完整脚本清单、判据、环境变量见 **[`scripts/qa/README.md`](scripts/qa/README.md)**。

> ⚠️ **验收脚本的输出是假设，不是判决。** 脚本报失败时先判断是不是脚本自己过期了（写死的旧端口、旧选择器、旧文案）；脚本报通过也不代表没缺陷 —— 曾经出现过「所有自动化指标全绿」与「每个汉字占一行、页面被撑高 4240px」同时存在的情况。**改完界面要用真实截图亲眼看一遍**（`node scripts/qa/shoot.mjs` 会把截图落到 `_qa-output/`）。

