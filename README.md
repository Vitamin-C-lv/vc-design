# VC / 维C 官网

> **YOU BRING THE BRIEF. WE FIGURE OUT THE REST.**

VC / 维C 独立设计单元的官方网站。

**Production: <https://vc-design.online>**

## 技术栈

- **Next.js 16**（App Router）+ **React 19** + **TypeScript**（strict）
- **Tailwind CSS v4**
- **Lenis** 平滑滚动 + **GSAP / ScrollTrigger**（仅 pin / parallax / scrub）+ **Motion**
- 页面由 App Router 静态预渲染，中英切换通过 `<html data-lang>` + CSS 门控实现，无 JS 时默认中文

## 本地启动

环境要求：**Node.js ≥ 20.9**。

```bash
npm install
npm run dev          # http://localhost:3000
```

其他命令：

```bash
npm run build        # 生产构建
npm start            # 启动生产构建
npm run check        # typecheck + lint
```

## 仓库用途

本仓库是 VC 官网的**长期源码与版本管理源**，用于网站的持续开发、迭代与审查。

- 文案、链接、项目数据集中在 `content/`，组件不硬编码内容
- 部署平台：腾讯云 EdgeOne Makers（本地构建上传，不读取 Git 仓库；`next.config.ts` 中不含任何 Vercel 专有依赖）
- 更完整的工程说明见 [`docs/ENGINEERING.md`](docs/ENGINEERING.md)，改动缘由与验证方式见 [`CHANGELOG.md`](CHANGELOG.md)

部署在仓库根目录执行：

```bash
npm run build
edgeone makers deploy -n vc-site -a overseas
```

## 授权 / Licensing

本仓库公开是为了作品集透明度。除非另有说明，代码以及视觉 / 媒体素材均未经许可不可复用，保留所有权利。

代码是否另行采用 MIT 等许可证由作者另行决定；本仓库不作默认授权。
