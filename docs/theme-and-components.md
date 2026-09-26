---
title: Theme and components
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

## Brand color

The default brand is a calm blue with 68% OKHSL saturation. Specify its Glaze
hue, saturation, tone, and contrast requirement directly:

```ts
theme: {
  brand: {
    hue: 266,
    saturation: 68,
    tone: 48,
    contrast: { apca: [45, 60] }
  }
}
```

The short form accepts a literal color; `from` can combine one with a contrast
target when matching an existing brand asset matters:

```ts
theme: {
  brand: {
    from: "oklch(58% 0.22 265)",
    contrast: { apca: [45, 60] }
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

`brand` controls accent text, fills, and focus. The optional palette roles
control the reading surface, text, and callout colors. Declare color
relationships with Glaze's `tone`, `base`, and `contrast` properties:

```ts
theme: {
  brand: { hue: 266, saturation: 68, tone: 48 },
  palette: {
    surface: { tone: 98, saturation: 0.05 },
    text: {
      base: "surface",
      tone: "-10",
      saturation: 0,
      contrast: { wcag: [7, 10] }
    },
    textSoft: {
      base: "surface",
      tone: "-10",
      saturation: 0.05,
      contrast: { wcag: [4.5, 7] }
    }
  },
  contrastLevel: "auto"
}
```

Glaze resolves each declaration for light, dark, normal, and high-contrast
modes. The first contrast value applies to normal mode; the second applies to
high contrast. The brand uses Glaze's structured color input, where
`saturation` is 0–100; palette declarations use a 0–1 saturation factor of
that seed. `tone` is 0–100 in both. A literal color or a `from` declaration remains available when
an exact light-scheme seed matters. For deeper customization, prefer relative
declarations: they retain their relationship to the surface when the scheme or
contrast changes. `info`, `success`, `warning`, and `danger` also accept Glaze
declarations and expose border, `-text`, and `-surface` semantic tokens.
Cookbook keeps literal surface seeds desaturated in the dark scheme so a nearly
white tint does not become vivid dark chrome when its tone is inverted.

Components consume semantic colors consistently: `surface`, `header`, `surface-2`,
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

The Appearance button in the desktop and mobile header opens one panel with
Color scheme and Contrast sections. Color scheme offers Light, Dark, and Auto;
Contrast offers Normal, High, and Auto. Each preference is independent, and
existing saved choices are preserved. The panel supports keyboard navigation,
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
boundary. Selected navigation uses the fixed-mode `accent-surface` and its
paired `accent-surface-text`, so the brand fill does not drift toward the
adaptive link color in dark mode.

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

The short form requests the family's default style. To use specific weights,
list them explicitly. Google Fonts must support the requested weights; see the
[Google Fonts CSS API](https://developers.google.com/fonts/docs/css2) for its
available styles and weight syntax.

```ts
theme: {
  fonts: {
    body: { google: "Inter", weights: [400, 600, 700] }
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
Cookbook emits the font faces through Tasty. Google font names are resolved at
build time, so those builds need network access; the generated site has no
Google CSS stylesheet. Font files are requested from Google's font CDN when
visitors open the site. Use local files if you need a self-hosted site.

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
Starlight-rendered surfaces use the same Tasty style trees through the global
bridge. Customize either kind by name under `theme.styles`; the configuration
is resolved before CSS generation, so this is not a selector-based CSS
override.

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

| Configuration name      | Named sub-elements                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`                  | `Heading2`, `Heading3`, `Paragraph`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `Callout`               | `Title`, `Body`, `Tip`, `Caution`, `Danger`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `CodeGroup`             | `Caption`, `Pre`, `Code`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Tab`                   | `Heading`, `Hidden`, `HiddenHeading`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Footer`                | `Meta`, `LoneMetaItem`, `MetaLink`, `HoverMetaLink`, `Credit`, `CreditLink`, `HoverCreditLink`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Hero`                  | `Visual`, `Stack`, `Copy`, `Title`, `Tagline`, `Actions`, `Action`, `HoverAction`, `PrimaryAction`, `SecondaryAction`, `MinimalAction`, `ActionIcon`                                                                                                                                                                                                                                                                                                                                            |
| `LanguageSelect`        | `Label`, `HoverLabel`, `LabelIcon`, `Select`, `Caret`, `Option`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `Logo`                  | `Svg`, `Mark`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `MarkdownCodeBlock`     | `Pre`, `CopyButton`, `HoverCopyButton`, `CopiedButton`, `CopyIcon`, `CopiedIcon`                                                                                                                                                                                                                                                                                                                                                                                                                |
| `MarkdownHeading`       | `Heading`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6`, `Link`, `RevealedLink`, `HoverLink`, `LinkIcon`, `CopiedLink`, `CopiedLinkIcon`, `CopiedIcon`                                                                                                                                                                                                                                                                                                                |
| `MarkdownInlineCode`    | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `MarkdownTable`         | `Table`, `Cell`, `LastBodyRowCell`, `HeaderCell`                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Mermaid`               | `Diagram`, `Text`, `MonoText`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `MobileMenuFooter`      | `Social`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `MobileMenuToggle`      | `Control`, `Icon`, `Section`, `Page`, `HoverControl`, `ActiveControl`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `MobileNavigationTabs`  | `Trigger`, `Marker`, `Caret`, `ExpandedCaret`, `Label`, `List`, `Item`, `Link`, `HoverLink`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                      |
| `MobileTableOfContents` | `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`, `CurrentIndicator`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `PackageVersion`        | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `VersionSwitcher`       | `Trigger`, `Panel`, `OpenPanel`, `Link`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Preview`               | `Caption`, `Stage`, `Frame`, `Code`, `Summary`, `Pre`                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Sidebar`               | `Backdrop`, `OpenBackdrop`, `MobileHeading`, `HomeLink`, `HomeLogo`, `HomeLabel`, `Close`, `HoverClose`, `CloseIcon`, `CurrentLink`, `OpenPane`, `Content`, `Tree`, `List`, `Item`, `TopLevelSpacing`, `GroupSpacing`, `NestedItem`, `SectionHeading`, `Control`, `Summary`, `GroupLabel`, `GroupLabelText`, `Link`, `LinkLabel`, `InteractiveControl`, `SummaryMarker`, `Caret`, `ExpandedCaret`, `LinkedSummary`, `GroupLink`, `LinkedSectionHeading`, `SectionLink`, `Badge`, `TopLevelLink` |
| `SocialIcons`           | `Link`, `HoverLink`, `Icon`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `StarlightHeader`       | `Primary`, `TitleAndSearch`, `Title`, `LogoLink`, `Logo`, `SiteTitle`, `Search`, `SearchElement`, `Tools`, `ToolItem`, `Social`, `MobileTheme`                                                                                                                                                                                                                                                                                                                                                  |
| `TableOfContentsLayout` | `Content`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SearchButton`          | `Label`, `Shortcut`, `Hover`, `Active`, `NativeIcon`, `Icon`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Layout`                | `LockedPage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `HeaderLinks`           | `Desktop`, `Link`, `HoverLink`, `PrimaryLink`, `HoverPrimaryLink`, `Trigger`, `HoverTrigger`, `Panel`, `PanelNavigation`, `PanelLink`, `FirstPanelLink`, `Close`, `HoverClose`                                                                                                                                                                                                                                                                                                                  |
| `HeaderFrame`           | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `PageFrame`             | `MainFrame`, `SidebarFrame`, `Columns`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Steps`                 | `Item`, `Marker`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Tabs`                  | `List`, `Button`, `SelectedButton`, `FocusedButton`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `TableOfContents`       | `Heading`, `List`, `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `ThemeSelect`           | `Trigger`, `HoverTrigger`, `ActiveTrigger`, `Icon`, `Panel`, `OpenPanel`, `Section`, `SectionSpacing`, `SectionLabel`, `Option`, `HoverOption`, `CheckedOption`, `FocusedOption`, `Input`, `OptionIcon`, `Checkmark`, `SelectedCheckmark`                                                                                                                                                                                                                                                       |
| `TopNavigation`         | `Scrollbar`, `Link`, `HoverLink`, `CurrentLink`, `ActiveIndicator`                                                                                                                                                                                                                                                                                                                                                                                                                              |

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
`MarkdownHeading.RevealedLink`, and `MarkdownHeading.LinkIcon`. Activating a
heading link copies the full page URL with that section’s fragment, without
scrolling or changing the current URL. A checkmark and screen-reader status
confirm the copy; clipboard failures are announced. Modified clicks and links
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

- `Preview` isolates HTML and CSS with declarative Shadow DOM, or JavaScript
  in a sandboxed iframe.

Use MDX only for repository content you control. Locked package content remains
Markdown-only unless the consumer explicitly sets `trust: "mdx"` for that
source.

## Authoring custom components

Import styling tools from `@tenphi/cookbook/styling`. They use the same Tasty
runtime as Cookbook, with its semantic colors, typography presets, units, and
responsive states. The renderer package also exposes them from
`@tenphi/starlight/styling`.

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

### A custom logo and site title

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

const { siteTitle, siteTitleHref } = Astro.locals.starlightRoute;
---

<SiteTitleRoot href={siteTitleHref}>
  <ProjectLogo aria-hidden="true" focusable="false" />
  <span translate="no">{siteTitle}</span>
</SiteTitleRoot>
```

Register the replacement in `docs.config.ts` and hide the default header mark.
The custom component supports root styles plus its complete list of named
sub-elements: `Logo` and `Label`.

```ts
components: {
  overrides: {
    SiteTitle: "./docs/components/SiteTitle.astro"
  }
},
theme: {
  styles: {
    StarlightHeader: { LogoLink: { hide: true } }
  },
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
`@tenphi/starlight/eslint-plugin`. Keep style definitions in `.ts` or `.tsx`
modules, as in the site title example above, to lint them with either ESLint or
oxlint.

Create `tasty.config.ts` at your project root:

```ts
export default {
  extends: "@tenphi/cookbook",
};
```

Renderer-only consumers can use `extends: "@tenphi/starlight"` instead.
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
`StarlightHeader`, and header buttons with `HeaderLinks` and `SearchButton`.

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

The table of contents is hidden below 72rem through `TableOfContentsLayout`.
`MobileTableOfContents` remains a legacy style name for custom overrides; the
default renderer no longer renders that component. `Layout` controls shared
navigation dimensions and the drawer's scroll lock; `PageFrame` styles the
page container and content columns.
