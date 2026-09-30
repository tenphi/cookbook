---
title: Cookbook
description: 根据仓库或已发布的 npm 包，创建符合产品风格的静态 Astro 文档站点。
template: splash
seo:
  title: Cookbook — 与代码保持同步、契合产品风格的文档
hero:
  title: 与代码放在一起的文档。
  tagline: Cookbook 是一套 Astro 文档工具。将仓库中的 Markdown 或已发布的 npm 包转换为可搜索的静态站点，再根据产品调整颜色、字体排版和组件。
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: 开始使用
      link: /zh/getting-started/
      variant: primary
    - text: 比较工具（英文）
      link: /comparison/
      variant: secondary
sidebar:
  label: 概览
  order: 1
---

## 主要功能

- **直接使用现有文档。** 从仓库读取 Markdown、MDX 和本地资源，或使用已锁定版本和完整性校验值的 npm 包构建站点。[内容来源](../content-sources.md)。
- **生成 API 参考。** 将本地 OpenAPI 规范转换为可搜索的概览和每个操作的独立页面，展示参数、请求体、响应和示例。[OpenAPI 参考](../content-sources.md#openapi-references)。
- **内置搜索。** Pagefind 在本地为页面和标题建立索引，支持键盘快捷键，搜索资源按需加载。[搜索](../site-navigation.md#search)。
- **适应文档增长的导航。** 使用标签页和分组侧边栏组织章节，提供页内目录、上一页和下一页链接，以及移动端抽屉导航。[搜索与导航](../site-navigation.md)。
- **技术写作组件。** 在 MDX 中使用标签页、提示框、卡片、步骤、代码组、带复制功能的代码高亮，以及隔离运行的交互预览。[内容编写组件](../authoring.mdx)。
- **契合产品的主题。** 通过 [Tasty](https://tasty.style) 和 [Glaze](https://glaze.tenphi.me) 配置品牌颜色、语义色板、字体、排版和组件的各个部分。浅色、深色和高对比度模式都使用构建时生成的静态 CSS。[主题与组件](../theme-and-components.md)。
- **语言与版本。** 提供翻译页面和不同版本的文档；切换时，如果存在对应页面，就会直接打开该页面。[语言与版本](../site-navigation.md#contents-languages-and-versions)。
- **发布前检查。** 检测无效链接、缺失资源、重复路由和错误的导航配置，并指出源文件位置。将预渲染 HTML 部署到任意静态托管服务。[质量检查](../quality-checks.md)。
- **便于分享和读取的页面。** 发布规范网址、社交预览、站点地图、可下载的 Markdown，以及供编程智能体使用的 `llms.txt` 索引。[发布元数据](../publishing.md)。

## 从你的仓库开始

在已有 `README.md` 或 `docs/` 目录的项目中运行：

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

Cookbook 会直接读取原位置的文件。你也可以[创建新站点](./getting-started.md)、[为实际发布到 npm 的文件编写文档](./getting-started.md)，或[将 Cookbook 加入现有 Astro 项目](./getting-started.md)。

## 本站就是一个示例

你正在阅读的页面来自 [docs/zh/index.md](https://github.com/tenphi/cookbook/blob/main/docs/zh/index.md)。一个小型 [Astro 应用](https://github.com/tenphi/cookbook/tree/main/apps/reference) 直接从仓库根目录的 `docs/` 构建站点。导航、搜索、代码操作、编辑链接和 Git 更新时间都可用于任何 Cookbook 站点。

## 浏览指南

- [入门](./getting-started.md)：仓库、npm 包和现有 Astro 项目的使用方法。
- [文档工具对比](../comparison.md)：Cookbook 的内容与自定义方式。
- [示例](../examples.md)：仓库、单体仓库、软件包和共享主题配置。
- [搜索与导航](../site-navigation.md)：读者如何找到页面。
- [内容编写](../authoring.mdx)：页面、组件和交互示例。
- [主题与组件](../theme-and-components.md)：品牌、设计标记、字体、内置样式和自定义组件。
- [部署](../deployment.md)：验证与静态托管。

其他文档目前仍以英文提供。另请参阅 [AI 智能体工作流程](../ai-agents.md)、[配置参考](../configuration.md)、[发布选项](../publishing.md)和 [CLI 参考](../cli.md)。
