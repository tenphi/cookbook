---
title: Theme reference
description: Build an accessible Glaze palette, customize Tasty tokens, and use the supported Astro components.
sidebar:
  order: 5
---

Cookbook uses Glaze to derive light, dark, and high-contrast values from one
brand input, then exposes the result through Tasty tokens and component
anatomy.

Start with the [customization rules](./customization-rules.md) for the consumer
contract, local package references, and guidance for coding agents.

Use the [Glaze documentation](https://glaze.tenphi.me) to learn how palette
inputs, color modes, and contrast targets are resolved. These Tasty references
cover the configuration language accepted by `theme.styles`:

- [Style DSL](https://tasty.style/docs/dsl) for state maps, tokens, units,
  conditional selectors, and merge behavior.
- [Style properties](https://tasty.style/docs/styles) for every enhanced CSS
  property and its accepted syntax.
- [Configuration](https://tasty.style/docs/configuration) for shared states,
  tokens, units, recipes, and typography presets.
- [Sub-element styling](https://tasty.style/docs/react-api#sub-element-styling)
  for the component anatomy model used by Cookbook's named style trees.
- [Tasty methodology](https://tasty.style/docs/methodology) for the design-system
  patterns behind roots, sub-elements, and controlled overrides.

For the short brand, logo, and font path, start with the
[configuration recipes](./recipes.md). This reference covers semantic colors,
typography, tokens, every configurable style tree, and custom components. Read
the [customization rules](./customization-rules.md) before adding styles.

## Brand color

The default brand is a calm blue with 68% OKHSL saturation. Set a brand color
with Glaze's `from` declaration:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  theme: { brand: { from: "#2f5bff" } },
});
```

Add a contrast target when the brand appears as text:

```ts
theme: {
  brand: {
    from: "#2f5bff",
    contrast: { apca: [45, 60] }
  }
}
```

The brand supplies the hue and saturation seed. Cookbook derives separate text,
filled-control, and focus roles from it. Small accent text and filled controls
use stronger default APCA floors (75 normally, 90 in high contrast), and diagnostics
also enforce WCAG 4.5:1 / 7:1 on their actual backgrounds. Higher authored brand
targets are retained. Glaze adjusts tones only as far as these floors require;
dark and high-contrast schemes resolve independently.

Cookbook rejects a normal APCA target below 45 unless
`unsafeContrast: true` is present. That escape hatch is intentionally visible
in configuration reviews. Literal color shorthand and structured
`hue`/`saturation`/`tone` input also remain supported for the brand.

## Semantic palette

`brand` controls accent text, fills, and focus. The optional palette roles
control the reading surface, text, and callout colors. Declare color
relationships with Glaze's `tone`, `base`, and `contrast` properties:

```ts
theme: {
  brand: { from: "#2f5bff" },
  palette: {
    surface: { tone: 98, saturation: 0.05 },
    text: {
      base: "surface",
      tone: 0,
      saturation: 0,
      contrast: { wcag: [7, 10] }
    },
    heading: {
      base: "surface",
      tone: [4, 0],
      saturation: 0,
      contrast: { wcag: [7, 10] }
    },
    textSoft: {
      base: "surface",
      tone: [25, 10],
      saturation: 0.05,
      contrast: { wcag: [4.5, 7] }
    }
  },
  contrastLevel: "auto"
}
```

Glaze resolves each declaration for light, dark, normal, and high-contrast
modes. In a tone or contrast pair, the first value applies to normal mode;
the second applies to high contrast. Use absolute tones for reading text:
`text` starts at tone 0 and `heading` at tone 4, giving headings only a slight
reduction in contrast. Glaze applies its tone boundaries in normal mode, so
body text is not pure black, then inverts the tones for dark mode. High-contrast
mode uses the full range. `textSoft` is reserved for secondary text.
`heading` follows an explicitly configured `text` declaration unless it has
its own declaration, preserving existing custom palettes.
Contrast requirements are minimum safeguards: Glaze preserves the authored
tone when it already meets the floor. A small relative tone step from the
surface would instead leave the solver to produce text at that minimum.

Palette declarations inherit the brand hue and saturation:
`saturation` is a 0–1 factor of that seed, and `tone` is 0–100. They can set
an absolute tone or a tone relative to `base`. Use `from` on a palette role
when it needs its own color seed; otherwise relative declarations keep its
relationship to the brand and surrounding surface as the scheme or contrast
changes. `info`, `success`, `warning`, and `danger` also accept Glaze
declarations and expose border, `-text`, and `-surface` semantic tokens.
Cookbook keeps literal surface seeds desaturated in the dark scheme so a nearly
white tint does not become vivid dark chrome when its tone is inverted.

Components consume semantic colors consistently: `surface`, `header`, `surface-2`,
`surface-3`, `text`, `heading`, `text-soft`, `sidebar-text`, `border`, `border-strong`, `accent-text`,
`accent-surface`, `accent-surface-text`, `logo-surface`, `logo-mark`, and `focus`.
Tasty components can use these as `#surface`, `#text`, `#border`, and so on; the Astro shell consumes the
same resolved values. Glaze also generates hover and pressed states, subtle
accent fills, overlays, shadows, and the orange, green, blue, purple, and red
roles used by Cookbook content components. No browser color mixes or
upstream fallback palette values participate in the rendered theme. Surface
elevation uses Glaze's contrast-uniform tone axis: `surface-2` advances two tone
steps and `surface-3` advances four from the base surface, with proportionally
wider steps in high-contrast mode. Their saturation also steps down to 75% and
65% of the authored surface seed so tinted surfaces remain restrained as they
move farther from the base tone.

Borders stay intentionally quiet: Glaze derives their hue from `brand` but
uses only one quarter of the brand saturation. Normal and high-contrast modes
change border tone, not that restrained saturation relationship.

The Appearance button in the desktop and mobile header opens one panel with
Color scheme and Contrast sections. Color scheme offers Light, Dark, and Auto;
Contrast offers Normal, High, and Auto. Each preference is independent, and
selections are saved in the browser. The panel supports keyboard navigation,
Escape, and outside-click dismissal. The popover fades and scales vertically
from 96% to 100% over 120ms using native entry and exit transitions. Reduced
motion disables the transition. Customize these states with
`theme.styles.ThemeSelect.Panel` and `OpenPanel`; the root `$popover-transition`
token controls the duration. Contrast can follow the system, force the
normal palette, or activate the Glaze high-contrast palette.
System mode responds to `prefers-contrast: more`; an explicit selection is
persisted and takes precedence over that media query.

Interactive controls step up exactly one surface level: a control on `surface`
uses `surface-2`, while a control on `surface-2` uses `surface-3`. Hover and
pressed states build on that elevated surface without changing the border.
Inputs stay on their surrounding surface so their border remains the visual
boundary. Primary buttons and selected navigation use the fixed-mode
`accent-surface` and its paired light `accent-surface-text`. The brand fill
keeps its polarity in dark mode while Glaze adjusts it to preserve label
contrast.

Page navigation keeps Next first in the keyboard order. It appears above
Previous on narrow screens; wider layouts show Previous at the start and Next
at the end.

## Design tokens

Token names follow Tasty's
[token and unit syntax](https://tasty.style/docs/dsl#built-in-units): `$name`
becomes the CSS custom property `--name`. Existing `--name` keys are still
accepted for compatibility.

```ts
theme: {
  tokens: {
    "$gap": "0.5rem",
    "$radius": "8px",
    "$card-radius": "16px",
    "$border-width": "1px",
    "$outline-width": "2px",
    "$outline-offset": "2px",
    "$control-height": "2.5rem",
    "$layout-width": "87.5rem",
    "$content-width": "58rem",
    "$sidebar-width": "17.5rem"
  }
}
```

`layout-width` caps and centers the complete documentation shell, while
`content-width` limits the reading column inside it. `radius` is the control
and navigation radius; `card-radius` is the larger surface radius. Keeping
those roles separate makes a sharp control theme or a soft card theme possible
without one-off component overrides.

## Typography presets

The built-in [typography presets](https://tasty.style/docs/styles#preset) are
`body`, `heading`, `h1` through `h6`, `navigation`, `small`, and `code`. Onest
is self-hosted and used for body and heading text by default; JetBrains Mono is
self-hosted for code.

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
Top-level sidebar groups are always-visible section headings with their direct
links aligned beneath them. Deeper groups expand on click or keyboard activation;
the current group and its ancestors start open. Groups can have a parent-page
`link`; activating an unselected linked header selects that page and keeps its
children open. Activating the selected header toggles its children.
The current group can stay collapsed because its header remains visible. Only
the current page is highlighted; ancestors receive no extra emphasis. Explicit expansion choices are
remembered for the browser tab; automatically revealing the current page does
not overwrite them. Desktop scroll position is restored independently of mobile
menu scrolling, and the current page's ancestors remain open after navigation.
Nested groups use indentation without vertical rails. Customize section headings
with `theme.styles.Sidebar.SectionHeading`, indentation with `NestedItem`, and
disclosure icons with `Caret` and `ExpandedCaret`.
Adjacent sidebar items have a `1bw` gap. Inline code scales to `0.875em` of its
surrounding text, including smaller table text; code blocks keep the `code` preset
size. Customize inline code through `theme.styles.MarkdownInlineCode`.
Cookbook applies each semantic typography role through its complete Tasty
`preset`, so configured fields such as `fontStyle` and `textTransform` are not
silently omitted.

The exported `DEFAULT_THEME_TOKENS` and `DEFAULT_TYPOGRAPHY_PRESETS` constants
are useful when building a theme editor or presenting a reset action.

## Style customization

Cookbook-owned interface elements are direct `tasty()` components. Supported
Cookbook components and generated Markdown surfaces use Tasty style trees.
Customize them by name under `theme.styles`; the configuration is resolved
before CSS generation, so this is not a selector-based CSS override.

> **Direct styles, without a specificity battle.** Cookbook merges your partial
> style object with the component's base styles before Tasty extracts CSS. The
> generated stylesheet reflects that result; changing a supported property
> does not add a competing rule just to beat the original. You can customize
> existing elements without long selectors or `!important`.

Start with the area you want to change, then use the complete sub-element table
below to find its exact anatomy:

| Page area                     | Style names to inspect                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Header, title, and navigation | `HeaderFrame`, `Header`, `SiteLogo`, `HeaderLinks`, `TopNavigation`                  |
| Sidebar and mobile menu       | `Sidebar`, `MobileMenuToggle`, `MobileNavigationTabs`, `MobileMenuFooter`            |
| Article text and headings     | `Markdown`, `MarkdownHeading`, `Heading`, `MainContent`                              |
| Code and diagrams             | `MarkdownCodeBlock`, `MarkdownInlineCode`, `SyntaxHighlight`, `CodeGroup`, `Mermaid` |
| Search                        | `SearchButton`, `Search`, `SearchResults`                                            |
| Table of contents             | `TableOfContents`, `MobileTableOfContents`, `TableOfContentsLayout`                  |
| Cards, notes, and tabs        | `Card`, `Callout`, `MarkdownAlert`, `Tabs`                                           |
| Footer and page controls      | `Footer`, `Pagination`, `PageActions`, `ThemeSelect`                                 |

For example, this changes a typography role and one named element without
copying a component's full style tree:

```ts
theme: {
  presets: { h2: { fontSize: "1.75rem" } },
  styles: {
    Sidebar: {
      LinkLabel: {
        preset: "body",
        whiteSpace: { "": "nowrap", "@mobile": "normal" }
      }
    }
  }
}
```

The `@mobile` value sits with the default value in one Tasty state map. Shared
tokens and presets keep the component aligned with the rest of the site, while
Glaze resolves semantic colors across the configured schemes and contrast
modes.

In a generated site, run `npm run validate` (or the matching package manager's
command) after editing `docs.config.ts`. It checks TypeScript theme properties,
then runs Cookbook's preflight and production output checks. A misspelled
preset or built-in sub-element property fails type checking.

Provide only the root and named
[sub-element](https://tasty.style/docs/dsl#sub-element) properties you want to
override. Cookbook deep-merges that partial style object into the complete
base style object inside the renderer, following Tasty's
[state-map merge semantics](https://tasty.style/docs/dsl#extending-vs-replacing-state-maps):

```ts
theme: {
  styles: {
    ThemeSelect: {
      Trigger: {
        border: "#border-strong"
      },
      Panel: {
        padding: "1x",
        shadow: "0 1rem 3rem #shadow"
      }
    },
    TopNavigation: {
      Link: { preset: "body" },
      CurrentLink: { color: "#accent-text" }
    },
    Sidebar: {
      LinkLabel: { whiteSpace: "normal" }
    },
    TableOfContents: {
      LinkLabel: { whiteSpace: "normal" }
    },
    MobileMenuToggle: {
      Page: { color: "#accent-text" }
    }
  }
}
```

No merge helper or base style object is required in user configuration. Style
customization has one behavior: every supplied object is a partial override and
is merged into the base inside Cookbook.

Every configurable surface accepts styles at the root plus these named Tasty
sub-elements:

| Configuration name      | Named sub-elements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`                  | `Heading2`, `Heading3`, `Paragraph`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Callout`               | `Title`, `Body`, `Tip`, `Caution`, `Danger`                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `CodeGroup`             | `Caption`, `Pre`, `Code`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Tab`                   | `Heading`, `Hidden`, `HiddenHeading`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `MobileTableOfContents` | `Summary`, `List`, `NestedList`, `Item`, `Link`, `HoverLink`, `Focus`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `PageActions`           | `Control`, `Hover`, `Focus`, `Pending`, `Status`                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Footer`                | `Meta`, `LoneMetaItem`, `MetaLink`, `HoverMetaLink`, `Credit`, `CreditLink`, `HoverCreditLink`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `Hero`                  | `Visual`, `DarkVisual`, `LightVisual`, `Stack`, `Copy`, `Title`, `Tagline`, `Actions`, `Action`, `HoverAction`, `PrimaryAction`, `SecondaryAction`, `MinimalAction`, `ActionIcon`                                                                                                                                                                                                                                                                                                                              |
| `LanguageSelect`        | `Label`, `HoverLabel`, `LabelIcon`, `Select`, `Caret`, `Option`                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Logo`                  | `Svg`, `Mark`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `SiteLogo`              | `Image`, `Light`, `Dark`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `MarkdownCodeBlock`     | `Pre`, `CopyButton`, `HoverCopyButton`, `CopiedButton`, `CopyIcon`, `CopiedIcon`, `Code`, `Diff`, `DiffCode`, `DiffLine`, `EmptyDiffLine`, `InsertedLine`, `DeletedLine`                                                                                                                                                                                                                                                                                                                                       |
| `MarkdownHeading`       | `Heading`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6`, `Link`, `RevealedLink`, `HoverLink`, `LinkIcon`, `CopiedLink`, `CopiedLinkIcon`, `CopiedIcon`                                                                                                                                                                                                                                                                                                                               |
| `MarkdownInlineCode`    | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `MarkdownTable`         | `Table`, `Cell`, `LastBodyRowCell`, `HeaderCell`, `Scroll`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `Mermaid`               | `Diagram`, `Text`, `MonoText`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `MobileMenuFooter`      | `Social`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `MobileMenuToggle`      | `Control`, `Icon`, `Section`, `Page`, `HoverControl`, `ActiveControl`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `MobileNavigationTabs`  | `Trigger`, `Marker`, `Caret`, `ExpandedCaret`, `Label`, `List`, `Item`, `Link`, `HoverLink`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                                     |
| `MobileTableOfContents` | `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`, `CurrentIndicator`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `PackageVersion`        | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `VersionSwitcher`       | `Trigger`, `Panel`, `OpenPanel`, `Link`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Preview`               | `Caption`, `Stage`, `Frame`, `Code`, `Summary`, `Pre`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Sidebar`               | `Backdrop`, `OpenBackdrop`, `MobileHeading`, `HomeLink`, `HomeLogo`, `HomeLabel`, `Close`, `HoverClose`, `CloseIcon`, `CurrentLink`, `OpenPane`, `EnteredPane`, `Content`, `Tree`, `List`, `Item`, `TopLevelSpacing`, `GroupSpacing`, `NestedItem`, `SectionHeading`, `Control`, `Summary`, `GroupLabel`, `GroupLabelText`, `Link`, `LinkLabel`, `InteractiveControl`, `SummaryMarker`, `Caret`, `ExpandedCaret`, `LinkedSummary`, `GroupLink`, `LinkedSectionHeading`, `SectionLink`, `Badge`, `TopLevelLink` |
| `SocialIcons`           | `Link`, `HoverLink`, `Icon`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Header`                | `Primary`, `TitleAndSearch`, `Title`, `LogoLink`, `Logo`, `SiteTitle`, `Search`, `SearchElement`, `Tools`, `ToolItem`, `Social`, `MobileTheme`                                                                                                                                                                                                                                                                                                                                                                 |
| `TableOfContentsLayout` | `WithMobile`, `Content`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `SearchButton`          | `PendingShortcut`, `Label`, `Shortcut`, `Hover`, `Active`, `NativeIcon`, `Icon`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Layout`                | `Islands`, `LockedPage`, `Light`, `Auto`                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `HeaderLinks`           | `Desktop`, `DesktopLink`, `Link`, `HoverLink`, `PrimaryLink`, `HoverPrimaryLink`, `Trigger`, `HoverTrigger`, `Panel`, `PanelNavigation`, `PanelLink`, `FirstPanelLink`, `Close`, `HoverClose`                                                                                                                                                                                                                                                                                                                  |
| `Heading`               | `Level1`, `Level2`, `Level3`, `Level4`, `Level5`, `Level6`, `PageTitle`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `HeaderFrame`           | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `PageFrame`             | `MainFrame`, `SidebarFrame`, `Columns`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Steps`                 | `Item`, `Marker`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Tabs`                  | `List`, `Button`, `SelectedButton`, `FocusedButton`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `TableOfContents`       | `Heading`, `List`, `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `ThemeSelect`           | `Trigger`, `HoverTrigger`, `ActiveTrigger`, `Icon`, `Panel`, `OpenPanel`, `Section`, `SectionSpacing`, `SectionLabel`, `Option`, `HoverOption`, `CheckedOption`, `FocusedOption`, `Input`, `OptionIcon`, `Checkmark`, `SelectedCheckmark`                                                                                                                                                                                                                                                                      |
| `TopNavigation`         | `Scrollbar`, `Link`, `HoverLink`, `CurrentLink`, `ActiveIndicator`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `Document`              | `All`, `Body`, `Control`, `Pointer`, `ResponsiveWidth`, `ResponsiveHeight`, `Hidden`, `PrintHidden`, `DesktopBlock`, `DesktopFlex`, `ScreenReaderOnly`, `Strong`, `Link`, `NarrowBlock`, `MobileBlock`, `Code`, `FocusRing`, `CurrentLink`, `SearchOpen`                                                                                                                                                                                                                                                       |
| `MainPane`              | `WithSidebars`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `MainContent`           | `ContentSpacing`, `Container`, `Panel`, `FirstPanel`, `BodyPanel`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `Banner`                | `Link`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `SkipLink`              | `Focus`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Search`                | `Status`, `Dialog`, `CloseIcon`, `OpenDialog`, `Backdrop`, `Frame`, `Container`, `Close`, `HoverClose`, `ActiveClose`                                                                                                                                                                                                                                                                                                                                                                                          |
| `Pagination`            | `Link`, `PreviousLink`, `NextLink`, `NextIcon`, `NextLabel`, `HoverLink`, `ActiveLink`, `Title`, `LoneNextLink`, `Icon`, `PreviousIconRtl`, `NextIconRtl`                                                                                                                                                                                                                                                                                                                                                      |
| `Markdown`              | `Block`, `BlockSpacing`, `HeadingSpacing`, `List`, `CompactItem`, `ListItem`, `DefinitionTerm`, `DefinitionDescription`, `Link`, `HoverLink`, `Quote`, `Rule`, `Details`, `HoverDetails`, `Summary`, `OpenSummary`, `SummaryMarker`, `SummaryIcon`, `OpenSummaryIcon`, `Code`                                                                                                                                                                                                                                  |
| `MermaidSource`         | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `MarkdownAlert`         | `Note`, `Tip`, `Caution`, `Danger`, `Title`, `FirstContent`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `SyntaxHighlight`       | `Scroll`, `Wrap`, `Marker`, `Comment`, `Punctuation`, `Keyword`, `String`, `Token`, `Property`, `Number`, `Function`, `Value`, `Operator`, `Text`, `Bg`, `Inserted`, `Deleted`, `Italic`, `Strong`, `Underline`                                                                                                                                                                                                                                                                                                |
| `SearchResults`         | `Form`, `Input`, `Clear`, `Results`, `Result`, `ResultLink`, `SearchIcon`, `ClearIcon`, `SuppressedClear`, `Message`, `List`, `Title`, `Excerpt`, `NestedResult`, `Match`, `More`, `HoverMore`                                                                                                                                                                                                                                                                                                                 |

`COOKBOOK_COMPONENT_NAMES` publishes the configuration names, and
`COOKBOOK_COMPONENT_SUB_ELEMENTS` publishes the complete sub-element lists for
theme editors and other tooling. The corresponding TypeScript types are
`CookbookComponentName`, `CookbookComponentSubElementName`,
`CookbookComponentStyles`, `ComponentStyleConfig`, and `ComponentStylesConfig`.
Known configuration names provide editor suggestions for their named
sub-elements. `ThemeSelect` styles the combined Appearance panel; replace old
`Select` and `Picker` overrides with `Trigger` and `Panel`. The separate
`ContrastSelect` surface is replaced by the same `ThemeSelect` panel and option
sub-elements. `SocialIcons` styles the shared icon-button links in the header
and mobile menu. On wider layouts, heading permalinks sit to the left of the
heading and are revealed on heading hover or keyboard focus. On mobile they
stay visible and inline so the target is not clipped by the narrower content
gutter. Customize the behavior with `MarkdownHeading.Link`,
`MarkdownHeading.RevealedLink`, and `MarkdownHeading.LinkIcon`. The `#` icon
scales with its heading and stays centered in the link target across heading
levels and screen widths. Activating a heading link copies the full page URL
with that section’s fragment without scrolling or changing the current URL. A
checkmark and screen-reader status confirm the copy; clipboard failures are
announced. Modified clicks and links
without JavaScript retain native anchor behavior. Customize the confirmation
with `MarkdownHeading.CopiedLink`, `MarkdownHeading.CopiedLinkIcon` (the hidden
original icon), and `MarkdownHeading.CopiedIcon` (the checkmark).

Root properties customize each navigation container. For example, overriding
`Sidebar.LinkLabel.whiteSpace` keeps the other base `LinkLabel` properties
because the configured object is merged by default.
By default, the footer credit uses the primary body text color, while its
Cookbook link uses the semantic brand link color.

`components.overrides` remains the structural escape hatch for replacing an
Astro component. Prefer `theme.styles` when the markup and behavior remain the
same.

Register custom names and their partial Tasty objects in `theme.customStyles`.
Built-in names belong in `theme.styles` and reject misspelled sub-elements.
Custom names can also target a matching user-authored `data-tasty-anatomy` attribute.
The name must match the string passed to `defineComponent()` or
`resolveComponentStyles()`, or the `data-tasty-anatomy` value. A production
build warns when a configured custom name has no matching component style
resolver or rendered anatomy attribute.

The default renderer runs Tasty in Astro extract mode. Direct components and
the remaining document/vendor bridge styles are collected into shared static
CSS during the build, while appearance controls add only the small client
behavior needed to persist selected theme and contrast modes. The compact
Cookbook logo is shown beside the project title in the default top bar, links
to the localized home page, and is also the default generated favicon. Use
[`site.favicon`](./configuration.md#site-icons) to generate the complete icon
set from project artwork.

## Diff snippets

Use a `diff` code fence to highlight changed lines. Insertions and deletions
receive subtle theme-aware backgrounds while their `+` and `-` markers remain
visible for readers who do not distinguish the colors.

```diff
-formatOkhsl(v.h, v.s * 100, l * 100);
+formatOkhsl(v.h, v.s, l);

-formatOkhst(v.h, v.s * 100, v.t * 100);
+formatOkhst(v.h, v.s, v.t);
```

## Astro and MDX components

The facade exposes supported components from `@tenphi/cookbook/components`:

```mdx
import { Card, Logo, Preview, Steps, Tabs } from "@tenphi/cookbook/components";

<Card title="Package-first" href="/getting-started/">
  Generate a site from a locked npm artifact.
</Card>
```

- `Card` renders a titled article or link.
- `Logo` renders the Cookbook mark using the active brand color.
- `Steps` provides an ordered steps container.
- `Tabs` and `Tab` provide accessible tabbed panels.
- `Callout` renders a note, tip, caution, or danger block.
- `CodeGroup` renders labeled source strings in tabs.

See [Authoring components](./authoring.mdx) for complete examples and props.

- `Preview` isolates HTML, CSS, and optional JavaScript in a sandboxed iframe.
  The frame never receives same-origin access to the documentation page.

Use MDX only for repository content you control. Locked package content remains
Markdown-only unless the consumer explicitly sets `trust: "mdx"` for that
source.

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
modules; configuration files should use the main `@tenphi/cookbook` entry point.

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
configuration; user configuration contains only the properties to change. They do not require a
`data-tasty-anatomy` attribute. That attribute remains available for older
components using the compatibility bridge described above.

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

## Static behavior

Documentation content, navigation, headings, code, and images remain readable
without client JavaScript. Search, mobile navigation, copy controls, appearance
persistence, and executable previews can progressively enhance the static
output.

### Responsive header and navigation

The header uses `#header`, generated from `theme.palette.header` (or the page
surface) at 70% opacity in all four appearance modes, with a 16px backdrop blur.
Customize the outer bar with `theme.styles.HeaderFrame`, its contents with
`Header`, and header buttons with `HeaderLinks` and `SearchButton`.

Below 50rem, page navigation moves into a header row and opens a left drawer.
`MobileMenuToggle.Section` and `Page` style its breadcrumb labels. The drawer
contains the complete active section, a collapsible `MobileNavigationTabs`
selector, and a close button. The drawer slides in and out over 120ms and
disables motion when the reader prefers reduced motion. Its mobile shadow uses
the Glaze `shadow`-typed `#shadow` token. Customize the movement and shadow through
`theme.styles.Sidebar`, and the underlay through `Sidebar.Backdrop` and
`OpenBackdrop`. `theme.palette.overlay` supplies the underlay declaration, which defaults
to black at 50% opacity. Glaze resolves it in fixed mode with tone remapping
disabled, so it stays black in dark and high-contrast schemes.
Icon buttons retain their plain desktop appearance on mobile. More uses
left-aligned navigation links with a `1bw` gap, without primary button variants.
`HeaderLinks.PanelLink` styles the menu rows; `FirstPanelLink` reserves space
for the close button. The inset divider above the tabs belongs to `TopNavigation`.

The desktop table of contents is hidden below 72rem. Set
`tableOfContents: { mobile: true }` to show an optional compact disclosure there.
On desktop, the current section is marked as the page scrolls and its link stays
visible in a long contents list. Customize its appearance with
`theme.styles.TableOfContents.CurrentLink`.
`MobileTableOfContents` owns its summary and links; `TableOfContentsLayout`
controls placement. `Layout` controls shared
navigation dimensions and the drawer's scroll lock; `PageFrame` styles the
page container and content columns.

### Header control shape

Header buttons and the mobile drawer close button use the independent
`$header-control-radius` token, which defaults to `999px` for pill and circular
shapes. Set it to `8px` for the same corners as the default content controls:

```ts
theme: {
  tokens: { "$header-control-radius": "8px" }
}
```

`$radius` continues to control code-copy buttons, navigation items, and other
content controls. Individual `theme.styles` overrides still take precedence.
The mobile header divider spans the viewport while its content keeps the
configured horizontal padding.

### Add palette colors and reference other roles

Every `theme.palette` entry participates in one Glaze color graph. Use lowercase
names with hyphens; a role named `review-panel` becomes the Tasty token
`#review-panel`. Declaration order does not matter. References can target custom
colors or built-in roles, including header, border, overlay, and syntax colors.

```ts
theme: {
  brand: { from: "#315efb" },
  palette: {
    "review-ink": {
      base: "review-panel",
      tone: [4, 0],
      saturation: 0.05,
      contrast: { wcag: [7, 10] },
    },
    "review-panel": { base: "surface", tone: "-2", saturation: 0.05 },
  },
  styles: {
    Callout: { fill: "#review-panel", color: "#review-ink" },
  },
},
```

Relative and absolute declarations inherit the brand's hue and saturation.
Use saturation factors from `0` (neutral) to `1` (full seed saturation), and
`hue` to choose a different hue. All roles resolve for light, dark, and both
high-contrast modes. Configuration diagnostics and rendering use the same graph.
Missing references and cycles fail with the color name; layered configurations
resolve references after merging.

`textSoft` remains an alias for `text-soft`. Use either spelling, but do not
configure both. The names `current`, `constructor`, and `prototype` are reserved.
Declaring a built-in name intentionally overrides that role; use a project
prefix for additional roles to avoid future naming collisions.

When a status role such as `info` uses a mix or shadow definition, its derived
`info-text` defaults to neutral, contrast-corrected text. Override `info-text`
explicitly for a colored label; the mix/shadow dependency graph stays intact.
A shadow status also uses a neutral derived surface, because Glaze does not allow
a shadow to be a mix target. Override the surface separately when needed.

### Register units and recipes

Register custom units and flat recipes in `theme`; Cookbook configures Tasty
before evaluating your components:

```ts
theme: {
  brand: { from: "#315efb" },
  palette: {
    "review-panel": { base: "surface", tone: "-2", saturation: 0.05 },
    "review-ink": { base: "review-panel", tone: 0, contrast: { wcag: [7, 10] } },
  },
  units: { rh: "6px" },
  recipes: {
    "review-panel": {
      fill: "#review-panel",
      color: "#review-ink",
      padding: "2rh",
      radius: "3px",
    },
  },
  customStyles: { DemoBadge: { Label: { color: "#review-ink" } } },
},
```

```ts
import { defineComponent } from "@tenphi/cookbook/styling";

export const DemoBadge = defineComponent("DemoBadge", {
  as: "aside",
  elements: { Label: "strong" },
  styles: {
    display: "block",
    recipe: "review-panel",
    Label: { preset: "h4" },
  },
});
```

Use `<DemoBadge><DemoBadge.Label>Review ready</DemoBadge.Label></DemoBadge>` in
MDX. Keep these styled components server-rendered: their CSS is extracted at
build time. Add behavior with a small client script targeting the rendered
markup. This recipe produces 12px padding. Units merge by name, with the later
configuration winning. Recipes merge using Tasty `mergeStyles`, including state
maps. Recipes are flat: define named sub-elements on the owning component, and
compose recipes with `recipe: "base elevated"` rather than referencing a recipe
inside another recipe. `none` is a reserved recipe name. Cookbook's built-in
units are `x`, `r`, `cr`, and `bw`; overriding one changes its meaning globally.

Keep editor and linter validation synchronized with your configuration:

```ts
// tasty.config.ts
import { createValidationConfig } from "@tenphi/cookbook/eslint-plugin";
import docs from "./docs.config";
export default createValidationConfig(docs.theme);
```

### Configure Glaze adaptation

`theme.glaze` accepts `lightTone`, `darkTone`, `darkDesaturation`, `autoFlip`,
`pastel`, `inferRole`, and `shadowTuning`. Tone windows accept `[lo, hi]`, `false`
for the full range, or the advanced `{ lo, hi, eps }` form. Continue to use
`theme.contrastLevel` for manual contrast interpolation. Cookbook always emits
all four appearance variants.

```ts
theme: {
  glaze: { lightTone: [10, 100], darkTone: [15, 95] },
  palette: {
    "accent-surface-subtle": {
      type: "mix", base: "surface", target: "accent-surface", value: [12, 20],
    },
    shadow: {
      type: "shadow", bg: "surface", fg: "text", intensity: [12, 24],
      tuning: { alphaMax: 0.3 },
    },
  },
},
```

Palette roles accept Glaze's regular, mix, and shadow declarations. Mix and
shadow references use the same graph as other roles. Native Glaze restrictions
still apply, including the requirement for shadow backgrounds and foregrounds
to reference non-shadow colors. `shadowTuning` exposes `saturationFactor`,
`maxSaturation`, `lightnessFactor`, `lightnessBounds`, `minGapTarget`, `alphaMax`,
and `bgHueBlend`; a role's own `tuning` takes precedence.

### Built-in palette inventory

Every generated role below can be overridden in `theme.palette`. Names map
directly to Tasty `#name` tokens. `COOKBOOK_PALETTE_NAMES`, exported from
`@tenphi/docs`, lists the same roles for tooling.

| Area                | Roles                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces            | `surface`, `header`, `overlay`, `surface-2`, `surface-3`, `surface-2-hover`, `surface-2-pressed`, `surface-3-hover`, `surface-3-pressed`                                                                        |
| Reading             | `text`, `heading`, `text-soft` (alias `textSoft`), `text-muted`, `sidebar-text`                                                                                                                                 |
| Brand and focus     | `accent-text`, `accent-surface`, `accent-surface-text`, `accent-surface-subtle`, `accent-surface-2-subtle`, `logo-surface`, `logo-mark`, `focus`                                                                |
| Borders and effects | `border`, `border-strong`, `shadow`, `clear`                                                                                                                                                                    |
| Status              | `info`, `success`, `warning`, `danger`, each with `-text` and `-surface` variants                                                                                                                               |
| Additional hues     | `orange`, `green`, `blue`, `purple`, `red`, each with `-text` and `-surface` variants                                                                                                                           |
| Syntax              | `syntax-bg`, `syntax-text`, `syntax-comment`, `syntax-punctuation`, `syntax-keyword`, `syntax-string`, `syntax-token`, `syntax-property`, `syntax-number`, `syntax-function`, `syntax-value`, `syntax-operator` |

## Contrast checks and troubleshooting

Cookbook checks text, headings, muted reading text, brand links, filled-control
labels, status text on its tinted surface, focus rings on each elevated
surface, and every palette declaration with a contrast floor. The same Glaze
resolution powers rendering and `cookbook doctor`, in light, dark, and both
high-contrast modes. Manual `theme.contrastLevel` targets interpolate with
Glaze's contrast level.

`resolveDocsTheme(theme).contrastChecks` lists each foreground/background pair,
mode, metric, target, measured value, and pass result. APCA uses display-channel
luminance; WCAG ratios use the sRGB transfer function. Transparent foregrounds
are composited onto their background before measuring. These checks cover
Cookbook's semantic pairs; test actual pages after changing component styles,
backgrounds, typography, or layout.

A `DOCS_SEMANTIC_CONTRAST_UNMET` or `DOCS_BRAND_CONTRAST_UNMET` error names the
pair, mode, and required target. Adjust that pair's `theme.palette` declarations:
use an absolute tone for reading text, reduce saturation when needed, and keep
`autoFlip` enabled when the solver needs to cross its base. Cookbook's default
fixed brand fill is anchored to a light label and darkens when needed to meet
contrast, including for orange, yellow, and pale brands. A custom fixed
middle-tone fill can make its label's contrast impossible.
Focus uses a WCAG 3:1 floor (4.5:1 in high contrast) against the surface ramp.

Keep contrast requirements when adjusting colors. Extreme custom tone windows,
fixed colors, or opacity can prevent a requested floor from being met. A palette
check does not replace keyboard, screen-reader, and rendered-page testing.

## Customize shared page surfaces

Each bridge has a complete base style tree; supply only the properties you
want to change. Sub-elements keep their selectors and all other defaults.
For example, a compact search dialog and quieter pagination need no CSS:

```ts
theme: {
  styles: {
    Search: { Dialog: { inlineSize: "max 32rem" } },
    SearchResults: { ResultLink: { color: "#accent-text" } },
    Pagination: { Link: { padding: "1.5x", fill: "#surface" } },
    Banner: { padding: "1x 2x" },
    Markdown: { Quote: { color: "#text", inlinePadding: "3x start" } },
  },
}
```

`Document` owns resets, base typography, generic controls, responsive media,
and accessibility utilities. `MainPane` and `MainContent` own the content
layout. `Markdown` owns prose, lists, links, quotations, and disclosure
anatomy. `Search` owns the dialog; `SearchResults` owns the Pagefind UI.
`MarkdownAlert` styles rendered alert blockquotes; `Card`, `Callout`, and
`Steps` style Cookbook components.

Custom components created with `defineComponent()` receive `theme.customStyles`
overrides during server rendering. Units, recipes, states, and presets are
resolved there and emitted as static CSS. Cookbook ships no Tasty/Glaze browser
runtime, theme configuration, or style hydration setup. Browser scripts and
`client:*` islands must not import Cookbook styling, Tasty, or Glaze; the build
rejects these imports. Attach small interaction scripts to server-rendered markup
or pass already-styled static markup into a client island.

Code fences and `CodeGroup` use the same `MarkdownCodeBlock` style tree. Its
root `$copy-button-size` defaults to `2rem`; the copy control and vertical
padding share it, keeping equal top, right, and bottom insets on one-line
snippets. The padding follows the `code` preset's line height. Override it with
`theme.styles.MarkdownCodeBlock` when changing the control size or code layout.

### Syntax highlighting and isolated previews

Shiki classifies code; Tasty renders every token using Glaze's semantic syntax
colors. Customize token rules with `theme.styles.SyntaxHighlight`, or their
colors with `theme.palette` (for example `syntax-keyword`). The default
`syntax-bg` stays white in light mode and takes a slight brand-hued tint, close
to the page background's saturation, in dark mode. Set
`theme.palette["syntax-bg"]` to give code its own color seed;
syntax text and token contrast resolve against that surface. Code fences, including
MDX and diff blocks, use classes without inline style attributes. Custom Shiki
transformers should emit classes; unsupported inline declarations fail with a
configuration hint.

The production build rejects style attributes, style blocks (including inside
shadow-root templates), and non-Tasty stylesheets throughout documentation HTML.
It parses actual markup, so escaped examples and strings in scripts are allowed.
The explicit exception is the separate document in a sandboxed `Preview` iframe;
it cannot access its parent's origin. Configure its size with
`theme.styles.Preview.Frame`. The documentation shell supports the CSP directive
`style-src-attr 'none'`. A host's CSP may also restrict the preview document; when
using that directive, authored previews must use style blocks rather than style
attributes.

Search uses an owned, keyboard-accessible dialog with Pagefind's indexing and
results UI. Its clear-button sizing is adapted to `SearchResults.Input` styles,
so the browser does not need inline layout declarations. The adapter is checked
against the pinned Pagefind UI version during builds.
