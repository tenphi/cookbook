---
title: Configuration recipes
description: Complete, build-checked configurations for common documentation tasks.
---

These are complete `docs.config.ts` files. Start with a generated Cookbook
project, keep its `astro.config` integration, and replace the documentation
configuration with one recipe. Add the files listed above each example.
[Working examples](./examples.md) covers repository and npm source layouts;
[configuration](./configuration.md) lists the available fields, while the
[theme guide](./theme-and-components.md) explains the customization path.

The repository's `pnpm check:recipes` extracts the marked examples below and in
Working examples verbatim, type-checks them, builds actual consumer sites, and
checks their output. Fixtures supply the documented content and local assets.
Network-dependent Google font coverage runs separately in `check:fonts`.

## Brand, logo, and round header controls

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
    tokens: { "$header-control-radius": "999px", $radius: "8px" },
    styles: { SearchResults: { Input: { radius: "12px" } } },
  },
});
```

The header token also covers the mobile sidebar close control. Copy buttons and
page navigation keep the base radius. Built-in element overrides merge into the
complete defaults. See the [named style anatomy](./component-styles.md).

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

## English and French

Create `docs/index.md`, `docs/guide.md`, `docs/fr/index.md`, and
`docs/fr/guide.md`. Routes are `/`, `/guide`, `/fr`, and `/fr/guide`.

```ts cookbook-verify=locales
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: { title: "Acme docs", url: "https://docs.example.com" },
  content: { sources: [{ glob: "docs/**/*.md", base: "docs" }] },
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français" },
  },
  defaultLocale: "root",
  navigation: ["/", "/guide"],
  translations: { fr: { appearance: "Présentation" } },
});
```

Navigation adapts to real translations. Missing translations use a real fallback
in the language picker; they do not generate phantom routes or alternate links.

## Preview publishing

Set the preview's own URL and Astro `base` if hosted in a subdirectory. Serve
private previews behind host authentication.

```ts cookbook-verify=preview
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Acme preview",
    url: "https://preview.example.com",
    seo: { index: false, copyPage: false },
  },
  tableOfContents: { mobile: true },
});
```

Build, run `cookbook check-build`, deploy that output, then run
`cookbook check-build --url https://preview.example.com/`. See
[deployment](./deployment.md) for production metadata, host headers, and sitemap
checks, and [troubleshooting](./troubleshooting.md) when a check fails.
