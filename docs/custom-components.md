---
title: Custom components
description: Style your Astro and MDX components with Tasty and validate their tokens and parts.
---

Use this guide after [theme configuration](./theme-and-components.md) when you
need markup beyond Cookbook's built-in surfaces. For ordinary visual changes,
consult the [component styles](./component-styles.md) reference first.

## Authoring custom components

Import styling tools from `@tenphi/cookbook/styling`. They use the same Tasty
runtime as Cookbook, with its semantic colors, typography presets, units, and
responsive states. The renderer package also exposes them from
`@tenphi/renderer/styling`.

| Export                   | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `defineComponent`        | Create a named Tasty component with its `theme.customStyles[name]` overrides.      |
| `tasty`                  | Use Tasty directly without binding a component to `theme.customStyles`.            |
| `useGlobalStyles`        | Collect a global Tasty style tree while rendering a page.                          |
| `resolveComponentStyles` | Merge `theme.customStyles[name]` into a complete base style tree for global rules. |
| `mergeStyles`            | Compose your own base styles with Tasty's deep-merge semantics.                    |
| `Styles`                 | TypeScript type for a Tasty style object.                                          |

Cookbook supplies the React renderer and extracts these styles into its static
CSS. No additional Tasty dependency, Astro integration, or `client:*` directive
is needed for static components. Set shared tokens, presets, and states in
`docs.config.ts` before rendering. Import the styling entry point in component
modules; configuration files should import `defineDocsConfig()` from
`@tenphi/cookbook/config`.

### A small named component

For a component used by your pages, give its root a name and define its parts
inside the same style object:

```ts
// src/components/StatusBadge.ts
import { defineComponent } from "@tenphi/cookbook/styling";

export const StatusBadge = defineComponent("StatusBadge", {
  as: "span",
  styles: {
    display: "inline-flex",
    padding: "0.5x 1x",
    radius: "$radius",
    fill: "#surface-2",
    color: "#text",
    preset: "small",
    Label: { $: "> strong", preset: "strong" },
  },
});
```

Use `<StatusBadge><strong>Stable</strong></StatusBadge>` in a local MDX page.
A site can change just one part in `docs.config.ts`:

```ts
theme: {
  customStyles: {
    StatusBadge: { Label: { color: "#accent-text" } },
  },
}
```

`theme.customStyles` supplies a partial style object. `defineComponent()`
merges it with the base styles while rendering on the server. Document the
root name and every named part when sharing a custom component.

### A shared site logo

Set `site.logo` once to use your artwork in the header and mobile drawer:

```ts
site: {
  title: "Acme",
  logo: "./assets/acme.svg"
}
```

Paths are local files relative to the resolved project root, just like
`site.favicon`. Cookbook reads the intrinsic dimensions and copies the image to
a content-hashed URL under the deployment base. SVG, PNG, JPEG, WebP, AVIF, and
GIF are supported. Missing or invalid files fail during setup.

```ts
site: {
  title: "Acme",
  logo: {
    light: "./assets/acme-light.svg",
    dark: "./assets/acme-dark.svg",
    alt: "Acme documentation",
    href: "/",
    decorative: true
  },
  favicon: "./assets/acme-icon.svg"
}
```

Use `src` for one image, or both `light` and `dark`. Variants follow the
appearance control and the system preference in Auto mode. They must share an
aspect ratio to prevent layout shifts. Optional `width` and `height` describe
intrinsic dimensions; Tasty controls display size. Customize
`theme.styles.SiteLogo` and its complete anatomy: `Image`, `Light`, and `Dark`.
Wide wordmarks retain their proportions within the header.

The logo is decorative by default because the neighboring title labels the
site. Set `decorative: false` and `alt` when the image itself carries meaningful
text. The header logo link still has a name when the image is decorative.
`href` defaults to the localized documentation home; it accepts a root-relative
documentation route or HTTP(S) destination. The header title and drawer use the
same destination. `site.logo: false` removes the mark from both locations.

A logo does not change the favicon or touch icons. Configure `site.favicon`
separately for square artwork; the default Cookbook icon set remains in place
until changed. `Logo` remains available as the standalone Cookbook book mark.

The built-in mark uses `theme.palette["logo-surface"]` and `theme.palette["logo-mark"]`.
The default homepage hero artwork also uses `logo-surface` for its brand fill.
Both default to Glaze `mode: "fixed"`: the brand background and light book keep
their polarity in dark mode while respecting Glaze's tone boundaries and
high-contrast settings. The mark-to-background contrast floor is 3:1 normally
and 4.5:1 in high contrast. These colors are separate from interactive accents.
For example, to customize the logo background while retaining brand hue:

```ts
theme: {
  brand: { from: "#315efb" },
  palette: {
    "logo-surface": {
      base: "logo-mark",
      tone: 40,
      saturation: 0.8,
      mode: "fixed",
      contrast: { wcag: [3, 4.5] },
    },
    "logo-mark": { tone: 100, saturation: 0, mode: "fixed" },
  },
}
```

Custom image assets keep their authored colors; use `light`/`dark` files when
you want distinct artwork. Header and drawer home links center logos with the
site title regardless of their aspect ratio. Use `theme.styles.SiteLogo` for
image size and `theme.styles.Header.SiteTitle` / `Sidebar.HomeLink`
for typography; they do not need baseline offsets for a different preset.

### Advanced site title markup

To put your own logo and title in one home link, create
`docs/components/site-title.ts`:

```ts
import { defineComponent } from "@tenphi/cookbook/styling";

export const SiteTitleRoot = defineComponent("ProjectSiteTitle", {
  as: "a",
  styles: {
    display: "flex",
    alignItems: "center",
    gap: "1x",
    inlineSize: "min 0",
    color: "#text",
    preset: { "": "h4 / strong", "@mobile": "h5 / strong" },
    textDecoration: "none",
    Logo: {
      $: "> svg",
      display: "block",
      flexShrink: "0",
      inlineSize: { "": "2rem", "@mobile": "1.75rem" },
      blockSize: { "": "2rem", "@mobile": "1.75rem" },
      color: "#accent-text",
    },
    Label: {
      $: "> span",
      inlineSize: "min 0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
});
```

Then create `docs/components/SiteTitle.astro`, using an SVG whose paths use
`currentColor` to follow the semantic accent color:

```astro
---
import ProjectLogo from "../../public/logo.svg";
import { SiteTitleRoot } from "./site-title.js";

const { siteTitle, siteTitleHref } = Astro.locals.cookbookRoute;
---

<SiteTitleRoot href={siteTitleHref}>
  <ProjectLogo aria-hidden="true" focusable="false" />
  <span translate="no">{siteTitle}</span>
</SiteTitleRoot>
```

Register the replacement in `docs.config.ts` and disable the shared mark.
A `SiteTitle` override affects the header; use `site.logo` above for ordinary
branding shared with the drawer. For custom drawer markup, override `Sidebar`.
The custom component supports root styles plus its complete list of named
sub-elements: `Logo` and `Label`.

```ts
site: { logo: false },
components: {
  overrides: {
    SiteTitle: "./docs/components/SiteTitle.astro"
  }
},
theme: {
  customStyles: {
    ProjectSiteTitle: { Logo: { color: "#text" } }
  }
}
```

`defineComponent(name, options)` accepts Tasty factory options and a name for
`theme.customStyles[name]`. It merges the configured partial style object before
creating the component, retaining the other base properties and responsive
states. Tasty options such as `elements`, `variants`, `styleProps`, `modProps`,
and `tokenProps` keep their behavior and inferred types, including generated
subcomponents such as `Component.Label`.
Configured styles become the component's defaults; variants and styles passed
at render time follow Tasty's usual precedence.

Use `defineComponent` when authoring a component that should support
`theme.customStyles`. Use `tasty` directly for ordinary Tasty creation or composition
that does not need a configuration name. To define a named component around
an existing React component that forwards `className`, pass it as `as` in the options. Use `className`
when passing a class to a Tasty component from Astro.

### Global style trees

For markup you do not render through a Tasty component, call
`useGlobalStyles()` during rendering. For example, this Astro component
supports root styles and a `Label` sub-element through `theme.customStyles.ProjectNote`:

```astro
---
import {
  resolveComponentStyles,
  useGlobalStyles,
} from "@tenphi/cookbook/styling";

useGlobalStyles(
  ".project-note",
  resolveComponentStyles("ProjectNote", {
    padding: "2x",
    fill: "#surface-2",
    Label: { $: "> strong", color: "#text", preset: "strong" },
  }),
);
---

<aside class="project-note"><strong>Note</strong><slot /></aside>
```

`defineComponent` and `resolveComponentStyles` read the same `theme.customStyles`
configuration; user configuration contains only the properties to change. Each custom style name must match a call to one of these helpers.

## Linting custom styles

`@tenphi/cookbook/eslint-plugin` re-exports the Tasty ESLint plugin together with
Cookbook's `validationConfig`. The renderer offers the same exports from
`@tenphi/renderer/eslint-plugin`. Keep style definitions in `.ts` or `.tsx`
modules, as in the site title example above, to lint them with either ESLint or
oxlint.

Create `tasty.config.ts` at your project root:

```ts
export default {
  extends: "@tenphi/cookbook",
};
```

Renderer-only consumers can use `extends: "@tenphi/renderer"` instead.
The preset registers both Cookbook styling import paths, its built-in tokens,
units, responsive states, and typography presets. It also describes
`defineComponent`, `resolveComponentStyles`, and `mergeStyles`, so their inline
style objects, variants, and named sub-elements receive the same checks as
`tasty()` calls. Partial overrides passed to `mergeStyles` may omit default state
values and retain the plugin's safeguards against fixes that replace base styles.

### ESLint

Install ESLint and a TypeScript parser:

```sh
pnpm add -D eslint @typescript-eslint/parser
```

Add the plugin to `eslint.config.mjs`:

```js
import parser from "@typescript-eslint/parser";
import tasty from "@tenphi/cookbook/eslint-plugin";

export default [
  {
    ...tasty.configs.recommended,
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser },
  },
];
```

Run `pnpm exec eslint docs/components --max-warnings 0`. Use
`tasty.configs.strict` for additional checks, including custom property names and
runtime style values. The named `recommended` and `strict` exports contain rule
maps for configurations that register the plugin themselves.

### oxlint

Install oxlint:

```sh
pnpm add -D oxlint
```

Create `oxlint.config.mjs` using its JavaScript plugin support:

```js
import { recommended } from "@tenphi/cookbook/eslint-plugin";

export default {
  jsPlugins: [{ name: "tasty", specifier: "@tenphi/cookbook/eslint-plugin" }],
  rules: recommended,
};
```

Run `pnpm exec oxlint --config oxlint.config.mjs docs/components --deny-warnings`.
The `tasty` alias keeps rule names such as `tasty/known-property` consistent with
ESLint. Import `strict` instead of `recommended` to enable the stricter rule map.
Both presets are tested with oxlint 1.83.0; JavaScript plugin support is experimental.

### Custom theme names

Add names introduced by your `docs.config.ts` theme to the validation config.
For example, after defining `theme.tokens["$project-gap"]`, `theme.states["@project-wide"]`,
and `theme.presets["project-title"]`:

```ts
import type { TastyValidationConfig } from "@tenphi/cookbook/eslint-plugin";

export default {
  extends: "@tenphi/cookbook",
  tokens: ["$project-gap"],
  states: ["@project-wide"],
  presets: ["project-title"],
} satisfies TastyValidationConfig;
```

`extends` merges and deduplicates these arrays with the inherited configuration,
so list only your additions. It also inherits the styling helper signatures;
entries you add to `styleFunctions` override inherited signatures by function name.
The exported `validationConfig` object remains available for programmatic use.
The entry point also exports the upstream `StyleFunctionConfig` and
`ResolvedConfig` types for shared lint configurations. Additional imported
helpers can be registered in `styleFunctions`; use `partial: true` for helpers
that merge overrides into existing styles.
