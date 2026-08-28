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

## Layout tokens

Override CSS custom properties without replacing templates:

```ts
theme: {
  tokens: {
    "--content-width": "58rem",
    "--sidebar-width": "20rem"
  }
}
```

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
