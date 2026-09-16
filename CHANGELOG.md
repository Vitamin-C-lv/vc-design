# 开发日志

面向接手这个项目的人（包括未来的我和新的协作者）。**只记“为什么”和“怎么验证”**，不记“改了什么文件”——那部分 `git log` 已经说了。

规矩：

1. **每个有实质改动的提交，都在 `## 未发布` 下加一条。** 发布时把 `## 未发布` 改名为版本号，并在下面新开一个空的 `## 未发布`。
2. **倒序**：新条目加在最上面。
3. **写“为什么”必须带依据**：用户原话、实测数据、截图结论、上游文档。没有依据的判断要写明是推测。
4. **写清怎么验证**：跑哪条命令、看哪个数、判据是什么。否则下一个人无法确认这次改动是否还有效。
5. 条目里出现的路径、命令、脚本名必须真实存在。写了跑不通的命令，比不写更糟。

格式：

```
### YYYY-MM-DD · 一句话标题
**为什么** — 触发原因（用户要求 / 缺陷 / 上游变更）。
**做了什么** — 方案与关键取舍，含被否掉的选项及原因。
**验证** — 命令 + 判据 + 实测结果。
**遗留** — 已知未做、取舍、下一步。（没有就省略）
```

---

## 未发布

### 2026-09-16 · 生产发布 `08229f6`；获奖证书打码后公开

**为什么** — 用户验收第一轮后给了三条决定：①「现在可以部署上线。我建议直接部署 `08229f6`」；②「获奖证书建议打码后公开，但不要改写 Git 历史」；③「现在不建议给整个仓库加 MIT」——保持「Public ≠ 授权复用」，将来把通用部分抽成独立仓库再单独 MIT。证书上同时印着作者姓名、指导教师姓名、参赛院校与证书编号，而站点既有规则是不出现真人姓名与学校，所以打码是必须项，不是可选项。

**做了什么**

- **生产发布**：在干净工作树上本地构建，用 `edgeone makers deploy -n vc-site -a overseas` 发布 `08229f6`（Deployment `dpxoyif4f03j`）。EdgeOne 不读 Git，`main ≠ production` 这条线保持不变。
- **证书打码**：三张证书的 20 个衍生图**原地重做**，原始证书始终在仓库外，站点只引用打码后的衍生图。
- **体积策略**：打码用的 q100 中间母版**不入库**，最大档 JPEG 按 `docs/ASSETS.md` 的 q82 重新编码（q100 母版另存仓库外的 `_build/awards-redact/masters-q100/` 备查）。踩过一次：这三张的最大档**既是衍生母版又是 `<picture>` 兜底**，脚本里 `if (fallbackPath !== masterPath)` 的短路让 q100 中间产物直接留在仓库里，三张兜底 JPEG 膨胀到打码前的 2.0–3.4 倍。
- **文档**：`docs/ASSETS.md` 的「奖项证书」小节补上打码规则与验收判据，连同下面这条失败教训。

**为什么打码不能用目测坐标**（这轮最贵的教训，两次返工都出在这里）—— 第一次按目测归一化坐标画框：米兰那张整排偏下，作者姓名 / 指导老师 / 参赛单位三行**完全没框住**，NCDA 的作者姓名行同样漏掉。第二次改成按墨迹检测行，但填充矩形的 x 起点仍用固定值，落进了标签文字内部：米兰把标签啃成孤立的「作」「指」，NCDA 的「指导老师」「参赛单位」连标签一起整行消失，而且「作者姓名」行**残留了一块汉字碎片**——漏一个名字等于没打码，残留碎片同理。最终方案：在行带内做列投影，找出「标签簇 / 零墨迹间隙 / 值簇」，填充起点取零墨迹间隙**中点**，只擦值、保留标签；间隙窄于 4px 时整行填掉，绝不猜。

**验证**

- 生产：正式域名 `https://vc-design.online` 上七个路由 + `/sitemap.xml` + `/robots.txt` 全部 200；`BASE=https://vc-design.online node scripts/check-seo.mjs` 通过；`node scripts/qa/verify-header-contrast.mjs` 通过（浅色 `中文 17.8:1` / `EN 5.84:1`，深色 `17.12:1` / `7.07:1`）；`scripts/qa/shoot.mjs` 在线上四视口七路由通过（无横向溢出、无未揭示元素、无待补素材）。三个实况表面逐个实测：青花 canvas 真在画（像素 stdev 95.3 手机 / 63.1 桌面）、观潮 iframe 渲染出 1005 个节点且**应用内翻页可用**（点 `/guanchao-live/markets` → 渲染「三地股市简报」）、古格视频 `readyState=4` 且在播；手机菜单开关干净（`aria-expanded` 正确、背景 `inert`、关闭后焦点回到触发按钮）。
- 证书：用未打码备份做像素级对照 —— 三张共 18 个改动条带的**标签区真实改动均为 0 像素**（阈值 `|Δ|>12`），擦除区内**不存在 > 20px 的连通墨迹块**；20 个衍生图文件集合与像素尺寸不变；体积为打码前的 AVIF/WebP/LQIP `0.77–0.97×`、JPEG 兜底 `0.81–0.92×`；放大对比图逐张目视确认，官方名称、作品名称、参赛组别、奖项等级、日期与印章均保留。

**遗留**

- **已知噪音（非缺陷）**：线上控制台会出现 4~8 条 404，形如 `/guanchao-live/<目录>/index.html/__next._tree.txt?_rsc=…`。那是观潮**静态导出快照自己的 RSC 预取**，静态导出永远没有这些文件；本地同一份代码不出现（预取被取消，没到服务器）。功能不受影响（翻页实测可用），且与本次改动无关（diff 既没碰 `proxy.ts`，也没碰 `public/guanchao-live/**`）。
- **未打码的原图仍留在旧提交里**——用户明确要求不改写历史。当前工作树与线上都只有打码版本。
- 用户点名的两条下一轮项：把 `scripts/qa/verify-header-contrast.mjs` 真正接进 CI（需要装 Chromium/QA 依赖）；移动菜单把关闭控件放进 dialog 内、并把整个外部 Header 一并 `inert`（现在为了让页头的关闭按钮可达，焦点循环里包含了 dialog 之外的触发按钮，与 `aria-modal="true"` 的语义不完全一致）。

### 2026-09-16 · SEO、可访问性与 CI 工程化收口；性能边界只测量不拆分

**为什么** — 这一轮同时收口了几类会误导搜索引擎、键盘用户和后续协作者的问题。SEO 的根因是 `app/layout.tsx` 的全局 `alternates.canonical: '/'`：App Router 逐层合并后，`/work`、`/lab`、`/work/<slug>` 全部把首页声明为 canonical。未修改的 `822910e` 基线构建上，`/work` 的 HTML 确实是 `<link rel="canonical" href="https://vc-design.online"/>`。另外，Next 的 `openGraph` 是**整体替换而非逐字段合并**：页面自己写 `openGraph` 后，父层的 `siteName/locale/images` 全部丢失；修 canonical 时实际踩出过一次回归，`/work`、`/lab`、四个案例页这六个路由的 `og:image` 全没了。

可访问性方面，`app/layout.tsx` 已有 `<main id="main">`，而 `app/work/page.tsx`、`app/lab/page.tsx` 又各包了一层 `<main>`，实际 HTML 出现两个 main landmark。移动菜单的焦点和背景隔离也需要明确的键盘协议；过程中还发现一个自己引入的回归：面板内没有关闭按钮，而触发按钮被设成 `tabIndex=-1`，键盘用户只能靠 Esc。另有一处既有的页头缺陷：`[data-tone='paper']` 已正确把 `--tone-fg` 切到墨黑，但 `LangToggle` 两个按钮和移动菜单按钮没有 tone 颜色类，继承了 body 的骨白 `rgb(247,245,241)`，在浅色段落上变成白字白底。822910e 基线 A/B 测试得到相同结果，证明它不是本轮引入。

性能方面，用户此前明确说：「其实我更希望这些作品在主页就渲染出来而不是点进去才有」。因此这轮只测量首页 client boundary 和移动端重内容的真实代价，没有因为担忧而擅自改造。

**做了什么**

- SEO：用 `app/metadata.ts` 提供共享 `openGraphDefaults` 兜底；七个路由各自声明正确 canonical；`/work`、`/lab` 使用共享分享图，四个旗舰各自使用 `public/og/<slug>.png`（1200×630）；补上 `app/sitemap.ts`（7 条 URL）与 `app/robots.ts`。无浏览器脚本 `scripts/check-seo.mjs` 读取 `BASE`，断言每个路由的 canonical 与 `og:image`、sitemap 7 条、robots 指向 sitemap，失败非 0 退出。
- 可访问性：移除 `/work`、`/lab` 的嵌套 main；移动菜单打开后焦点进入面板，Tab/Shift+Tab 在「面板项 + 页头关闭按钮」之间循环，背景 `main`/`footer` 使用 `inert`，Escape 关闭后焦点回到触发按钮。`BriefForm` 的 intent 选择和 `ParticleShowcase` 的 7 阶段选择补齐 roving tabindex、方向键、Home/End 与选中态同步；tabpanel 通过 `aria-labelledby` 关联当前 tab，id 用 `useId` 生成，移除了写死的 `id="particle-stage-panel"`。
- 页头对比度：两个控件补 `tone-fg` 以跟随页头 tone 翻转；非当前语言的 `opacity` 从 `0.45` 提到 `0.62`，因为 `0.45` 时实测只有 3.1:1，低于该字号的 4.5:1 门槛。新增 `scripts/qa/verify-header-contrast.mjs` 并登记进 `scripts/qa/README.md`。
- CI 与工程化：新增 `.github/workflows/ci.yml`，push/main 与 PR 触发，Node 22，按 `npm ci` → `typecheck` → `lint` → `build` → 起 `next start` 跑 `scripts/check-seo.mjs` 的顺序执行；服务器启动、检查、回收在同一个 step 内完成，不依赖跨 step 的后台进程假设。明确不接 EdgeOne 自动部署：`main ≠ production`，CI 只证明这个 commit 可以上线；上线仍是本地 `npm run build` + `edgeone makers deploy -n vc-site -a overseas`。
- 依赖与文档：`@types/three` 从 `dependencies` 移到 `devDependencies`；`docs/ENGINEERING.md` 改正了 Three.js 仅用于青花造境粒子器物、`https://vc-design.online` 已上线、EdgeOne Makers overseas 本地构建上传等事实。`build-images.mjs` / `build-qr.mjs` / `capture-live.mjs` 入库到 `scripts/assets/`，并新增 `build-og-cards.mjs`；私有原图仍不入库，用户绝对路径不写入脚本。`public/guanchao-live/` 增加 `SOURCE.json` 溯源，查不到的字段写 TODO。README 增加「授权 / Licensing」：仓库公开是为了作品集透明度，代码与视觉 / 媒体素材未经许可不可复用；没有创建 LICENSE 文件，代码是否单独采用 MIT 留给作者决定。
- 性能只测量、未改造：没有做那次 client boundary 拆分，也没有改变移动端重内容策略。理由是可省约 26 KB raw（约占首页初始 JS 的 3%、压缩后更小），却要动首页/案例页 8 个以上文件与实时媒体判定逻辑，风险收益不匹配；框架底座才是大头，属于另一轮的事。

**验证**

- SEO：`BASE=http://localhost:3210 node scripts/check-seo.mjs` 通过（7 routes, sitemap, robots）。同一个脚本在 822910e 基线上失败并打印 `/work canonical 应为 https://vc-design.online/work，实际为 https://vc-design.online/`。`/work`、`/lab` 和四个案例页的分享图实测为 1200×630，字节数依次为 **341,305 / 76,656 / 97,219 / 149,509**。
- 可访问性：实测每个路由 `<main>` 数量 = 1。Playwright（390×844）Tab 序列为 `作品→能力→方法→联系→实验室→全部作品→HEADER(关闭菜单)→作品…`，无一次逃出弹层；背景 `main`/`footer` 的 `inert` 均为 true；Escape 关闭后焦点标签回到「打开菜单」、`inert` 复原。`BriefForm` 与 `ParticleShowcase` 的键盘交互按 WAI-ARIA 模式验证，tabpanel 的 `aria-labelledby` 与当前 tab 同步。
- 页头对比度：修复前真实渲染像素 / WCAG 对比度为 `中文 1.04:1`、`EN 1.14:1`、`菜单 1.04:1`；同页头 VC 字标为 10.25:1、导航为 8–10:1、CTA 为 18:1。修复后浅色段落为 `中文 17.8:1` / `EN 5.84:1`，深色段落为 `中文 17.12:1` / `EN 7.07:1`，手机与桌面、`/`、`/work`、`/lab` 全通过。`scripts/qa/verify-header-contrast.mjs` 在 822910e 基线上失败、当前构建上通过。
- CI / 依赖 / 素材：`npx --yes yaml-lint .github/workflows/ci.yml` 报 `✔ YAML Lint successful.`；所有新增 `.mjs` 通过 `node --check`，`npx eslint scripts/check-seo.mjs` 与 `npx tsc --noEmit` 通过。`npm install --package-lock-only --no-audit --no-fund` 后，lockfile 结构化比对确认只有 `@types/three` 及其传递依赖被标记 `dev: true`，其余依赖版本 / resolved / integrity 全未变化。`public/guanchao-live/` 内容哈希与 `SOURCE.json` 记录一致。
- 性能：822910e 隔离 worktree 构建首页 First Load JS **856,395 B raw / 273,355 B gzip / 237,038 B Brotli**，`/work/[slug]` 805,155 B；其中 **736,055 B raw / 233,541 B gzip** 是全站共用底座（连 `/_not-found` 相同）。React/Next 两个运行时 chunk 为 394,899 B（约 53.7%）；Motion 128,467 + GSAP/ScrollTrigger 113,860 + Lenis 40,460 = 282,787 B（约 38.4%）；其余约 58,369 B。`content/projects.ts` 确实进了首页 client chunk：`1lo-eeg0l6nns.js` 75,121 B，三条独特长字符串命中，四个项目可去除数据合计约 **26,352 B raw**。
- 移动端性能：Playwright + 微信 UA + 390×844 + `hardwareConcurrency=4` 且不暴露 `deviceMemory` 时，首屏 12 个 JS 文件里**没有 three.js**；滚动到青花区块才懒加载独立的 `2ei2uus4t3tw8.js`（696,018 B）。四个旗舰的实时媒体**同时最多只有 1 个在跑**（平板 1024 出现过一次 2）；全页滚动 long task 7 次 / 合计 1,017 ms / 最长 331 ms。

**遗留** — 性能决定明确不做那次 client boundary 拆分，移动端也不改重内容策略；这不是“没有发现性能成本”，而是测了之后认为风险收益不匹配。`SOURCE_REPO`、`SOURCE_COMMIT`、`CAPTURE_DATE` 在 `_build/guanchao-src/` 中查不到，`SOURCE.json` 保持 TODO。`capture-qinghua-steps.mjs` 依赖特定站点的教程文案、按钮和坐标，未安全通用化；仓库外也未发现可安全通用化的视频构建脚本，因此没有提交一个无法验证的替代命令。

### 2026-09-13 · 快速滚动时文字「一半加载出来」——甩动期间关掉揭示过渡

**为什么** — 用户报告：「快速滚动时字是一半加载出来的」。揭示动画是 0.9s 透明度 / 1.044s 位移 / 1.1s 遮罩，加 0~180ms 错峰；实测单个元素从进入视口到完全不透明要 **983ms**。也就是说，任何比"慢慢看"快的滚动，看到的都是一片正在淡入的字——那不是动效，那是没加载完。

**做了什么**

- `SmoothScrollProvider` 监听 Lenis 的 `scroll`，`|velocity| ≥ 55`（**px/帧**，不是每秒）时给 `<html>` 挂 `data-reveal-instant="true"`，滚动停下后摘掉；`globals.css` 在标记存在时对该元素及其遮罩子元素 `transition: none`。**只去掉过渡，不去掉揭示判定**——IntersectionObserver 照旧决定"要不要揭示"，所以折叠线以下的内容不会提前露出来。
- 阈值是量出来的，不是拍的。三次实测（中位/90分位/最大 px/帧）：单次滚轮刻度 2/7/12，4 档 @120ms 的连续滚动 8/18/30，猛甩 68–125 / 538–633 / 2338–3687。**55 落在 30 与 68 之间的空档里**。
- 被否掉的选项：**只调短时长**（比如 0.9s→0.45s）不解决问题，快速滚动下 0.45s 一样是半透明的，只是半透明的窗口短一点；**整站去掉揭示动画**则是把用户没抱怨的东西一起砍了。

**验证**

- 新增 `scripts/qa/verify-reveal-instant.mjs`（8 项断言）：静止时 `rise`/`fade` 过渡为 `0.9s, 1.044s`、`masked` 子元素为 `1.05s`；猛甩期间两者**塌成 `0s`** 且标记出现；停下后标记摘掉、过渡恢复；阅读速度（110px/280ms）全程标记**不出现**，且能采到 **14 个真实的动画中间态**（`opacity 0.53`、`clip 41%`…）——证明动画没被误伤。
- 探针踩过一个假象，值得记下：`document.querySelector('[data-reveal]')` 取到的第一个往往是 `masked` 变体，而 `masked` 的过渡声明在**子元素**上（动的是 `clip-path`），所以静止时量到 `0s` 本来就对。只量第一个元素会得出"过渡被永久抹平"的错误结论。
- Luna 独立实测：猛甩期间视口内 **`0 < opacity < 0.9` 的元素数为 0**，慢速对照是 3–4 个。

**遗留** — 症状本身没有拿到"修复前"的逐帧对照：自动化甩动几次都没抓到明显的半透明帧（最低 0.9968），所以「用户看到半透明」这一条依据是用户报告加 983ms 这个实测时长，不是截到的帧。修复后**行为**则是有实测的（见上）。阈值 55 与 400ms 兜底都是在这台机器 + Chromium 上标定的；换环境若发现猛甩不再触发，先重测速度分布再调。

### 2026-09-13 · 标题断行把英文单词劈成两半，且首页窄栏里一行只放得下三个字

**为什么** — 用户指着首页观潮区块说「这里的排版怪怪的」。两处实测缺陷：

1. **断行按字符数对半分，会把拉丁单词切断。** 观潮案例页的标题原本渲染成「观潮 Dail」/「y Brief」——`splitHeadline` 拿 `Array.from(value)` 取中点，第 7 个字符正好落在 "Daily" 中间。
2. **首页的窄栏装不下那么大的字。** 旗舰区块的版式是**按顺序硬分配**的（`getLayout`：0=hero、1=split-left、2=split-right、3=wide）。观潮排第 3 个，拿到 `md:col-span-4` —— 1440px 下实测列宽只有 395px，字号却还是跟案例页一样的 135px。135px 的汉字在 395px 里一行放 2.9 个，于是标题变成「观潮 / Daily / Brief」三行堆叠（1351px 高），左栏把整块撑得又瘦又长，右侧媒体下方留一大片空白。

**做了什么**

- 抽出 `lib/headline.ts` 的 `splitHeadline()`，替换掉 **三份各写各的**实现：`CaseHero`（对着劈字符）、`CaseSectionBlock`（同一份复制的）、`FeaturedProjectBlock` 里的 `splitTitle`——后者是硬编码 `title.split(/(?=AI|Daily|VC-AI|·)/)`，只对当前这四个标题有效，加一个项目就会失效。新实现的三条规则：① 拉丁单词**永不切断**；② **空格是作者给的断点**，优先在空格处断（所以「李花花 · VC-AI-PET」在名字后断，而不是断成「李花」/「花 · VC-AI-PET」——这是中间版本的回归，被自测抓到）；③ 按**视觉宽度**而非字符数配平（汉字 1、拉丁字母 0.6、标点 0.4，0.6/0.4 是按实际渲染量出来的，估 0.5 会让「· VC-AI-PET」占到列宽 98.8%）。
- 新增 `.type-column-fit`：字号按**那一行本身有多宽**算（组件把最长行的宽度以 `--headline-weight` 传给 CSS），而不是按列宽。古格的「智能导览系统」6 个字在 739px 栏里原本还要折成两行，现在正好一行。
- 被否掉的选项：**不动版式、只把字调小**（`9.4vw` → 更小的比例）会连案例页一起缩小，而案例页 864px 栏里的 135px 标题是对的；**改 `getLayout` 的分配**则是在为内容修版式，加第五个项目又会重来。

**验证**

- `node scripts/qa/verify-headline.mjs` —— 案例页断言「切口没落在拉丁单词内部」（对着 h1 里隐藏槽位的完整原文验，不是猜）、「无丢字」、「无标点起行」、「每个预切分的行只出一视觉行」；首页 1024/1280/1440/1728 断言几何。`--self-test` 把修复前的坏输出 `["观潮 Dail","y Brief"]` 喂进同一检查器，必须被判失败——这条负对照是探针有牙的证据。
- 实测断行结果：观潮 `["观潮 Daily","Brief"]`、古格 `["古格王朝 AI","智能导览系统"]`、李花花 `["李花花","· VC-AI-PET"]`、青花造境单行（4 个汉字不到断行阈值）。首页观潮区块 1351px → 1073px，四档视口下**没有一行折行**。
- 截图对照 `_qa-output/headline-before/` 与 `_qa-output/headline-after/`。

**遗留** — `.type-column-fit` 的下限用 `max(9.4vw, min(2.9rem, --fit))` 特意保住 `.type-xl` 原有的手机字号：视口小于约 494px 时 `9.4vw` 会掉到 `2.9rem` 以下，不这样写手机上标题会比现在小约五分之一。这条分支没有实机截图验证，只有算术推导。

### 2026-09-13 · 填上正式联系邮箱，并修掉三处「邮箱仍是 null」的过时文档

**为什么** — 用户给了 `lxy13738164923@outlook.com`。数据本身只有一行，但仓库里有三处文档写着「邮箱是 `null`、页面显示待补充」，填完之后它们**全部变成错的**——而错文档比没文档更糟（这个项目已经因为同一类问题返工过一次）。

**做了什么**

- `content/site.ts` 填 `contact.channels[1].value`。**`href` 保持 `null`**：`ChannelValue` 的逻辑是 `isFilled(channel.href) ? channel.href : \`mailto:${channel.value}\``，只填 `value` 就够，填两个字段等于把同一个地址写两遍、将来必然只改一处。
- 同步 `README.md`（章节说明 + 上线前清单）与 `docs/ASSETS.md` §5，把「待补充」改成事实，并把**真正还缺的那一个**（`formEndpoint`，所以表单按钮是「复制需求」而不是「发送需求」）单独留了一行。

**验证** — 生产构建（`npm run build`）后实测 1440px 与 390px：邮箱**可见、未截断、未溢出**，`<a href>` 为 `mailto:lxy13738164923@outlook.com`，微信 ID 与二维码不受影响，「该渠道待补充」占位已从页面消失（两个渠道都有值了）。截图 `_qa-output/qa/contact-email-{1440,390}.png`。

**顺带澄清一个假象** — 邮箱后面那个像下划线的短横是 `ArrowLink` 的 `→` 箭头（`aria-hidden="true"`），是「一眼看出可点」的显式提示，**不是**多出来的字符。11px 下放大四倍很容易被读成缺陷，差点当成渲染 bug 去修。

### 2026-09-13 · 快速滚动把首页粒子区块永久钉在静态图上

**为什么** — 用户报「现在优化预加载，因为我发现快速滚动会有 bug」。派了两个独立取证员（首页一个、案例页一个）在**全新浏览器上下文**里复现，结论是同一个根因：

**快速甩动时，一帧的滚动位移会超过整个区块的高度（实测单帧最大 3007~3630px，区块高 1083px）。** `IntersectionObserver` 每帧只采样一次相交状态，于是区块从"视口下方"直接跳到"视口上方"，**没有任何一帧是相交的**，回调一次都不触发。后果是 `ParticleVessel.boot()` 从未被调用：`canvas` 停在默认的 **300×150**，`three` 与点云 `.bin` 一个字节都没请求，访客只看到一个不动的静态封面。慢滚对照组（E 组）全部正常——所以它只在"快"的时候出现。

即使 `boot()` 已经开始，原来的代码在 `await import('three')` 和 `await loadPointCloud(...)` 之后各有一道 `!visibleRef.current` 判断：下载途中滚出视口就**整个放弃且不重试**（观察器只在状态翻转时回调，区块已经滚过去就不会再触发）。两头都堵死了。

**做了什么**

1. **新增 `lib/motion/nearViewport.ts`** — "元素是否到达过视口"的 latch，三路取其一：IntersectionObserver + 被动 `scroll`/`resize` 监听（rAF 节流）做 `getBoundingClientRect()` 几何判定 + 挂载时立即判定一次。**几何判定是修掉竞态的关键**，它不依赖观察器的采样时机。命中即永久 true 并卸载监听。`ProjectLiveMedia` 与 `ParticleVessel` 共用它。
2. **`ParticleVessel.tsx`** — 加载门槛从"此刻可见"改成"曾到达过"（`committed`）；**渲染启停仍由实时可见性控制**（离开视口就停止绘制，这条没动）。另外把 `live` 的含义改对：原先是 `start()` 之后立刻置位，而 `start()` 在不可见时根本不调度帧，会出现"自称已 live、实际一帧没画"，兜底图淡出后露出空 canvas——现在改成**渲染循环真的画出第一帧之后**才置位。`drewRef` 在 config 重建（案例页切工序）时复位。
3. **`ProjectLiveMedia.tsx`** — 封面只在这一层**真的画出东西之后**才淡出。原先 `near` 一变真封面就开始 700ms 淡出，而粒子和 24MB 的 iframe 要几秒才上屏，快速滚到时正好看到那个空窗。子组件新增可选 `onLive` 回调（`VcVideo` 用 `onPlaying`、`EmbeddedProduct` 用 iframe `onLoad`）。封面永不淡出是可接受的——它同时是加载态与失败态，**没有加"超时强制淡出"**，那等于把空盒子重新引入。
4. **预加载** — 粒子区块进入 400px 范围且设备达标时，在浏览器空闲时预热 `three` 模块。**明确不预热点云 `.bin`**：那是每个模型几百 KB 到 2MB 的真数据，不在"还没确定访客要看"的时候下载。

**验证**

```bash
node scripts/qa/verify-fastscroll.mjs   # 需要站点在跑
```

新增的 `verify-fastscroll.mjs` 用**全新上下文**（冷模块缓存、冷 HTTP 缓存）验两件方向相反的事：

- 案例页打开后**完全不滚动**、等 5s：点云 0 请求、`canvas` 仍是 300×150 —— 懒加载没被这次修复破坏；
- 首页冷启动后连续 45 次真实滚轮猛甩（`mouse.wheel(0,2500)`，间隔 15ms）：点云被请求、`canvas` 初始化成 **1083×1083**。

**并且做了负向对照**，否则无法确认这个测试真能抓到 bug：把 4 个源文件 `git checkout --` 回到修复前 → `npm run build` → 同一脚本**失败**（点云 0 次、canvas 300×150，退出码 1）；装回修复再构建 → **全过**（退出码 0）。懒加载断言在两次构建里都通过——说明这个 bug 是"懒过头"，不是"不够懒"。

**遗留 / 顺带排除的两个假象** — 取证阶段还报过「跳转后仍有 10 个揭示元素不可见」和「4 张图片未加载」。逐条实测后**都不是缺陷**：那些元素全在当前视口之外（`top` 分别是 1599~6748 和 **-13806**），属于懒揭示与 `loading="lazy"` 的正常休眠。正因如此，`verify-fastscroll.mjs` 的第三组断言**只对视口内的元素**下判断——第一版脚本把视口外的也算进去，就会把一个正确行为报成缺陷。

`three` 模块预热会在访客接近粒子区块时提前下载，若访客随即滚走则这次下载是浪费的（约几百 KB，且仅限 `tier === 'high'` 的设备）。这是"预加载"与"不浪费流量"之间的取舍，选择偏向让快速滚动的访客看到活的东西。

### 2026-09-13 · 可维护性收尾：验收脚本进仓库、README 对齐现状

**为什么** — 用户要求「注意这个网站的开发可持续性，加入开发日志，加强 git 管理」，随后明确「先暂停新的开发，集中精力完成可维护性后停止」。这一条是那次收尾。

触发点是三处**文档与代码已经脱节**，而脱节的文档比没有文档更糟：

1. 验收脚本一直躺在仓库外的 `_build/`（gitignore 掉的工作区）。clone 下来的人**根本不知道它们存在**，更不会跑。而它们是这个项目唯一成体系的回归手段。
2. `README.md` 的「上线前必做」整节还在说"微信号是 `null`、页面显示 CONTACT DETAILS PENDING"——**微信早就真实了**（`Vc1242856346` + 二维码 + 一键复制）。照这一节做事的人会去填一个已经填好的字段。
3. `README.md` 的回归脚本表还写着 `_build/shoot.mjs` 等 5 个路径，其中 3 个已在瘦身时判定为不再维护。

**做了什么**

- **验收脚本进仓库并瘦身**：先把仓库外那些散落的脚本批量搬进来（23 个），再按用户要求「不需要，或者废弃了的就不要在项目里面堆放了」裁到 **10 个**——只留"还能跑、且有判据"的，一次性排查脚本全部删除。落点 `scripts/qa/`（带 `README.md`、独立 `package.json` + `package-lock.json`，不参与应用构建，`app/` 与 `components/` 一律不引用）。产物统一写到仓库根 `_qa-output/`（已 gitignore）。
- **所有脚本改走 `BASE` 环境变量**。之前 7 个把 `http://127.0.0.1:3000` 写死在代码里——这正是本项目已经踩过的坑：服务换端口后脚本集体报 FAIL，而失败样本里是浏览器自己的 `refused to connect`，差点被误判成"服务被回收"。`shoot.mjs` 额外保留第一个命令行参数。
- **所有脚本的输出路径改成从脚本自身位置推算**（`fileURLToPath(new URL('../../', import.meta.url))` → `ROOT`）。之前 7 个把 `/home/vitamin_c/Desktop/个人网站/vc-site/...` 这个**本机绝对路径**写死，换台机器 clone 下来，产物要么写不进去、要么写回原作者那台机器。和 URL 写死是同一类腐化，所以一起修了。
- **`layout-audit.mjs` 的溢出检查加豁免**：跳过"某个祖先能横向滚动"的元素。首页图像卷轴（`.bleed-x` + `snap-x`）本来就比视口宽，是**设计意图**（实测那张 `figure` 宽 427px 在一个 `scrollWidth=1485` 的横滚容器里，页面级 `scrollWidth == clientWidth == 390`，没有任何东西被裁掉）。旧启发式于是**永久误报 4 条**，把真溢出埋在噪音里。
- **`probe-home-blocks.mjs` 从"打印表格"改成真断言**（9 条，失败退出码非 0、并落一张全页失败截图）。之前 `scripts/qa/README.md` 给它写了判据，脚本里却一条断言都没有——「表里写了判据、脚本里却没有断言」等于这条探测器不存在。
- **它里面"睡固定 9 秒再测量"改成"等元素真的出现"**。起因是一次连跑 10 个脚本时它报了 `7/9`，但**单独跑、以及事后重跑同样的连跑，都稳定 9/9**，原因没能复现。唯一能确定的时序假设就是那个固定 sleep：连跑时多个 Chromium 抢 CPU，懒挂载的 canvas / iframe 可能还没上屏。既然"等条件"严格优于"等时长"，就换掉了——**但要说清楚：那次 7/9 的真实原因至今未知，这次改动只是移除了一个可疑的时序假设，不等于已经确认修好。**（失败的 1440×26477 全页截图也帮不上忙：这个高度本身就可能超出 Chromium 的截图上限而出现空白带，截图里的"空白区"不能当作页面缺陷的证据。）
- **`README.md` 对齐现状**：重写「上线前必做」（微信已真实、只剩邮箱/表单端点/域名/部署）、脚本表改指 `scripts/qa/`、补上 `proxy.ts` 与 `public/guanchao-live/` 的目录说明、新增「章节可以挂实况」一节（`particle > embed > video` 优先级与降级行为）、把 `next build` 与 `next start` 不能并行的警告从记忆搬进仓库、补「验收脚本的输出是假设不是判决」三条教训。顶部加了指向本文件的入口。
- **`.gitattributes` 给 `CHANGELOG.md` 加 `merge=union`**：日志是"往顶部追加"的，两个分支各加一条是最常见的情况，不该产生冲突标记。

**验证**

- 10 个脚本逐个跑通（`BASE=http://127.0.0.1:3000` 显式传入，验证环境变量真的生效），退出码全 0。改动前 `layout-audit.mjs` 在 390px 首页恒报 `溢出×4`，改动后全路由 OK。
- **`BASE` 做了反向测试**：指向一个没在监听的端口（`BASE=http://127.0.0.1:3999`）时 `diag-load.mjs` 与 `probe-home-blocks.mjs` **如期失败**。只验"默认值下能过"证明不了它读了环境变量。
- **豁免做了反向测试**（这一步不能省）：往页面注入一个 900px 宽、无横滚祖先的 `div`，新谓词仍然抓得到；同时确认卷轴里的 `figure` 被豁免、横滚容器的子元素被豁免。否则"加豁免"就等于"把探测器关掉"。
- **输出路径验证**：删掉 `_qa-output/diag-load.png` 后重跑，截图在正确位置重新生成——这一步确认中文目录名被 `fileURLToPath` 正确解码，没有变成 `%E4%B8%AA...` 这类百分号编码的乱码路径。
- `probe-home-blocks.mjs` 9/9。附带确认古格视频**滚回视口后 `paused:false`**（页尾读到 `paused:true` 是"离开视口即暂停"的设计行为，不是自动播放坏了——脚本里已写明这一点，免得下一个人误判）。
- **最终复验**：10 个脚本按 `diag-load → shoot → layout-audit → narrow-type → probe-home-blocks → check-underline → verify-guge-video → verify-particle → verify-snapshot → verify-decode` 顺序连跑一遍，退出码全 0，`probe-home-blocks` 9/9。

**遗留**

- 素材管线脚本（`build-images.mjs` / `build-qr.mjs` / `capture-*.mjs`）与原始素材仍在仓库外的 `_handoff/` 与 `_build/`，不入库。仓库提交的是**产物**：clone 下来能构建、能部署，但**不能从零重跑素材管线**。这是有意的取舍（原始素材是几百 MB，不该进 git），已在 `README.md`「素材」一节写明。
- `verify-decode.mjs` 是纯 Node 脚本（不需要站点在跑），其余 9 个都需要先 `next start`。
- 待用户提供：联系邮箱、需求表单端点、正式域名；部署（腾讯云 EdgeOne Pages + ICP 备案）未做。

### 2026-09-13 · 主页直接运行作品（实况槽位）+ 古格视频换成真片

**为什么** — 两条用户要求：
> 「其实我更希望这些作品在主页就渲染出来而不是点进去才有」

以及，在发现古格板块播放的是一个**老居民楼 Blender 渲染**之后：
> 「这里的视频放错了，这个是blender渲染项目」

第二条同时暴露了一个内容错误：`0001-0120.mp4`（曾以 `guge-loop` 之名发布）实际内容是 Blender 老居民楼楼梯间，被误归到古格素材里。案例页那句"项目演示：可运行的交互原型实录"因此是一句**不实描述**。用户随后提供了真正的项目片 `梦回古格.mp4`（3838×2160 / 5 分钟 / 464MB / 带音轨）。

**做了什么**

1. **新增 `components/work/ProjectLiveMedia.tsx`** —— 主页每个旗舰板块按项目实际拥有的资产，运行真正的东西：青花=实时粒子、观潮=内嵌真实应用、古格=实拍循环。没有可交互资产的项目（李花花目前只有截图）保持原来的封面图，不做假装。
   - 取景**按类型而非按版式**：粒子是按方形投影构建的（容器是 1:1），观潮是桌面密度界面，古格是 16:9 实拍。用一个比例硬套三者一定会裁掉"证据"本身，因此三者各用自己的比例。
   - 重活全部有闸门，且复用既有机制而不是新造一套：`IntersectionObserver`（前 400px 预热）之后才 import 粒子运行时 / 挂 iframe src / 拉视频；设备分级低于 `high` 或 reduced-motion 永远不升级，直接停在封面图。封面图是**加载态兼失败态**，不是叠层。
   - 进入案例的入口改为**压在实况画面之上的真链接**，而不是包住它——包住的话，任何一次想操作内嵌产品的点击都会跳走。
2. **古格视频换成真片** —— `_build` 外的处理记录写在 `public/works/guge/video/_video-manifest.json`：取片头 0–12s（高原与遗址实拍开场）、1600/1440 宽、去音轨，464MB → 1.8MB。**不做画面裁切**：原片烧进了片头角标与字幕，曾尝试裁掉上下来规避文字，用户明确表示「其实没事不用刻意避字」，因此保留完整画面。
3. **修 `EmbeddedProduct` 的缩放** —— 内嵌应用此前跟着容器宽度走，在主页较窄的媒体列里触发了产品自己的响应式断点，长出移动端底部导航栏，看起来像一张手机截图而不是数据产品。改为**固定 1360px 渲染、整体等比缩放**：不裁剪、不重排、文字按比例缩小。
4. **`VcVideo` 的解禁条件收紧到"真正相关的信号"** —— 原先要求 `tier === 'high'`，而该分级会因为 reduced-motion、save-data、2G、≤2 核、≤2GB 内存中的任意一条降为 `low`。一段静音自托管循环是自动播放里最安全的形态，不该被"2 核笔记本"拦掉；现在只保留 reduced-motion 与 save-data/2G 三个真正反对拉视频的条件，并补上 `autoPlay` 属性（此前只靠 `play()`，属性缺失等于少一层保险）。
5. **观潮副本去掉 `sw.js`** —— 原注册路径是根路径 `/sw.js`，在本站必然 404 装不上；文件本身也无用，删除以免误导。

**验证**

- `npm run check` → 0；`npx next build` → 9/9 路由。
- `node _build/probe-home-blocks.mjs` → 主页 4 个旗舰：`video=1  iframe=1  canvas=1`（古格视频 / 观潮应用 / 青花粒子各一，李花花为封面图）。
- `node _build/verify-guge-video.mjs` → 视频 `paused:false`、`src=mengu-loop.webm`、海报与视频请求均 200/206、控制台 0 错误。
- 首页截图逐块肉眼确认（`_build/home-live/`、`_build/guge-check/`）。

**遗留**

- 李花花在主页没有可交互资产，仍是封面图。若日后有可运行的演示，`liveMediaFor` 里加一条分支即可。
- 观潮内嵌在 Next 预取预热阶段仍会经历一次 308（用户实际点击路径为单次 200）；彻底消除需要改主站 `trailingSlash`，影响面大于收益，暂不做。
- 古格真实视频只用了开头 12 秒。片中还有很有价值的段落（中心像素八叉树压缩、红殿 VR 漫游、团队实拍），将来若要放"技术证明"章节可以直接从 `梦回古格.mp4` 再取，处理方式记在 `_video-manifest.json`。

### 2026-09-13 · 可点击提示返工：悬停态不算提示

**为什么** — 用户第二次提出同一问题：
> 「这部分要点击可以进入但是看起来没有点击的提示，要是可以让点击的提示更加明显就好了，其他地方也是，要让人知道一看就是可以点进去看的」

上一次我判定"已修复"（铺开了 `ArrowLink` 11 处），但标题下划线是 `scaleX(0)`，**只有悬停才长出来**——不悬停等于没有，触屏上更是永远不存在。问题从来不是"有没有做"，而是"静止态看不看得见"。

**做了什么**

- `.link-underline` 改为**静止态常驻**（opacity 0.4），悬停只提升到 1 并下移 1px。悬停不再决定信息是否存在。
- 新增 `MediaLinkBadge`（「进入案例 ↗」），用在 `ProjectCard` 与 `/work` 索引页封面；后来被 `ProjectLiveMedia` 的定位链接取代，但组件仍用于非实况封面。
- **明确不给不可点的东西加可点暗示**：观潮案例页"更广的能力"图像卷轴里的图本来就没有链接（是三维渲染作品，没有可跳转的详情页）。用户一度以为那里"坏了/没修"，实际是它压根不可点——给这种图加箭头就是骗人。先查清能不能点，再决定加不加提示。

**验证**

- `node _build/check-underline.mjs` → 静止态 `::after { opacity: 0.4 }`、悬停态 `opacity: 1` + `translateY(1px)`。
- `node _build/shot-affordance.mjs` / `shot-aff4.mjs` → 桌面与移动端截图肉眼确认角标常驻可见。
- `node _build/layout-audit.mjs` → 无 <11px 小字（角标副标签曾写成 10px，已改 11px）。

### 2026-09-13 · 观潮真实 UI 内嵌案例页

**为什么** — 用户要求：
> 「这部分我希望你直接把观潮网站的ui直接接入进来，而不只是一个截图」
> 「内嵌真实站点，能真点击、能滚动、但是数据不需要每次都是最新。防止观潮哪天坏掉。」

注意用户**没有采纳我"内嵌线上站点"的建议**：他要的是真实可交互，但不依赖那个部署的存活。

**做了什么** — 用用户提供的源码（`D:\周报个人网站`）在 `_build/guanchao-src/` 做工作副本，以 `basePath=/guanchao-live` 重建静态产物放进 `public/guanchao-live/`，案例页第 05 段以 iframe 内嵌。完整配方见 `docs/DEVELOPING.md` → 观潮副本。关键取舍：本地副本而非线上 iframe（用户明确要求），`proxy.ts` 解决目录 URL（否则"只能生产跑、本地验不了"），移除会永久遮挡页面的更新弹窗。

**验证** — `node _build/verify-snapshot.mjs`；用户点击路径单次 200；首屏 0 请求、滚到才加载约 1.8MB。

---

## 2026-09-13 · 43d76eb 联系信息真实化 + 粒子两处缺陷

**为什么** — 用户提供了微信号与二维码，要求把待办清单全部推进（「都修掉」）。

**做了什么** — 联系方式落地（二维码从名片裁掉姓名/地区后生成）；修两个真实缺陷：① fallback 截图垫在透明 canvas 下与阶段名叠字；② `decodePointCloud` 量化逆变换漏掉 `+32767` 重定心项，点云整体平移半个 bbox 导致器物偏心并被旋出画面。详见仓库根 `README.md` 的"素材"与 `docs/ASSETS.md`。

**验证** — `_build/verify-decode.mjs`（解码包围盒逐轴等于 manifest bbox）；`_build/verify-particle.mjs`（fallback opacity 0、粒子绘制、器物完整在画布内、切阶段重绘）。

---

## 2026-09-13 · a1544f0 首个受版本管理的快照

**为什么** — 项目此前**没有 git 仓库**，所有成果零版本快照。

**做了什么** — `git init`（main 分支），补 `.gitattributes`（`public/qinghua/*.bin` 等标记为 binary，防止行尾转换损坏点云），打 tag `v2-initial`。生成媒体产物入库是有意的：EdgeOne 直接从仓库构建，不跑素材管线。

**验证** — `git diff --numstat` 对 `.bin` 输出 `- -`（确认按二进制处理）。
