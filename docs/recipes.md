---
title: Theme recipes
description: Complete, build-checked configurations for branding, component styles, fonts, and shared themes.
---

These are complete `docs.config.ts` files for common appearance changes. Start
with a generated Cookbook project, keep its `astro.config` integration, and
replace the documentation configuration with one recipe. Add the files listed
above each example. Every recipe is type-checked and built by Cookbook's test
suite.

[Working examples](./examples.md) cover repository, npm, language, and preview
layouts; the [theme guide](./theme-and-components.md) explains the
customization path, and the [configuration reference](./configuration.md) lists
every field.

## Brand, logo, and header control shape

Put your artwork at `public/logo.svg`. Logo files use their intrinsic aspect
ratio; the site title provides its label when the artwork is decorative.

```ts cookbook-verify=branding
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Acme docs",
    logo: { src: "./public/logo.svg", decorative: true },
  },
  theme: {
    brand: { from: "#d97706" },
    tokens: { "$header-control-radius": "8px", $radius: "6px" },
    styles: { SearchResults: { Input: { radius: "12px" } } },
  },
});
```

`$header-control-radius` replaces the default pill-shaped header buttons
(`999px`) and also covers the mobile sidebar close control. `$radius` changes
copy buttons, navigation items, and other content controls (default `8px`).
Built-in element overrides merge into the complete defaults. See the
[logo guide](./theme-and-components.md#logo-and-favicon) and the
[named style anatomy](./component-styles.md).

## Built-in component styles

Supply only the properties you want to change. Cookbook merges these partial
objects into the base style trees before extracting CSS. The example uses the
current named parts of the Appearance panel and search input:

```ts cookbook-verify=component-styles
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Acme docs" },
  theme: {
    brand: { from: "#315efb" },
    styles: {
      ThemeSelect: {
        Trigger: { border: "#border-strong" },
        Panel: { shadow: "0 1rem 3rem #shadow" },
      },
      SearchResults: { Input: { radius: "12px" } },
    },
  },
});
```

Find all supported names in [Component styles](./component-styles.md).

## Local variable font

Place a licensed variable WOFF2 font at `public/fonts/acme.woff2`. This example
uses its normal style; add an italic file when available.

```ts cookbook-verify=local-font
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Acme docs" },
  theme: {
    brand: { from: "#315efb" },
    fonts: {
      body: {
        family: "Acme Sans",
        files: [{ src: "/fonts/acme.woff2", weight: "100 800" }],
      },
    },
    presets: { heading: { fontWeight: 650 } },
  },
});
```

For Google Fonts use `fonts: { body: "Inter", heading: "Newsreader" }` instead.
Cookbook downloads and self-hosts the required weights and italics at build time.
See [fonts](./fonts-and-typography.md#change-font-families) for caching,
explicit ranges, styles, and remote delivery.

## Share configuration and themes

A preset is an ordinary exported `DocsConfig` object:

```ts cookbook-verify=shared-theme
import { defineDocsConfig, mergeDocsConfig } from "@tenphi/cookbook/config";

const company = defineDocsConfig({
  theme: {
    brand: { from: "#315efb" },
    tokens: { $radius: "8px" },
  },
  markdown: { rawHtml: "sanitize" },
});

export default mergeDocsConfig(company, {
  site: { title: "Product docs" },
  theme: { tokens: { "$content-width": "52rem" } },
});
```

Each `theme.brand` or `theme.palette` color replaces the corresponding color in
the preset. Supply the complete Glaze declaration for a color you override.

Objects merge recursively, arrays replace, and inputs are not mutated. Tasty
styles preserve their default values when adding conditional overrides. A preset
can live in a shared workspace package. Component overrides remain partial Tasty
objects and merge into Cookbook's complete base styles inside the renderer.
