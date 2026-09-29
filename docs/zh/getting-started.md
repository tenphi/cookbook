---
title: 入门
description: 创建文档站点、为现有仓库编写文档，或使用已发布的 npm 包。
sidebar:
  order: 2
---

Cookbook 需要 Node.js 22.19 或更高版本。

## 创建第一个站点

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

创建工具会生成 README、Astro 配置和 `docs.config.ts`，然后安装依赖。它还会写入包含编程智能体指令的 `AGENTS.md`。编辑 `README.md` 可更改首页；添加 `docs/guide.md` 可创建 `/guide`。新增或修改的页面会直接出现在开发服务器中，无须重启。

## 为现有仓库编写文档

在仓库根目录运行：

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

生成的 `docs.config.ts` 会指向你的仓库。仓库根目录的 README 成为首页，`docs/**/*.{md,mdx}` 提供其他页面。Cookbook 直接读取这些文件，不会复制或改写。

使用 `--no-install` 可先生成文件而不安装依赖。在非交互模式下，创建工具不会覆盖非空的目标目录。

## 为已发布的 npm 包编写文档

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

创建工具会从实际发布的包中查找文档，并把准确的版本和完整性校验值写入 `cookbook.lock.json`。请提交此文件。被文档化的软件包不会安装，其生命周期脚本也不会运行。如需重新解析指定的标签或版本范围，请运行 `npm run update`。

## 加入现有 Astro 项目

Cookbook 要求 Astro 使用 `output: "static"`。如果你的项目使用 `output: "server"`，请为文档新建一个独立的静态 Astro 项目。

```sh
npx astro add @tenphi/cookbook
```

Astro 配置只需要添加一个集成：

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Cookbook 自带 Astro 渲染器，并会自动查找 `docs.config.ts`。如果没有文档配置，它会按照 README 和 `docs/` 的约定读取内容。

## 配置站点

可以先查看完整的[品牌、标志和字体示例](../recipes.md)。若要深入调整样式或添加组件，请阅读[自定义规则](../customization-rules.md)。这些规则和上游参考资料也包含在安装后的 Cookbook 包中。

在 `astro.config.ts` 旁创建 `docs.config.ts`：

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Example Project",
    description: "Documentation for Example Project",
    repository: "https://github.com/example/project",
  },
  theme: {
    brand: { from: "#2f5bff" },
    fonts: { body: "Inter", heading: "Newsreader" },
  },
});
```

修改 `theme.fonts` 可使用[按名称指定的 Google Fonts 或你自己的字体文件](../fonts-and-typography.md)。使用 `theme.presets` 调整排版细节，使用 `theme.styles` 调整内置元素，并结合 `defineComponent()` 与 `theme.customStyles` 添加新元素。[主题指南](../theme-and-components.md)介绍了起点；[组件样式参考](../component-styles.md)列出了全部可自定义部分。

集成和 CLI 读取同一份配置。支持的文件名依优先顺序为 `docs.config.ts`、`.mts`、`.js` 和 `.mjs`。在集成中显式传入的 `config` 对象优先；`configFile: false` 会关闭自动查找。若配置文件位于其他位置，可使用 `cookbook({ configFile: "./config/manual.ts" })` 和 `cookbook doctor --config ./config/manual.ts`。

## 单体仓库的根目录

位于 `apps/docs/` 的应用可以这样读取仓库内容：

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

`root` 相对于文档配置文件，用来定位内容、本地资源和 `cookbook.lock.json`。从应用目录运行 `npm run doctor`，它会解析出与集成相同的仓库根目录。对于包含多个软件包的站点，每个内容来源也可以单独声明根目录。

## 验证并发布

```sh
npm run validate
npm run preview
```

其他指南目前仍以英文提供，包括[示例](../examples.md)、[内容编写组件](../authoring.mdx)、[AI 智能体工作流程](../ai-agents.md)、[部署](../deployment.md)和[按版本升级指南](../migration.md)。如需可修改的完整配置，可从[示例配置](../recipes.md)开始。如果验证失败，请查看[故障排查](../troubleshooting.md)。
