# @tenphi/cookbook

Install the complete integration with `npx astro add @tenphi/cookbook`:

```ts
import { defineConfig } from "astro/config";
import cookbook, { defineDocsConfig } from "@tenphi/cookbook";

const docs = defineDocsConfig({
  site: { title: "My project" },
});

export default defineConfig({ integrations: [cookbook({ config: docs })] });
```

Without configuration, a root `README.md` becomes `/` and
`docs/**/*.{md,mdx}` supplies the remaining pages. Cookbook includes Starlight,
generates only static output, and derives its URL base from Astro. Adding other
Astro content collections does not require a Cookbook collection adapter.

Build custom Astro or MDX components with Cookbook's configured styling runtime:

```ts
import { defineComponent } from "@tenphi/cookbook/styling";

export const ProjectBadge = defineComponent("ProjectBadge", {
  as: "span",
  styles: { padding: "1x", color: "#accent-text", preset: "small" },
});
```

Customize this component's root through `theme.styles.ProjectBadge`; it has no
named sub-elements. The `/styling` entry point also exports `tasty`, `useGlobalStyles`,
`resolveComponentStyles`, `mergeStyles`, and the `Styles` type. Cookbook extracts
the CSS automatically. See [Theme and components](https://cookbook.tenphi.me/theme-and-components/)
for a complete custom logo and site title example.

Lint these styles with the plugin and Cookbook validation preset from
`@tenphi/cookbook/eslint-plugin`:

```ts
// tasty.config.ts
export default {
  extends: "@tenphi/cookbook",
  tokens: ["$project-gap"], // Optional additions to the built-in theme names.
};
```

The entry point exports the default Tasty ESLint plugin, `recommended` and `strict`
rule maps, and the upstream configuration types. The preset recognizes Cookbook's
theme names and custom styling helpers, including `defineComponent`. `extends`
merges your additional tokens, states, and presets with these built-ins.
See [Linting custom styles](https://cookbook.tenphi.me/theme-and-components/#linting-custom-styles)
for ESLint and oxlint configuration examples.
