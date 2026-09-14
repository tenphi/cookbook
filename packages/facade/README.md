# @tenphi/cookbook

Install the complete integration with `npx astro add @tenphi/cookbook`:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Build custom Astro or MDX components with Cookbook's configured styling runtime:

```ts
import { customizeComponent, tasty } from "@tenphi/cookbook/styling";

export const ProjectBadge = customizeComponent(
  "ProjectBadge",
  tasty({
    as: "span",
    styles: { padding: "1x", color: "#accent-text", preset: "small" },
  }),
);
```

Customize this component's root through `theme.styles.ProjectBadge`; it has no
named sub-elements. The `/styling` entry point also exports `useGlobalStyles`,
`resolveComponentStyles`, `mergeStyles`, and the `Styles` type. Cookbook extracts
the CSS automatically. See [Theme and components](https://cookbook.tenphi.me/theme-and-components/)
for a complete custom logo and site title example.
