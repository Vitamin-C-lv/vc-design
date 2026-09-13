# 资产映射 ASSET MAPPING

本文档说明 **VC / 维C 官网** 使用的全部静态资产：原始文件是什么、被放到了哪里、在网站的哪个位置出现，以及如何重新生成衍生图。

工程内资产一律位于 `vc-site/public/`，由 Next.js 原样提供为 `/...` 路径。

---

## 1. 资产管线总览

```
_handoff/vc_site_assets/organized_assets/     ← 原始素材（只读，不参与构建）
        │
        │  sharp：宽度 480 / 768 / 1200 / 1600 / 2048，输出 webp + avif + jpg 兜底 + 24px LQIP
        ▼
vc-site/public/works/<category>/<name>-<width>.{webp,avif}
vc-site/public/works/_manifest.json            ← 清单：key → 所有衍生文件路径 + 原始尺寸 + 宽高比
        │
        │  node scripts/sync-manifest.mjs
        ▼
vc-site/content/media.json                     ← 被 lib/media.ts 静态 import，供 VcImage 使用
```

组件 **不直接拼图片路径**。页面里的图片一律写成 `MediaRef`：

```ts
{ key: 'guge/guge_landscape_01', alt: '古格王朝土林遗址全景', caption: '可选中文图注', focal: '50% 45%' }
```

`VcImage` 会查 `content/media.json`，自动生成 `<picture>`（AVIF → WebP → JPEG 兜底）、`srcset`、`sizes`、LQIP 背景与固定宽高比（防 CLS）。

**key 不存在时**：`VcImage` 渲染一个 hairline 占位块并显示 `alt` 文字，不会报错、不会布局塌陷。因此新增图片时可以先写 `key`、后补资产。

---

## 2. 原始文件 → 输出 key → 网站用途

### 古格王朝 AI 智能导览系统（Featured 01）

| 原始文件 | 输出 key | 原始尺寸 | 网站位置 |
|---|---|---:|---|
| `C8F1EC2A-…jpeg` / `D9C4EA9B-…jpeg` / `43EF5D6B-…jpeg`（三张相近版本） | `guge/guge_landscape_01`<br>`guge/guge_landscape_02`<br>`guge/guge_landscape_03` | 1536×863 | `01` 封面与首章全宽图 / `02` 章节配图 / `06` 流程章节配图 |
| `file_000000008ce081f88f05a958de283304`（无扩展名，实为 JPEG） | `guge/guge_master_poster` | 1448×2048 | `02` SYSTEM CONCEPT 章节（竖版总海报，`split` 布局） |
| `file_00000000bd2882078c59adebb545740d`（无扩展名，实为 PNG） | `guge/guge_world_layers` | 1639×2048 | `03` 三级世界结构图。**深色线稿，必须以 `surface: 'light'` 放在浅色容器里** |
| `0001-0120.mp4` | `guge/video/guge-loop.{mp4,webm}`<br>`guge/video/poster-*.{webp,avif}` | 1900×1204，10s | `05` VR 体验章节：静音循环演示视频（`VcVideo`） |

### 奖项证书（Proof 层）

| 原始文件 | 输出 key | 网站位置 |
|---|---|---|
| `618BA774-…jpeg` | `awards/guge_china_creative_first_prize` | 古格详情页 `07 OUTCOME / RECOGNITION`，点击展开 |
| `5322DB67-…jpeg` | `awards/guge_ncda_third_prize` | 同上 |
| `04AB4F95-…jpeg` | `awards/guge_milan_design_week_second_prize` | 同上 |

> 证书**不做大面积铺陈**，只在 RECOGNITION 列表里按需展开。

### Blender / CG（More Work — 3D / VISUALIZATION）

| 原始文件 | 输出 key | 原始尺寸 | 内容 |
|---|---|---:|---|
| `file_000000007108822fabe78115aa49ae97` | `blender/flooded_corridor` | 2048×1152 | 积水走廊，水面倒映顶灯与漂浮时钟 |
| `file_000000001f84823083d3f8f52ac3fe93` | `blender/old_apartment_scene_01` | 2048×1297 | 老公寓楼道，暖色阳光 |
| `file_0000000015288206bea3537f93d2764a` | `blender/old_apartment_scene_02` | 2048×1297 | 楼梯转角，春联与锈蚀栏杆 |
| `file_0000000056c881f883933548fce7eabb` | `blender/liquid_material_study` | 1080×1920 | 液体飞溅材质研究 |

### 李花花 / VC-AI-PET（Featured 02）

| 原始文件 | 输出 key | 原始尺寸 | 网站位置 |
|---|---|---:|---|
| `1000061102.png`（实为 JPEG） | `lihuahua/relaxed` | 691×1536 | 首页封面 + `02` IDENTITY 章节（`surface: 'light'`） |
| `1000061197.jpg` | `lihuahua/sleep` | 691×1536 | `03` STATE / EMOTION 章节（`surface: 'light'`） |
| `1000061147.png`（实为 JPEG） | `lihuahua/finding` | 691×1536 | `05` DREAM / REFLECTION 章节（`surface: 'light'`） |

> 手机 UI 截图属于 **Working Prototype 证据**，不作主视觉。系统能力由 `components/diagrams/` 中代码绘制的架构图承担。

### 观潮 Daily Brief（Featured 03）

| 原始文件 | 输出 key | 原始尺寸 | 网站位置 |
|---|---|---:|---|
| `file_0000000025688230846212bc728ecafc` | `guanchao/dashboard` | 2048×1299 | 首页封面 + `02` INFORMATION ARCHITECTURE 章节（`surface: 'light'`） |
| 从 Live 站抓取 | `guanchao/live/desktop-full`<br>`guanchao/live/desktop-view-01..03`<br>`guanchao/live/mobile-full` | 见 manifest | 案例页补充证据（真实线上界面） |

### 青花造境（Featured 04）

青花造境**在本次交接中没有提供任何本地素材**。按照交接要求（禁止远程热链用户不可控素材），案例页与封面全部使用从 Live 站本地抓取的截图。

该站点不是滚动式页面，而是**全屏分步式交互体验**（PORCELAIN CREATION STUDIO，五道制瓷工序），所以滚动抓取只能拿到同一个画面。为此补做了「按工序推进」的抓取：

| 来源 | 输出 key | 网站位置 |
|---|---|---|
| `https://qinghua-zaojing.vercel.app/` 本地抓取（滚动） | `qinghua/desktop-full`<br>`qinghua/desktop-view-01..03`<br>`qinghua/mobile-full` | 首页封面 + 案例页 |
| 同上，点击「跳过教程」后按工序推进 | `qinghua/step-01` | 案例页 `03 INTERACTION DESIGN`（02 青花绘饰 / PORCELAIN PAINTING） |
| 同上 | `qinghua/step-02` | 案例页 `04 AI AS A TOOL`（03 清釉覆彩 / TRANSPARENT GLAZING） |
| 同上，移动端初始画面 | `qinghua/mobile-step-01` | 案例页 `06 LIVE EXPERIENCE`（移动端重新编排） |

> 抓取只推进到第 03 工序：该步的「开始施釉」需要先调节釉层参数才能继续，无法无条件跳过，因此如实停止。
> `desktop-view-01..03` 三张是同一工序的不同粒子动画帧，视觉上高度接近，**不要在版面上当作三张不同内容使用**。

抓取脚本：`_build/capture-live.mjs`（通用站点）、`_build/capture-qinghua-steps.mjs`（分步推进），均为工作脚本，不参与构建。

### 未分配

| 原始文件 | 输出 key | 说明 |
|---|---|---|
| `233DCE3B-…jpeg` | `misc/smart_planter_concept` | 智能花盆产品概念图（屏幕显示湿度 72% / 温度 23℃）。**尚未确认归属项目**，因此目前不在网站任何位置使用。确认后可在 `content/projects.ts` 的 `moreWorkItems` 中加一条并引用该 key。 |

---

## 3. 重新生成资产

前提：Node ≥ 20.9，系统已安装 `ffmpeg` / `ffprobe`。

```bash
# 1) 图像衍生图（需要 sharp，装在 _build/ 里，不污染 vc-site 依赖）
cd _build && node build-images.mjs

# 2) 视频衍生图与循环视频
cd _build && ./build-video.sh          # 或直接重跑视频管线脚本

# 3) 把清单同步进内容层
cd vc-site && npm run sync-manifest

# 4) 校验
cd vc-site && npm run check && npm run build
```

`_build/` 已在 `.gitignore` 中，属于本地工作目录；`public/works/` 的产物**应当提交**，因为部署时需要它们。

---

## 4. 体积与格式策略

- **格式优先级**：AVIF（q55）→ WebP（q78）→ JPEG（q82 兜底，只作为最大档）。`<picture>` 顺序保证支持 AVIF 的浏览器拿到最小文件。
- **宽度档位**：480 / 768 / 1200 / 1600 / 2048，**绝不放大**（原图窄于某档就跳过该档），所以有的 key 只有 480 一档（例如李花花手机截图 691px 宽）。
- **LQIP**：每张图附带 24px 宽的 WebP，作为 `background-image` 铺在容器上，真实位图解码完成后淡入，避免空白闪烁。
- **CLS**：容器始终用原始宽高比占位，图片 `width`/`height` 也已给出。
- **视频**：`preload="none"` + poster 图先绘制；进入视口才播放、离开即暂停；`low` tier 或 reduced motion 设备**完全不下载视频**。

---

## 5. 需要补充的资产（不阻塞开发）

| 项目 | 现状 | 上线前需要 |
|---|---|---|
| VC Logo | 用 `VC` 文字标识；`public/brand/icon.svg` 为几何构造的 favicon | 正式 Logo（可选） |
| 微信二维码 | **已就位**：`public/brand/wechat-qr.png`，`contact.qrImage = 'brand/wechat-qr'` | — |
| 微信号 | **已就位**：`contact.channels[0].value = 'Vc1242856346'`（点击即复制） | — |
| 联系邮箱 | **已就位**：`contact.channels[1].value = 'lxy13738164923@outlook.com'`，`href` 保持 `null` 由 `ChannelValue` 拼 `mailto:` | 无 |
| 表单接口 | `contact.formEndpoint = ''`，按钮因此是「复制需求」而不是「发送需求」 | 一个接收 POST 的接口地址 |
| 正式域名 | 未提供 | 填入 `metadataBase` 与页脚 |
| 客户评价 / Client Logo | **禁止编造**，因此网站目前完全没有这一层 | 真实评价出现后再加 |
| 李花花产品 UI | MVP 阶段 | 精修 UI 出来后替换 `lihuahua/*` 三张图 |
| 青花造境原始素材 | 无 | 设计源文件出来后替换 Live 截图 |

> 未提供的资产**不会阻塞开发**：`VcImage` 的占位机制与 `contact` 的显式占位状态保证网站在任何缺失情况下都呈现完整、可用的形态，且不编造任何信息。
