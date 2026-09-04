---
title: Theme and components
description: Build an accessible Glaze palette, customize Tasty tokens, and use the supported Astro components.
sidebar:
  order: 5
---

Cookbook uses Glaze to derive light, dark, and high-contrast values from one
brand input, then exposes the result through Tasty tokens and component
anatomy.

Use the [Glaze documentation](https://glaze.tenphi.me) to learn how palette
inputs, color modes, and contrast targets are resolved. Use the
[Tasty documentation](https://tasty.style) for the style properties, tokens,
units, presets, and state maps accepted by `theme.styles`.

## Brand color

The short form accepts any color value supported by Glaze:

```ts
theme: {
  brand: "#2f5bff",
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

Cookbook rejects a normal APCA target below 45 unless
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
same resolved values. Glaze also generates hover and pressed states, subtle
accent fills, overlays, shadows, and the orange, green, blue, purple, and red
roles used by Starlight content components. No browser color mixes or
Starlight fallback palette values participate in the rendered theme. Surface
elevation uses Glaze's contrast-uniform tone axis: `surface-2` advances two tone
steps and `surface-3` advances four from the base surface, with proportionally
wider steps in high-contrast mode. Their saturation also steps down to 75% and
65% of the authored surface seed so tinted surfaces remain restrained as they
move farther from the base tone.

Borders stay intentionally quiet: Glaze derives their hue from `brand` but
uses only one quarter of the brand saturation. Normal and high-contrast modes
change border tone, not that restrained saturation relationship.

The contrast control in the desktop header and mobile menu can follow the
system, force the normal palette, or activate the Glaze high-contrast palette.
System mode responds to `prefers-contrast: more`; an explicit selection is
persisted and takes precedence over that media query.

Interactive controls step up exactly one surface level: a control on `surface`
uses `surface-2`, while a control on `surface-2` uses `surface-3`. Hover and
pressed states build on that elevated surface without changing the border.
Inputs stay on their surrounding surface so their border remains the visual
boundary. Selected navigation uses the fixed-mode `accent-surface` and its
paired `accent-surface-text`, so the brand fill does not drift toward the
adaptive link color in dark mode.

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

The built-in presets are `body`, `heading`, `h1` through `h6`, `navigation`,
`small`, and `code`. Onest is self-hosted and used for body and heading text by
default; JetBrains Mono is self-hosted for code. Presets merge
property-by-property, so changing a font does not require copying its size,
weight, or line height:

```ts
theme: {
  presets: {
    body: {
      fontFamily: "Inter, system-ui, sans-serif",
      boldFontWeight: 680
    },
    heading: {
      fontFamily: "Newsreader, Georgia, serif",
      fontWeight: 650,
      boldFontWeight: 740
    },
    h1: {
      fontSize: "3rem",
      letterSpacing: "-0.02em"
    },
    code: {
      fontFamily: "Berkeley Mono, ui-monospace, monospace"
    }
  }
}
```

Heading presets reference the `heading` family and weights; body, navigation,
and controls reference `body`. Semantic `strong` and `b` elements use Tasty's
`strong` modifier, so their weight comes from the active preset's
`boldFontWeight` instead of a separate element-specific value. `strong` is a
reserved modifier keyword, not a named preset; the modifier-only form is
equivalent to `inherit / strong`. Default body tracking is neutral, while
larger headings use progressively gentle negative tracking. Additional named
presets are passed through to Tasty SSR for use in custom MDX components.
Cookbook applies each semantic typography role through its complete Tasty
`preset`, so configured fields such as `fontStyle` and `textTransform` are not
silently omitted.

The exported `DEFAULT_THEME_TOKENS` and `DEFAULT_TYPOGRAPHY_PRESETS` constants
are useful when building a theme editor or presenting a reset action.

## Style customization

Cookbook-owned interface elements are direct `tasty()` components. Supported
Starlight-rendered surfaces use the same Tasty style trees through the global
bridge. Customize either kind by name under `theme.styles`; the configuration
is resolved before CSS generation, so this is not a selector-based CSS
override.

Provide only the root and named sub-element properties you want to override.
Cookbook deep-merges that partial style object into the complete base style
object inside the renderer:

```ts
theme: {
  styles: {
    ThemeSelect: {
      Select: {
        border: "#border-strong"
      },
      Picker: {
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
    MobileTableOfContents: {
      LinkLabel: { whiteSpace: "normal" }
    }
  }
}
```

No merge helper or base style object is required in user configuration. Style
customization has one behavior: every supplied object is a partial override and
is merged into the base inside Cookbook.

Every configurable surface accepts styles at the root plus these named Tasty
sub-elements:

| Configuration name      | Named sub-elements                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`                  | `Heading2`, `Heading3`, `Paragraph`                                                                                                                                                                         |
| `ContrastSelect`        | `Label`, `Icon`, `IconSvg`, `Select`, `PickerIcon`, `Picker`, `OpenPicker`, `Option`, `HoverOption`, `CheckedOption`, `Checkmark`                                                                           |
| `Footer`                | `Meta`, `LoneMetaItem`, `MetaLink`, `HoverMetaLink`, `Credit`, `CreditLink`, `HoverCreditLink`                                                                                                              |
| `Hero`                  | `Visual`, `Stack`, `Copy`, `Title`, `Tagline`, `Actions`, `Action`, `HoverAction`, `PrimaryAction`, `SecondaryAction`, `MinimalAction`, `ActionIcon`                                                        |
| `LanguageSelect`        | `Label`, `HoverLabel`, `LabelIcon`, `Select`, `Caret`, `Option`                                                                                                                                             |
| `Logo`                  | `Svg`, `Mark`                                                                                                                                                                                               |
| `MarkdownCodeBlock`     | `Pre`, `CopyButton`, `HoverCopyButton`, `CopiedButton`, `CopyIcon`, `CopiedIcon`                                                                                                                            |
| `MarkdownHeading`       | `Heading`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6`, `Link`, `HoverLink`                                                                                                      |
| `MarkdownTable`         | `Table`, `Cell`, `LastBodyRowCell`, `HeaderCell`                                                                                                                                                            |
| `Mermaid`               | `Diagram`, `Text`, `MonoText`                                                                                                                                                                               |
| `MobileMenuFooter`      | `Social`                                                                                                                                                                                                    |
| `MobileNavigationTabs`  | `Label`, `List`, `Item`, `Link`, `HoverLink`, `CurrentLink`                                                                                                                                                 |
| `MobileTableOfContents` | `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`, `CurrentIndicator`                                                                                                                                 |
| `PackageVersion`        | None                                                                                                                                                                                                        |
| `Preview`               | `Caption`, `Stage`, `Frame`, `Code`, `Summary`, `Pre`                                                                                                                                                       |
| `Sidebar`               | `CurrentLink`, `Content`, `List`, `Item`, `TopLevelSpacing`, `NestedItem`, `Control`, `Summary`, `GroupLabel`, `GroupLabelText`, `Link`, `LinkLabel`, `InteractiveControl`, `SummaryMarker`, `TopLevelLink` |
| `StarlightHeader`       | `Primary`, `TitleAndSearch`, `Title`, `Logo`, `SiteTitle`, `Search`, `SearchElement`, `Tools`, `ToolItem`, `Social`, `MobileTheme`                                                                          |
| `Steps`                 | `Item`, `Marker`                                                                                                                                                                                            |
| `Tabs`                  | None                                                                                                                                                                                                        |
| `TableOfContents`       | `Heading`, `List`, `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`                                                                                                                                  |
| `ThemeSelect`           | `Label`, `Icon`, `IconSvg`, `Select`, `PickerIcon`, `Picker`, `OpenPicker`, `Option`, `HoverOption`, `CheckedOption`, `Checkmark`                                                                           |
| `TopNavigation`         | `Scrollbar`, `Link`, `HoverLink`, `CurrentLink`, `ActiveIndicator`                                                                                                                                          |

`COOKBOOK_COMPONENT_NAMES` publishes the configuration names, and
`COOKBOOK_COMPONENT_SUB_ELEMENTS` publishes the complete sub-element lists for
theme editors and other tooling. The corresponding TypeScript types are
`CookbookComponentName`, `CookbookComponentSubElementName`,
`CookbookComponentStyles`, `ComponentStyleConfig`, and `ComponentStylesConfig`.
Known configuration names provide editor suggestions for their named
sub-elements.

For the three navigation surfaces, root properties customize the navigation
container; the `MobileTableOfContents` root is the list inside the mobile
dropdown. For example, overriding `LinkLabel.whiteSpace` keeps the other base
`LinkLabel` properties because the configured object is merged by default.
By default, the footer credit uses the primary body text color, while its
Cookbook link uses the semantic brand link color.

`components.overrides` remains the structural escape hatch for replacing an
Astro component. Prefer `theme.styles` when the markup and behavior remain the
same.

Custom names remain compatible with the earlier anatomy API: an unrecognized
name targets a user-authored matching `data-tasty-anatomy` attribute. Built-in
names never use that selector bridge.

The default renderer runs Tasty in Astro extract mode. Direct components and
the remaining document/vendor bridge styles are collected into shared static
CSS during the build, while appearance controls add only the small client
behavior needed to persist selected theme and contrast modes. The compact
Cookbook logo is shown beside the project title in the default top bar.

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
