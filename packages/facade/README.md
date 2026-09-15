# @tenphi/cookbook

Install the complete integration with `npx astro add @tenphi/cookbook`:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

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
import { validationConfig } from "@tenphi/cookbook/eslint-plugin";

export default validationConfig;
```

The entry point exports the default Tasty ESLint plugin, `recommended` and `strict`
rule maps, and the upstream configuration types. The preset recognizes Cookbook's
theme names and custom styling helpers, including `defineComponent`.
See [Linting custom styles](https://cookbook.tenphi.me/theme-and-components/#linting-custom-styles)
for ESLint and oxlint configuration examples.
