# VC / 维C 官网

> **YOU BRING THE BRIEF. WE FIGURE OUT THE REST.**

VC / 维C 独立设计单元的官方网站。

**Production: <https://vc-design.online>**

## 技术栈

- **Next.js 16**（App Router）+ **React 19** + **TypeScript**（strict）
- **Tailwind CSS v4**
- **Lenis** 平滑滚动 + **GSAP / ScrollTrigger**（仅 pin / parallax / scrub）+ **Motion**
- 全站服务端渲染，中英切换通过 `<html data-lang>` + CSS 门控实现，无 JS 时默认中文

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
- 部署平台：腾讯云 EdgeOne Pages（`next.config.ts` 中不含任何 Vercel 专有依赖）
- 更完整的工程说明见 [`docs/ENGINEERING.md`](docs/ENGINEERING.md)，改动缘由与验证方式见 [`CHANGELOG.md`](CHANGELOG.md)
