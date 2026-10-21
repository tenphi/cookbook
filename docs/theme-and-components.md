---
title: Theme and components
description: Choose a brand, build a semantic palette, set design tokens, and find the right customization guide.
sidebar:
  order: 5
---

Cookbook resolves Glaze colors and Tasty styles during the build, then ships
static CSS. Start with a brand color; add semantic palette roles, typography,
and component overrides only where the default needs to change. The
[theme recipes](./recipes.md) show complete, build-checked starting
points. Read the [customization rules](./customization-rules.md) before writing
new styles.

| To change                                    | Start here                                        |
| -------------------------------------------- | ------------------------------------------------- |
| Brand, color roles, design tokens, and logo  | This page                                         |
| Font files, families, and typography         | [Fonts and typography](./fonts-and-typography.md) |
| Built-in UI surfaces and named parts         | [Component styles](./component-styles.md)         |
| Your own Astro or MDX components and linting | [Custom components](./custom-components.md)       |
| Complete configuration fields                | [Configuration reference](./configuration.md)     |

Glaze derives light, dark, and high-contrast values from the brand and palette
inputs. Tasty applies those values through semantic tokens. See the
[Glaze reference](https://glaze.tenphi.me) for color declarations and the
[Tasty style DSL](https://tasty.style/docs/dsl) for state maps, tokens, units,
and sub-elements.

## Brand color

The default brand is a calm blue with 68% OKHSL saturation. Set a brand color
with Glaze's `from` declaration:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  theme: { brand: { from: "#2f5bff" } },
});
```

Add a higher contrast target when brand-colored text needs more contrast:

```ts
theme: {
  brand: {
    from: "#2f5bff",
    contrast: { apca: [80, 95] }
  }
}
```

The default brand target is APCA 45 (60 in high contrast).

The brand supplies the hue and saturation seed. Cookbook derives separate text,
filled-control, and focus roles from it. Small accent text keeps APCA floors of
75 (90 in high contrast), and filled-control labels keep 80 (95 in high
contrast); diagnostics also enforce WCAG 4.5:1 / 7:1 on their actual
backgrounds. Only authored brand targets above these floors raise them. Glaze adjusts tones only as far as these floors require;
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
    "text-soft": {
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
mode uses the full range. `text-soft` is reserved for secondary text.
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
declarations and expose border, `-text`, and `-surface` semantic tokens. For
`orange`, `green`, `blue`, `purple`, and `red`, an override changes that role
and its `-surface` tint only; set the matching `-text` role as well.
Cookbook keeps literal surface seeds desaturated in the dark scheme so a nearly
white tint does not become vivid dark chrome when its tone is inverted.

Components consume semantic colors consistently: `surface`, `header`, `surface-2`,
`surface-3`, `text`, `heading`, `text-soft`, `sidebar-text`, `border`, `border-strong`, `accent-text`,
`accent-surface`, `accent-surface-text`, `logo-surface`, `logo-mark`, and `focus`.
Tasty components can use these as `#surface`, `#text`, `#border`, and so on; the Astro shell consumes the
same resolved values. Glaze also generates hover and pressed states, subtle
accent fills, overlays, shadows, and the orange, green, blue, purple, and red
roles available to content components. No browser color mixes or
upstream fallback palette values participate in the rendered theme. Surface
elevation uses Glaze's contrast-uniform tone axis: `surface-2` advances two tone
steps and `surface-3` advances four from the base surface, with proportionally
wider steps in high-contrast mode. Their saturation also steps down to 75% and
65% of the authored surface seed so tinted surfaces remain restrained as they
move farther from the base tone.

Borders stay intentionally quiet: Glaze derives their hue from `brand` but
uses only about one fifth (a `0.205` factor) of the brand saturation. Normal and high-contrast modes
change border tone, not that restrained saturation relationship.

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

Palette names use lowercase letters, digits, and hyphens, such as `text-soft`.
The names `current`, `constructor`, and `prototype` are reserved.
Declaring a built-in name intentionally overrides that role; use a project
prefix for additional roles to avoid future naming collisions.

When a status role such as `info` uses a mix or shadow definition, its derived
`info-text` defaults to neutral, contrast-corrected text. Override `info-text`
explicitly for a colored label; the mix/shadow dependency graph stays intact.
A shadow status also uses a neutral derived surface, because Glaze does not allow
a shadow to be a mix target. Override the surface separately when needed.

### Configure Glaze adaptation

`theme.glaze` accepts `lightTone`, `darkTone`, `darkDesaturation`, `autoFlip`,
`pastel`, `inferRole`, and `shadowTuning`. Tone windows accept `[lo, hi]`, `false`
for the full range, or the advanced `{ lo, hi, eps }` form. The example below
uses Glaze's default windows. Continue to use
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
`@tenphi/cookbook`, lists the same roles for tooling.

| Area                | Roles                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces            | `surface`, `header`, `overlay`, `surface-2`, `surface-3`, `surface-2-hover`, `surface-2-pressed`, `surface-3-hover`, `surface-3-pressed`                                                                        |
| Reading             | `text`, `heading`, `text-soft`, `text-muted`, `sidebar-text`                                                                                                                                                    |
| Brand and focus     | `accent-text`, `accent-surface`, `accent-surface-text`, `accent-surface-subtle`, `accent-surface-2-subtle`, `logo-surface`, `logo-mark`, `focus`                                                                |
| Borders and effects | `border`, `border-strong`, `shadow`                                                                                                                                                                             |
| Status              | `info`, `success`, `warning`, `danger`, each with `-text` and `-surface` variants                                                                                                                               |
| Additional hues     | `orange`, `green`, `blue`, `purple`, `red`, each with `-text` and `-surface` variants                                                                                                                           |
| Syntax              | `syntax-bg`, `syntax-text`, `syntax-comment`, `syntax-punctuation`, `syntax-keyword`, `syntax-string`, `syntax-token`, `syntax-property`, `syntax-number`, `syntax-function`, `syntax-value`, `syntax-operator` |

### Contrast checks and troubleshooting

Cookbook checks text, headings, secondary `text-soft` text, brand links,
filled-control labels, the logo mark on its surface, status text on its tinted
surface, focus rings on each elevated surface, and every palette declaration
with a contrast floor. The same Glaze
resolution powers rendering and `cookbook doctor`, in light, dark, and both
high-contrast modes. Manual `theme.contrastLevel` targets interpolate with
Glaze's contrast level.

`resolveDocsTheme(theme).contrastChecks`, exported from `@tenphi/cookbook`,
lists each foreground/background pair with its mode, metric, target,
`measured` value, and `passed` result. APCA uses display-channel
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

## Design tokens

Token names follow Tasty's
[token and unit syntax](https://tasty.style/docs/dsl#built-in-units): `$name`
becomes the CSS custom property `--name`. Configure tokens with `$name` keys.
These are the defaults:

```ts
theme: {
  tokens: {
    "$gap": "0.5rem",
    "$radius": "8px",
    "$header-control-radius": "999px",
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
`content-width` limits the reading column inside it. The column stays centered
as the viewport narrows: horizontal padding shrinks to 1.5rem before the column
itself shrinks. Mobile layouts use 1rem padding. `radius` is the control
and navigation radius; `card-radius` is the larger surface radius. Keeping
those roles separate makes a sharp control theme or a soft card theme possible
without one-off component overrides. `header-control-radius` shapes the header
buttons; see [header control shape](./component-styles.md#header-control-shape).

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

To keep editor and linter validation synchronized with these names, build the
lint configuration from your theme; see
[custom theme names](./custom-components.md#custom-theme-names).

## Logo and favicon

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

A logo does not change the favicon or touch icons. Configure
[`site.favicon`](./configuration.md#site-icons) separately for square artwork;
the default Cookbook icon set remains in place until changed. The
[`Logo` component](./authoring.mdx#cookbook-logo) remains available as the
standalone Cookbook book mark.

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
To combine your own logo and title in one custom link, see
[Replace built-in markup](./custom-components.md#replace-built-in-markup).

## Typography

Cookbook supplies semantic `body`, `heading`, `h1`–`h6`, `navigation`, `small`,
and `code` presets. Use `theme.fonts` to load Google families by name or local
font files, and `theme.presets` to change sizes, weights, and other typography
fields. See [Fonts and typography](./fonts-and-typography.md) for both paths,
cache behavior, and preset details.

## Component styles and custom components

Use a partial Tasty style object at `theme.styles.<ComponentName>` to change a
built-in surface. Cookbook merges it with the complete base style object before
CSS extraction. The [component styles reference](./component-styles.md) gives
examples and the complete list of named sub-elements for every surface.

For your own components, use `defineComponent()` for a configurable component
root and `resolveComponentStyles()` for an owned global style tree, then adopt
Cookbook's Tasty lint preset. The [custom component guide](./custom-components.md)
covers both patterns and [linting](./custom-components.md#linting-custom-styles).

## Reader appearance

The Appearance menu stores each reader's color scheme and contrast in one
`localStorage` entry. Its key and format are a stable contract, so another app
on the same origin can share the preference with the documentation. A typical
example is a product site that serves Cookbook under `/docs/`.

```ts
// localStorage["cookbook-appearance"], stored as JSON
type CookbookAppearance = {
  theme?: "light" | "dark" | "system";
  contrast?: "normal" | "more" | "system";
};
```

A missing or unrecognized field means `"system"`, which follows the reader's
operating system. Keep any other fields when you write the object:

```ts
const key = "cookbook-appearance";
const appearance = JSON.parse(localStorage.getItem(key) ?? "{}") ?? {};

localStorage.setItem(key, JSON.stringify({ ...appearance, theme: "dark" }));
```

Cookbook applies the stored choice before the first paint, as `data-theme` and
`data-contrast` on `<html>`. Open pages follow changes made in other tabs through
the `storage` event. Your app can map the same values onto its own attributes.

Browsers keep `localStorage` per origin: the scheme, host, and port must all
match, so a docs subdomain does not share the preference.

## Static behavior

The page content remains readable without client JavaScript. Search, menus,
copy controls, and appearance persistence enhance the static HTML. See
[Component styles](./component-styles.md#static-behavior) for the boundary and
responsive UI behavior.
