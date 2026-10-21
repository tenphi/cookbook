---
title: Upgrade Cookbook
description: Version-specific changes, runtime upgrades, and documentation-source updates.
sidebar:
  order: 9
---

Upgrade the Cookbook runtime with your package manager, then apply the notes
for every version range you cross, starting with the oldest.

## Upgrade the site runtime

Check your current `@tenphi/cookbook`, Astro, and Node versions first. Read the
[release notes](https://github.com/tenphi/cookbook/releases), then update the
runtime dependency using the package manager that owns your lockfile:

```sh
npm install @tenphi/cookbook@latest
npx @tenphi/cookbook doctor
npm run build
npx @tenphi/cookbook check-build
npm run preview
```

For pnpm use `pnpm add`; for Yarn use `yarn add`. Commit the package manifest and
package-manager lockfile together. Keep Astro inside Cookbook's declared peer
range. Review the preview with your custom styles, plugins, fonts, languages,
and versions before deploying. After deployment, run `cookbook check-build
--url https://docs.example.com/` against that exact build output.

The creator starts new projects; rerunning it over an existing project is not
an upgrade path. Generated sites include `.agents/skills/upgrade-cookbook/`
for an agent-assisted upgrade. See [quality checks](./quality-checks.md) for
validation coverage and [troubleshooting](./troubleshooting.md) for failures.

### Runtime updates versus documentation updates

`cookbook update` updates **imported npm documentation**, according to the
specifiers in `content.sources`. It writes `cookbook.lock.json`; it does not
upgrade the site's Cookbook runtime or package-manager dependencies. Commit the
documentation lock separately when intentionally updating imported content.
Local Markdown needs no lock update.

## 0.28.x to 0.29

Cookbook 0.29 updates Tasty to 3.11, aligns the built-in styles with Tasty's
style guidelines, and checks component overrides the way the build uses them.

### Style overrides

Review overrides of the properties below.

Direction-dependent styles now follow the page's writing direction. Override
`Steps` with `inlinePadding` and `inlineBorder`, `Steps.Item`,
`MarkdownCodeBlock.Pre`, and `SearchButton` with `inlinePadding` (and
`blockPadding`), and the `SkipLink`, `HeaderLinks.Panel`, and
`HeaderLinks.Close` positions with `blockInset` and `inlineInset`. A physical
`padding`, `border`, or `inset` override no longer replaces those
declarations. `MarkdownTable.HeaderCell` rounds both top corners of each cell
in the first header row.

Built-in styles hide elements with Tasty's `hide` instead of `display: none`.
`hide` takes priority over `display`, so override `hide` to show or hide
`MobileMenuToggle`, `Pagination`, `Search.Close`,
`SearchResults.EngineControls`, `SearchResults.SuppressedClear`, and the
`Document` utilities `PrintHidden`, `DesktopBlock`, `DesktopFlex`,
`NarrowBlock`, and `MobileBlock`.

`theme.styles.Card` overrides of `fill`, `shadow`, and `translate` now also
apply to linked Cards. Their hover and pressed values are `:any-link & :hover`
and `:any-link & :active` states of those properties, so a plain value such as
`fill: "#surface"` also replaces them.

The `clear` palette role is removed. Tasty 3.11 compiles `#clear` to
`transparent` without reading a theme token, so a customized
`theme.palette.clear` no longer has any effect. A leftover entry now defines an
unused custom color; delete it.

GitHub alerts (`MarkdownAlert`) now use the status palette roles that `Callout`
uses: `info`, `success`, `warning`, and `danger`, instead of `blue`, `green`,
and `red`. The default colors are unchanged. If you set `theme.palette.blue`,
`green`, or `red` to restyle alerts, set `info`, `success`, or `danger`
instead; those also restyle Callouts.

### Component overrides and edit links

`components.overrides` accepts only the
[documented slot names](./configuration.md#components). An unknown name, such
as a misspelled `Foter`, used to be ignored and now fails validation with
`DOCS_CONFIG_UNKNOWN_KEY`.

`cookbook doctor` resolves override paths from the Astro project directory,
as the build does. Start local paths with `./`: a value such as
`src/Header.astro` is a package specifier, which the build cannot resolve
either, and doctor now reports it as `DOCS_COMPONENT_UNRESOLVED`.

Package pages no longer get an edit link from `editLink.baseUrl`. That link
pointed into your repository at a file that exists only in the npm artifact.
A package page still shows an edit link when its own frontmatter sets
`editUrl`.

## 0.23.x to 0.28

These releases need no configuration changes, but they can affect custom
scripts, hard-coded links, and apps that share the reader's appearance:

- **Client navigation (0.24):** internal links swap pages without a full
  reload. Bundled scripts are not rerun after a client navigation, so attach
  custom browser behavior through custom-element lifecycle callbacks or
  initialize it on `astro:page-load`. See
  [client navigation](./site-navigation.md#client-navigation).
- **Prefetching (0.25):** Astro's hover and focus prefetching is enabled by
  default. Set `prefetch: false` in the Astro configuration to turn it off;
  explicit Astro `prefetch` settings are preserved.
- **Page URLs (0.25.1):** page URLs follow Astro's `trailingSlash` and
  `build.format`. With the default directory output, internal links, canonicals,
  and `llms.txt` use a trailing slash, such as `/guide/`. See
  [deployment](./deployment.md#public-url-and-base-path).
- **Appearance storage (0.25.4):** the reader's color scheme and contrast are
  stored together in one `cookbook-appearance` entry. A scheme saved under the
  previous `cookbook-theme` key is still read and moves to the new entry on the
  next change. See [reader appearance](./theme-and-components.md#reader-appearance).

## 0.22.x to 0.23

Cookbook 0.23 extends Tasty `data-element` identities to all owned anatomy,
expresses state with data modifiers, and uses one responsive width scale.

### Root hooks, anatomy, and button variants

Existing component root classes and Logo’s root `class` prop remain supported.
Stable generated-content root classes remain available for global ownership, including
`.cookbook-markdown-content`, `.cookbook-heading-wrapper`, `.td-code-block`,
`.tasty-code`, `.cookbook-alert`, and `.td-mermaid`. Custom roots may also use classes
or `data-component`.

Owned sub-elements use `data-element` identities, and state uses data modifiers.
Keep identity matching in structural `$` selectors. For example, hero actions use
`data-element="Action"` with `data-primary`, `data-secondary`, or `data-minimal`.
When customizing `Hero.PrimaryAction`, keep its variant condition in a property
map, such as `color: { "@own(primary)": "#accent-text" }`.

The code-block wrapper owns `data-diff` and `data-copy-state`; code and line rules
use plain `diff` or `copy-state=copied` state keys. Line insertion/deletion flags
belong to the line itself and use `@own(inserted)` / `@own(deleted)`.

Heading wrappers carry `data-heading` and `level=h1` through `level=h6` states.
Linked Cards carry `data-block` for prose spacing. Shared `@prose`, `@prose-block`,
and `@prose-heading` conditions keep repeated Markdown declarations readable while
preserving isolated `data-not-content` descendants and conditional omissions.

Syntax transformers may emit root classes. Token/category hooks use modifiers,
for example `SyntaxHighlight: { Keyword: { color: { "@own(syntax-keyword)": "#accent-text" } } }`.
Tasty-generated style hashes and library-owned Pagefind sub-element classes remain.

Hero buttons stay stationary on hover. Minimal actions share secondary outline
padding, background, and border width, with a transparent border (`border: "#clear"`).
Pagination links keep their border at rest; hover changes only colors,
preserving `theme.styles.Pagination.Link` border width and style.

### Responsive states

Responsive aliases now use one width scale: `@sm` (>40rem), `@md` (≥50rem), and
`@lg` (≥72rem). The conditions select wider viewports;
the exclusive 40rem boundary preserves the former `@small` behavior. The renderer
keeps its existing responsive thresholds.
Use these replacements for the removed shortcuts in custom style maps:

| Removed alias    | Replacement          |
| ---------------- | -------------------- |
| `@small`         | `!@sm`               |
| `@mobile`        | `!@md`               |
| `@narrow-layout` | `!@lg`               |
| `@desktop`       | `@md`                |
| `@compact`       | `@media(w <= 23rem)` |
| `@shell-mobile`  | `@media(w <= 48rem)` |
| `@shell-desktop` | `@media(w > 48rem)`  |
| `@medium-layout` | `@md & !@lg`         |
| `@popover-open`  | `:popover-open`      |

Inside a selected descendant's condition, use `@own(:popover-open)`.
The shell and medium-layout aliases were unused by built-in components;
PackageVersion's 23rem rule is now a direct media condition. Define a project
alias in `theme.states` if you need a named threshold across your own components.

If you customized `theme.states`, rename your breakpoint definitions and invert
the old upper-bound conditions. For example, `"@mobile": "@media(w < 43rem)"`
becomes `"@md": "@media(w >= 43rem)"`.

## 0.20.x to 0.21

Cookbook 0.21 removes the legacy theme naming and styling compatibility paths.
0.21.2 moved Header, Footer, and logo anatomy to `data-element` identities and
heading levels to state maps.

Use canonical Glaze palette names throughout configuration and color
references. Replace `theme.palette.textSoft` with `theme.palette["text-soft"]`
and update any `base`, `target`, `bg`, or `fg` references to `"text-soft"`.
Camel-case palette names now fail validation.

The `colors` returned by `resolveColorTheme()` and `resolveDocsTheme()` also
use canonical names: `surface-2`, `surface-3`, `text-soft`, `accent-text`,
`accent-surface`, and `accent-surface-text`. Update property access to bracket
notation, for example `theme.colors["accent-text"]`.

Configure `theme.tokens` with `$name` keys, such as `$radius`. The old `--name`
configuration keys now fail validation; the emitted CSS custom properties
still use `--name`.

Built-in markup now uses Tasty’s `data-element` identities instead of
`data-tasty-anatomy`. Custom styles resolve through each owning definition.
Heading levels move from `Heading.Level1`–`Level6` to root property state maps
(`:is(h1)`–`:is(h6)`); Markdown wrappers use `[data-level=h1]`–`[data-level=h6]`.
Panel first/second-child padding moves into `MainContent.Panel` token state maps.
Header’s shared title/search defaults live on `Title` and `Search`; Footer’s
only-child and hover states live on `MetaLink`, `MetaUpdated`, and `CreditLink`.
For a custom component, use `defineComponent(name, options)`. For custom global
rules, pass `resolveComponentStyles(name, baseStyles)` to `useGlobalStyles()`.
Both merge `theme.customStyles[name]` into the complete base styles during
server rendering. See [custom components](./custom-components.md).
The compact language selector's former `Compact` hook is now a root state:
customize it with `LanguageSelect: { border: { "[data-compact]": "4px solid #border" } }`.

## 0.19.x to 0.20

Cookbook 0.20 generates a themed social preview image when a site has no
`site.seo.image`. If your host or sharing workflow expects a particular image,
set that field explicitly; use `false` to publish without a site-wide image.
Review [social preview configuration](./publishing.md#titles-and-social-previews)
after upgrading.

Cookbook requires a static Astro output. Adding it to an Astro project with
`output: "server"` now reports that requirement directly; create a separate
static documentation app for that case. Search and navigation received visual
and interaction updates without a configuration migration. Review any custom
`Search`, `SearchResults`, or header styles in a production preview.

## 0.18.x to 0.19

Cookbook now renders documentation with its own Astro components. The public
`@tenphi/cookbook` integration remains the normal entry point. Projects that
import the renderer package directly should replace `@tenphi/starlight` with
`@tenphi/renderer`.

The page and theme contracts remain familiar, but component overrides now read
`Astro.locals.cookbookRoute`. Replace uses of `Astro.locals.starlightRoute` in
your own overrides. The named style surfaces `StarlightHeader` and
`StarlightAside` become `Header` and `MarkdownAlert`; the unused Starlight card,
link-card, badge, and steps bridges are removed. Cookbook's `Card`, `Callout`,
and `Steps` components remain available.

Renderer class names now use Cookbook-owned names. Update any custom CSS or
scripts that target generated markup, and prefer the named `theme.styles`
surfaces in [Component styles](./component-styles.md).

The `plugins` integration option no longer forwards Starlight hooks. Move
content transforms to Astro's `markdown` configuration and use
`frontmatterSchema` for custom page metadata. GitHub alert blockquotes render
directly in Markdown and MDX, so `starlight-github-alerts` is no longer needed.
Use `cookbook doctor` and `cookbook check-build` instead of plugins that inspect
Starlight's content collection or physical docs files. See
[extending Cookbook](./plugins.md) for examples.

Build and preview each site after updating its package manifest. Check custom
component overrides, locale navigation, search, and Tasty style names before
deploying. Cookbook-saved appearance choices remain. Older Starlight-only
choices are ignored; visitors who relied on one can select their scheme again.

## 0.17.x to 0.18

These changes were introduced in 0.18:

- **Google fonts:** family-name shorthand loads preset weights and italics and
  self-hosts the files. The initial build requires network access. Preserve the
  Astro font cache for offline rebuilds, use local files for checked-in assets,
  or select `theme.fontLoading.google: "remote"` for CDN delivery. Weights set
  through CSS variables that cannot be resolved from presets require explicit
  `weights`. See [fonts](./fonts-and-typography.md#change-font-families).
- **Colors:** body tone 0 and heading tone 4 remain the reading defaults.
  The default logo uses fixed Glaze colors (`logo-surface` and `logo-mark`), so
  its book stays light in dark mode. Customize these independently of accents.
  Additional semantic-pair checks may reject custom colors that previously
  passed. Follow the named pair and mode in the diagnostic; see
  [contrast troubleshooting](./troubleshooting.md#contrast-failures).
- **Header controls:** round controls use `$header-control-radius`, independently
  of `$radius`. Set the new token to your preferred radius to keep your previous
  header shape.
- **Drafts:** production builds retain draft pages at direct URLs and mark them
  `noindex`. They are omitted from generated navigation, search, sitemaps, and
  agent indexes. A draft is public to anyone with the URL; use host access
  controls for private previews.
- **Plugins:** custom metadata is available to route middleware and through
  Cookbook's content API. Plugins that need Astro's synthetic content files or
  inject their own CSS require adaptation. See the tested
  [extension guide](./plugins.md).
- **Styles:** rendered inline styles are rejected. Move custom styling to Tasty
  and registered theme style trees. Keep these components server-rendered;
  browser scripts and `client:*` islands cannot import Cookbook styling, Tasty,
  or Glaze. Attach interaction scripts to the static markup. Isolated,
  sandboxed `Preview` content is the
  documented exception. The new surface inventory is in
  [Component styles](./component-styles.md).
- **Page text:** the footer offers copy/download Markdown by default. Set
  `site.seo.copyPage: false` to disable the controls and generated page files.
  Configure static host headers if raw Markdown must be excluded from indexing;
  see [deployment](./deployment.md).
- **Validation:** existing projects can add
  `"validate": "cookbook doctor && astro build && cookbook check-build"`
  to their scripts. `doctor` is explicitly a preflight; successful MDX compilation
  and deployment require the later checks.

Review locale navigation and canonical metadata after upgrading. Locale/version
links now target actual pages and available fallbacks instead of invented URLs.
A version switcher changes the selected route; configure navigation groups
explicitly when you want to curate which version trees are shown.

## 0.16 to 0.17

Use Node.js **22.19 or newer**. Cookbook 0.17 adopted Starlight 0.42.4 and added
Google/local font configuration, Glaze palette declarations, OpenAPI sources,
version navigation, plugin forwarding, agent instructions, and static discovery
files. These features are opt-in except for generated discovery metadata.
Version 0.17.1 restored strong body/heading colors with absolute Glaze tones.
If you added temporary contrast workarounds in 0.17.0, compare them with those
defaults before carrying them forward.

## 0.14 to 0.15

The Appearance panel combines the color scheme and contrast controls in
`ThemeSelect`. Replace `ThemeSelect` `Select` and `Picker` overrides with
`Trigger` and `Panel`, and move `ContrastSelect` overrides to the same
`ThemeSelect` panel and option sub-elements.

## Upgrading from before 0.14

The shared-configuration and source-identity changes shipped in **0.14.0**.
Apply these steps if your project still uses the earlier contracts:

- Move generated inline documentation configuration to `docs.config.ts` and use
  `cookbook()` in Astro. Existing explicit `cookbook({ config })` remains valid,
  but CLI commands read the shared configuration file.
- For nested Astro apps, put `root: "../.."` in `docs.config.ts`; paths resolve
  relative to that file. Individual sources may now specify `root` and `id`.
- Run `cookbook update` after changing a requested npm specifier. A lock for
  another range or tag is no longer accepted by package name alone.
- `rawHtml: "sanitize"` preserves safe HTML and removes executable markup and
  presentational attributes. Use `"strip"` for the former removal behavior;
  removal now emits a diagnostic. `"reject"` still fails validation.
- Unrecognized page frontmatter is kept in graph entry `metadata`. Use
  `content.frontmatter: "reject"` for the former strict behavior. Cookbook's
  recognized fields retain their validation.
- `slug` is now relative to the source mount, including when it starts with `/`.
  Use a separate source mount for an unrelated public route.
- Repeated files in separate source declarations create separate entries.
  Give mounts stable IDs and use `source:<id>/<source-path>` for explicit links.
  `entryBySource(path)` returns `undefined` for an ambiguous path; pass a source
  ID as its second argument. Graph entry IDs include the source ID.
- Unknown names in `theme.styles` are errors. Register user-authored component
  styles in `theme.customStyles`. Built-in component names and sub-elements
  provide strict editor checking; style objects still contain only overrides.
- `Tabs` now expects `Tab` children with accessible labels. It provides keyboard
  navigation and panels; use an ordinary custom component for a grouping layout.

See [authoring](./authoring.mdx) for component usage and
[working examples](./examples.md) for repository configuration patterns.
