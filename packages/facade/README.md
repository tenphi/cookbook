# @tenphi/cookbook

Before changing a site's appearance, read the
[customization rules](./docs/customization-rules.md)
([online](https://cookbook.tenphi.me/customization-rules/)). The package ships
the complete [Cookbook documentation](./docs/index.md) and local Tasty and Glaze
references under `docs/upstream/`, including Tasty's
[style rules for AI agents](./docs/upstream/tasty/docs/ai-agents.md).
The guide includes a project instruction snippet and the lint setup.

Install the complete integration with `npx astro add @tenphi/cookbook`:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Optional `docs.config.ts` is discovered by both Astro and the CLI:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ site: { title: "My project" } });
```

Set fonts, typography, and built-in element styles in the same file:

```ts
export default defineDocsConfig({
  theme: {
    fonts: { body: "Inter", heading: "Newsreader" },
    presets: { h1: { fontSize: "3rem" } },
    styles: { Sidebar: { LinkLabel: { whiteSpace: "normal" } } },
  },
});
```

For local fonts, place files in `public/fonts/` and use
`fonts: { body: { family: "My Font", files: [{ src: "/fonts/my-font.woff2" }] } }`.
See [Theme and components](./docs/theme-and-components.md) for all named
sub-elements and the custom component flow.

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

Customize this component's root through `theme.customStyles.ProjectBadge`; it has no
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
