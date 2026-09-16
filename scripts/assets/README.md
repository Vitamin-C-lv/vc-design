# 素材管线

这里保存可以随仓库复用的素材处理代码；私有原图、远程站点的截图临时文件和依赖目录都不入库。

工具依赖只在需要重跑管线时安装：

```bash
npm install --prefix scripts/assets --no-package-lock --no-audit --no-fund
```

完整顺序是：先运行 `build-images.mjs`，再按需运行 `build-qr.mjs` 和 `capture-live.mjs`，最后统一运行 `npm run sync-manifest`。`build-qr.mjs` 与 `capture-live.mjs` 都假定静态图片步骤已经生成 `public/works/_manifest.json` 和 `_asset-report.md`。

## 静态原图

1. 把私有整理素材放在仓库外，并确认目录结构是按 `awards/`、`blender/`、`guge/` 等分类的 PNG/JPEG。
2. 生成响应式图片、AVIF、WebP、JPEG fallback 和 LQIP：

   ```bash
   node scripts/assets/build-images.mjs /path/to/private/organized_assets public/works
   ```

输入目录是第一个参数，也可用 `ASSET_SOURCE_ROOT`；输出目录是第二个参数，也可用 `ASSET_OUTPUT_ROOT`。不要把输入目录复制到仓库。

## 微信二维码

1. 准备仓库外的私有名片原图；默认裁剪坐标适用于本项目现有名片。若版式不同，先用 `QR_CROP=left,top,width,height` 指定正方形二维码区域。
2. 生成二维码衍生图并合并 manifest：

   ```bash
   QR_CROP=144,423,669,669 node scripts/assets/build-qr.mjs /path/to/private/wechat-card.png public/works
   ```

## 公开 Live 站点截图

1. 确认远程站点 URL 和一个只含字母、数字、连字符的素材名；该命令只抓公开页面，不接受私有原图。
2. 安装 Chromium，并设置 `CHROMIUM`（默认 `/usr/bin/chromium`）。
3. 抓取桌面 / 移动端并生成衍生图：

   ```bash
   CHROMIUM=/path/to/chromium node scripts/assets/capture-live.mjs https://example.com qinghua public/works
   ```

截图 PNG 只写入系统临时目录并在命令结束时删除；最终产物写入 `public/works/<name>/`，同时更新 `public/works/_manifest.json` 和 `_asset-report.md`。

完成所有需要的素材步骤后，在仓库根目录执行：

```bash
npm run sync-manifest
```

## 社交分享卡片

分享卡片使用 Playwright 直接渲染本地 HTML 模板，不启动 Next.js 服务，也不引入新依赖。模板会读取 `content/media.json` 中四个旗舰项目的 cover，并从 `public/works/` 加载实际图片：

```bash
node scripts/assets/build-og-cards.mjs
```

浏览器路径可用 `CHROMIUM=/path/to/chromium` 覆盖；输出固定为 `public/og/<slug>.png`，尺寸为 1200 × 630。
标题使用 `text-wrap: balance` 配平，生成时会拒绝单字孤行或中文标题溢出。

## 入库边界

允许入库的是本目录的脚本、说明，以及 `public/works/` 中已经审查过的衍生发布资产。私有原图、PNG 中间截图、任何临时目录和 `node_modules` 不应提交。`capture-qinghua-steps.mjs` 依赖特定站点的教程文案、按钮和坐标，无法安全泛化，因此保留在仓库外，不作为入库脚本。
