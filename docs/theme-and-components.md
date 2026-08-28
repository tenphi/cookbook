---
title: Theme and components
description: Build an accessible Glaze palette, customize Tasty tokens, and use the supported Astro components.
sidebar:
  order: 5
---

Tasty Docs derives light, dark, and high-contrast values from one Glaze brand
input, then exposes the result through Tasty tokens and component anatomy.

## Brand color

The short form accepts any color value supported by Glaze:

```ts
theme: {
  brand: "#2f5bff";
}
```

Use the object form to set an explicit contrast target:

```ts
theme: {
  brand: {
    from: "oklch(58% 0.22 265)",
    contrast: { apca: [60, 75] }
  }
}
```

The authored color remains exact when it already satisfies the required
contrast against the page surface. Otherwise Glaze moves it only as far as the
floor requires. Dark and high-contrast schemes resolve independently.

Tasty Docs rejects a normal APCA target below 45 unless
`unsafeContrast: true` is present. That escape hatch is intentionally visible
in configuration reviews.

## Semantic palette

`brand` controls accent text, fills, and focus. The optional palette inputs
control the neutral reading surface. The authored surface is preserved in the
light scheme; its dark counterpart is deliberately desaturated so a nearly
white tint cannot turn into vivid dark chrome when its tone is inverted. Glaze
resolves all values independently for light, dark, normal, and high-contrast
modes:

```ts
theme: {
  brand: "#2f5bff",
  palette: {
    surface: "#fffdf8",
    text: "#211f1c",
    textSoft: "#66615a"
  },
  contrastLevel: "auto"
}
```

Components consume semantic colors consistently: `surface`, `surface-2`,
`surface-3`, `text`, `text-soft`, `border`, `border-strong`, `accent-text`,
`accent-surface`, `accent-surface-text`, and `focus`. Tasty components can use
these as `#surface`, `#text`, `#border`, and so on; the Astro shell consumes the
same resolved values.

## Design tokens

Token names follow Tasty conventions: `$name` becomes the CSS custom property
`--name`. Existing `--name` keys are still accepted for compatibility.

```ts
theme: {
  tokens: {
    "$gap": "0.5rem",
    "$radius": "6px",
    "$card-radius": "10px",
    "$border-width": "1px",
    "$outline-width": "2px",
    "$outline-offset": "2px",
    "$control-height": "2.5rem",
    "$content-width": "58rem",
    "$sidebar-width": "20rem"
  }
}
```

`radius` is the control and navigation radius; `card-radius` is the larger
surface radius. Keeping those roles separate makes a sharp control theme or a
soft card theme possible without one-off component overrides.

## Typography presets

The built-in presets are `body`, `heading`, `h1` through `h6`, `small`, and
`code`. Onest is self-hosted and used for body and heading text by default;
JetBrains Mono is self-hosted for code. Presets merge property-by-property, so
changing a font does not require copying its size, weight, or line height:

```ts
theme: {
  presets: {
    body: {
      fontFamily: "Inter, system-ui, sans-serif"
    },
    heading: {
      fontFamily: "Newsreader, Georgia, serif",
      fontWeight: 650
    },
    h1: {
      fontSize: "3rem",
      letterSpacing: "-0.035em"
    },
    code: {
      fontFamily: "Berkeley Mono, ui-monospace, monospace"
    }
  }
}
```

Heading presets reference the `heading` family and weights; body, navigation,
and controls reference `body`. Additional named presets are passed through to
Tasty SSR for use in custom MDX components.

The exported `DEFAULT_THEME_TOKENS` and `DEFAULT_TYPOGRAPHY_PRESETS` constants
are useful when building a theme editor or presenting a reset action.

The default renderer emits static CSS. Appearance controls add only the small
client behavior needed to persist a selected scheme.

## Astro and MDX components

The facade exposes supported components from `tasty-docs/components`:

```mdx
import { Card, Preview, Steps, Tabs } from "tasty-docs/components";

<Card title="Package-first" href="/getting-started/">
  Generate a site from a locked npm artifact.
</Card>
```

- `Card` renders a titled article or link.
- `Steps` provides an ordered steps container.
- `Tabs` provides a labeled grouping container.
- `Preview` isolates HTML and CSS with declarative Shadow DOM, or JavaScript
  in a sandboxed iframe.

Use MDX only for repository content you control. Locked package content remains
Markdown-only unless the consumer explicitly sets `trust: "mdx"` for that
source.

## Static behavior

Documentation content, navigation, headings, code, and images remain readable
without client JavaScript. Search, mobile navigation, copy controls, appearance
persistence, and executable previews can progressively enhance the static
output.
