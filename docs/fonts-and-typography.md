---
title: Fonts and typography
description: Load local or Google fonts and tune semantic Tasty typography presets.
---

Start with the [theme overview](./theme-and-components.md) for brand colors and
design tokens. Cookbook configures font loading at build time and applies
named presets to the rendered site.

## Typography presets

The base [typography presets](https://tasty.style/docs/styles#preset) are
`body`, `heading`, `h1` through `h6`, `navigation`, `small`, and `code`. Onest
Variable is self-hosted and used for body and heading text by default, with a
continuous weight range from `100` to `900`. This supports intermediate preset
weights such as `450` for navigation and `610` for headings. JetBrains Mono
Variable is self-hosted for code with weights from `100` to `800`.

Both default fonts bundle their Latin subset and require no Google Fonts
requests at build time or in the browser. For other character sets, configure
`theme.fonts` with a Google family or local files as described below.

Specialized roles preserve the component sizes while sharing their base typography:

| Preset         | Used for          | Base typography                                     |
| -------------- | ----------------- | --------------------------------------------------- |
| `hero-title`   | Hero heading      | `h1`, with a larger responsive size                 |
| `hero-tagline` | Hero description  | `body`, with a responsive size and 1.55 line height |
| `prose`        | Markdown content  | `body`, at 1.025rem                                 |
| `inline-code`  | Code within prose | `code`, at 0.875em                                  |

Customize these through `theme.presets` as well. Changes to the base font family,
weight, tracking, and other shared fields continue to flow into the derived roles.

### Change font families

Set `theme.fonts` to load fonts and apply them to the matching presets. A Google
Fonts family needs only its name:

```ts
theme: {
  fonts: {
    body: "Inter",
    heading: "Newsreader"
  }
}
```

The short form follows the regular and strong weights in your configured
presets, including heading and custom preset references. It requests normal and
italic styles, prefers a variable range, and falls back to real static weights
when ranges are unavailable. A font without italics produces a build warning;
choose another family or select only its supported styles. To control the
request exactly, list weights or ascending variable ranges and styles. Google
Fonts must support them; see the
[Google Fonts CSS API](https://developers.google.com/fonts/docs/css2) for its
available styles and weight syntax.

```ts
theme: {
  fonts: {
    body: { google: "Inter", weights: ["400 750"], styles: ["normal", "italic"] }
  }
}
```

For a font you own, put its files in `public/fonts/` and give Cookbook their
public paths. Cookbook checks that each file exists during the build and adjusts
its URL for the Astro `base` path. A variable font can cover a weight range;
use separate entries for regular and italic files when needed:

```ts
theme: {
  fonts: {
    body: {
      family: "Acme Sans",
      files: [
        { src: "/fonts/acme-sans.woff2", weight: "100 900" },
        { src: "/fonts/acme-sans-italic.woff2", weight: "100 900", style: "italic" }
      ]
    }
  }
}
```

The `body` role also feeds navigation and small text. `heading` feeds `h1`
through `h6`, while `code` covers code text. Each role has a system fallback.
Cookbook emits font faces through Tasty with `font-display: swap`. Google CSS
and font files are downloaded at build time and cached in
`<Astro cacheDir>/cookbook-fonts`. Files are served from your own site's
`_cookbook/fonts/` path by default, including the deployment base. Visitors make
no Google Fonts requests. Existing local-file definitions keep working.

```ts
theme: {
  fonts: { body: "Inter" },
  fontLoading: {
    google: "self-hosted", // or "remote" to keep Google's font CDN URLs
    cache: "reuse",       // "refresh" to fetch again; "offline" to forbid network
    display: "swap"       // also auto, block, fallback, optional
  }
}
```

The first build requires network access. Preserve the Astro cache between CI
runs; `offline` fails with an actionable message when an entry is missing or
corrupt. Cache entries are content-verified and keyed by the exact request.
`refresh` deliberately updates them. For a fully checked-in font source, copy
licensed files into `public/fonts/` and use the local form. Only `wght` and
`ital` axes are requested; use local variable files and Tasty typography styles
for other axes. Styles and weights that do not exist are rejected for explicit
requests. For static fonts, browsers select their nearest real weight;
intermediate weights require a variable font.

Migration: name-only Google font configuration now downloads the required
weights and italics and serves them locally. This increases the initial build's
font downloads and removes visitors' external font dependency. Set
`fontLoading.google: "remote"` to retain CDN delivery. Existing CSS-variable
weights that cannot be resolved from presets require explicit `weights`.

### Adjust presets

Presets merge property-by-property, so changing size, weight, or line height
does not require copying the rest of the preset. `theme.presets` takes precedence
over `theme.fonts` for an explicitly set `fontFamily`:

```ts
theme: {
  presets: {
    body: {
      boldFontWeight: 680
    },
    heading: {
      fontWeight: 650,
      boldFontWeight: 740
    },
    h1: {
      fontSize: "3rem",
      letterSpacing: "-0.02em"
    },
    code: { fontSize: "0.9rem" }
  }
}
```

For a system or already loaded font, set its CSS family directly with
`theme.presets.<role>.fontFamily`. This does not load a font file. Additional
named presets are available to custom MDX components.

Heading presets reference the `heading` family and weights; body, navigation,
and controls reference `body`. Semantic `strong` and `b` elements use Tasty's
`strong` modifier, so their weight comes from the active preset's
`boldFontWeight` instead of a separate element-specific value. `strong` is a
reserved modifier keyword, not a named preset; the modifier-only form is
equivalent to `inherit / strong`. Body text uses a regular `400` weight and
neutral tracking, while
headings use a medium `610` weight and progressively gentle negative tracking.
The separate `720` heading bold weight keeps emphasized heading text distinct.
Navigation uses a lighter `450` weight with `580` for the current sidebar page,
while smaller group labels establish hierarchy without oversized bold text.
Inactive sidebar links use `sidebar-text`, a slightly softer blend of `text-soft`
and the surface. In high-contrast mode it matches `text-soft`. Set
`theme.palette['sidebar-text']` to adjust that color without changing other
secondary text, or `theme.styles.Sidebar.Control` to customize the control.
See [Search and navigation](./site-navigation.md#sections-and-page-order)
for sidebar group and disclosure behavior. Inline code scales to `0.875em`
of its surrounding text, including smaller table text; code blocks keep the
`code` preset size. Customize inline code through
`theme.styles.MarkdownInlineCode`.

Cookbook applies each semantic typography role through its complete Tasty
`preset`, so configured fields such as `fontStyle` and `textTransform` are not
silently omitted.

The exported `DEFAULT_THEME_TOKENS` and `DEFAULT_TYPOGRAPHY_PRESETS` constants
are useful when building a theme editor or presenting a reset action.
