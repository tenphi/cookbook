# Changelog

All notable changes to Cookbook are documented here. Package-specific details remain in `packages/*/CHANGELOG.md`.

## 0.11.1

### Patch Changes

- [#52](https://github.com/tenphi/cookbook/pull/52) [`c6ca1bd`](https://github.com/tenphi/cookbook/commit/c6ca1bd566b1a9167b13cafb8165899662d1e279) Thanks [@tenphi](https://github.com/tenphi)! - Reduce the default documentation heading weight and relax negative tracking for
  a calmer typography hierarchy while preserving body and branded bold weights.

## 0.11.0

### Minor Changes

- [#50](https://github.com/tenphi/cookbook/pull/50) [`66ab10c`](https://github.com/tenphi/cookbook/commit/66ab10cafc33d846a3f1fc46d04f0034223209af) Thanks [@tenphi](https://github.com/tenphi)! - Add Starlight-compatible edit links, Git last-updated metadata, multilingual
  configuration, splash and hero frontmatter, visible heading permalinks, and
  Tabler copy controls for ordinary code blocks. Improve the compact mobile
  header and expose all new themed surfaces through `theme.styles`. Generate a
  modern favicon, touch-icon, and web-app icon set by default, with custom source
  artwork available through `site.favicon`. Upgrade the renderer to Tasty 3.8.0.

## 0.10.2

### Patch Changes

- [#48](https://github.com/tenphi/cookbook/pull/48) [`8801739`](https://github.com/tenphi/cookbook/commit/8801739540b0c080d916c81b02120622da434573) Thanks [@tenphi](https://github.com/tenphi)! - Apply semantic typography through complete Tasty presets so every configured preset field reaches the rendered element.

## 0.10.1

### Patch Changes

- [#46](https://github.com/tenphi/cookbook/pull/46) [`1ca1405`](https://github.com/tenphi/cookbook/commit/1ca14057656a9725e9531697654a8aa64cb4eb81) Thanks [@tenphi](https://github.com/tenphi)! - Loosen the default heading tracking and apply semantic bold text through Tasty's inherited `strong` preset modifier.

## 0.10.0

### Minor Changes

- [#44](https://github.com/tenphi/cookbook/pull/44) [`0df2ffb`](https://github.com/tenphi/cookbook/commit/0df2ffb0df205f5e6ca190b7d8105fdf912272ea) Thanks [@tenphi](https://github.com/tenphi)! - Add configuration-based Tasty style customization for the sidebar, desktop
  table of contents, and mobile table of contents. Users provide only partial
  style overrides, which Cookbook merges into each complete base style tree. All
  `theme.styles` entries now use this single object shape; mode wrappers are no
  longer accepted. Complete sub-element metadata and typed suggestions are
  published for every configurable surface.

## 0.9.6

### Patch Changes

- [#41](https://github.com/tenphi/cookbook/pull/41) [`49b6155`](https://github.com/tenphi/cookbook/commit/49b615507a60f7f9422ed17a10ea70fe5d23b0f9) Thanks [@tenphi](https://github.com/tenphi)! - Truncate long sidebar and table-of-contents labels with an ellipsis instead of
  letting them overflow their navigation columns.

## 0.9.5

### Patch Changes

- [#38](https://github.com/tenphi/cookbook/pull/38) [`e515933`](https://github.com/tenphi/cookbook/commit/e51593387f09f66c0bb959a619226adf227ee5b2) Thanks [@tenphi](https://github.com/tenphi)! - Improve TSX and MDX syntax highlighting with distinct component, attribute,
  delimiter, and string colors.

## 0.9.4

### Patch Changes

- [#35](https://github.com/tenphi/cookbook/pull/35) [`4b1d043`](https://github.com/tenphi/cookbook/commit/4b1d043776860d77a7d576b30e3f5156f7182995) Thanks [@tenphi](https://github.com/tenphi)! - Remove redundant empty rows between lines in rendered diff code blocks.

## 0.9.3

### Patch Changes

- [#32](https://github.com/tenphi/cookbook/pull/32) [`be10cd5`](https://github.com/tenphi/cookbook/commit/be10cd58ab001a45afd87f5fd67a34f274cd00a5) Thanks [@tenphi](https://github.com/tenphi)! - Add configurable document head elements for analytics scripts and other remote resources.
- [#34](https://github.com/tenphi/cookbook/pull/34) [`e4ebf0a`](https://github.com/tenphi/cookbook/commit/e4ebf0a059266b1ca94ff86ca21372ce39bb0d31) Thanks [@tenphi](https://github.com/tenphi)! - Use the body text color for the footer credit and the brand color for its Cookbook link.

## 0.9.2

### Patch Changes

- [#30](https://github.com/tenphi/cookbook/pull/30) [`9362386`](https://github.com/tenphi/cookbook/commit/9362386506c472954f51d42f4045b1c5ee6324a6) Thanks [@tenphi](https://github.com/tenphi)! - Hide the native scheme-picker arrows on mobile, center the hamburger icon in its navigation button, and add a default Cookbook credit footer that can be replaced or disabled through component configuration.

## 0.9.1

### Patch Changes

- [#27](https://github.com/tenphi/cookbook/pull/27) [`e4bd0b0`](https://github.com/tenphi/cookbook/commit/e4bd0b085fa46e0654e4cc410e37f59d3530cce2) Thanks [@tenphi](https://github.com/tenphi)! - Tighten the spacing between adjacent Markdown list and description-list items.

## 0.9.0

### Minor Changes

- [#26](https://github.com/tenphi/cookbook/pull/26) [`0394323`](https://github.com/tenphi/cookbook/commit/039432304bc066f1bc7edea98b280e894e4ec1ec) Thanks [@tenphi](https://github.com/tenphi)! - Add theme-aware whole-line highlighting for insertions and deletions in `diff`
  code fences while preserving their visible markers.

### Patch Changes

- [#23](https://github.com/tenphi/cookbook/pull/23) [`0dfb05a`](https://github.com/tenphi/cookbook/commit/0dfb05ad2bfae7d3a434eb2377ce95e06c8e068e) Thanks [@tenphi](https://github.com/tenphi)! - Preload the embedded TSX grammar so MDX code fences receive complete syntax
  highlighting, and verify documented component styles against Tasty's preferred
  property forms.
- [#25](https://github.com/tenphi/cookbook/pull/25) [`bbb8e58`](https://github.com/tenphi/cookbook/commit/bbb8e58c5aa2c084b0cf8c9bcdb4c8ebde5908f8) Thanks [@tenphi](https://github.com/tenphi)! - Keep wide Markdown tables inside the content column and give each overflowing
  table its own horizontal scroll area.

## 0.8.0

### Minor Changes

- [#21](https://github.com/tenphi/cookbook/pull/21) [`49a21e5`](https://github.com/tenphi/cookbook/commit/49a21e5f4b92cc10dfa1905d32bc996dd8e47f83) Thanks [@tenphi](https://github.com/tenphi)! - Render fenced Mermaid diagrams at build time with responsive light and dark themes,
  and keep hyphenated placeholders such as `<plan-id>` consistently highlighted
  inside Bash code blocks.

## 0.7.0

### Minor Changes

- [#19](https://github.com/tenphi/cookbook/pull/19) [`318863a`](https://github.com/tenphi/cookbook/commit/318863af129665428fbee927001badf1c8745c1a) Thanks [@tenphi](https://github.com/tenphi)! - Style Starlight-owned documentation shell elements through Tasty global styles,
  generate every semantic and status color token with Glaze, and show the project
  logo beside the title in the top navigation bar. Expose the Glaze high-contrast
  palette through a persisted system, normal, or high-contrast appearance control,
  derive calmer borders at one quarter of the brand saturation, and soften the
  elevated surface ramp. Render the open-book logo mark with its Glaze-generated
  foreground token. Expose every direct Cookbook Tasty component through
  `theme.styles`, including `ContrastSelect`, and provide a configurable
  `MarkdownTable` style tree for Starlight-generated tables.

## 0.6.1

### Patch Changes

- [#17](https://github.com/tenphi/cookbook/pull/17) [`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53) Thanks [@tenphi](https://github.com/tenphi)! - Use the full Starlight theme, page outline, search, and Expressive Code renderer
  by default when a project does not define an Astro content collection.

## 0.6.0

### Minor Changes

- [#16](https://github.com/tenphi/cookbook/pull/16) [`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae) Thanks [@tenphi](https://github.com/tenphi)! - Add typed Cookbook component-style configuration with explicit extension and
  full-replacement modes, and expose the brand-colored Cookbook logo as a public
  Tasty component.
- [#16](https://github.com/tenphi/cookbook/pull/16) [`61abff2`](https://github.com/tenphi/cookbook/commit/61abff2c613022df2ab5f621540b8fc99010a895) Thanks [@tenphi](https://github.com/tenphi)! - Move Cookbook UI styling to linted Tasty components and selector styles backed
  by Glaze theme tokens, extract those styles into shared static CSS during Astro
  builds without shipping the Tasty client runtime, and support displaying the
  documented package version beside the site title, inferred from single-package
  npm sources when possible. Cookbook-owned layout, navigation, appearance,
  search, and header UI now use direct `tasty()` components whose defaults can be
  extended or fully replaced through `theme.styles`.

### Patch Changes

- [#14](https://github.com/tenphi/cookbook/pull/14) [`689bf56`](https://github.com/tenphi/cookbook/commit/689bf56abbe9d7ef9eaa76c809bf238eec1ee149) Thanks [@tenphi](https://github.com/tenphi)! - Keep the desktop header divider visible without navigation tabs, and frame
  plain Markdown code blocks with consistent padding, borders, and typography.

## 0.5.0

### Minor Changes

- [#11](https://github.com/tenphi/cookbook/pull/11) [`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53) Thanks [@tenphi](https://github.com/tenphi)! - Rename the project to Cookbook, publish the public integration as
  `@tenphi/cookbook`, and move the package creator to
  `@tenphi/create-cookbook`.

## 0.4.0

### Minor Changes

- [#9](https://github.com/tenphi/cookbook/pull/9) [`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390) Thanks [@tenphi](https://github.com/tenphi)! - Add independent per-tab sidebar trees with recursive nesting, route-based tab ownership, and matching standalone renderer support. Expose configured sections in mobile navigation, serve validated local content assets in development, attach the desktop tab row directly to its divider, tighten article spacing, refine responsive header and page-outline placement, and improve table readability and overflow behavior.

## 0.3.0

### Minor Changes

- [#7](https://github.com/tenphi/cookbook/pull/7) [`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b) Thanks [@tenphi](https://github.com/tenphi)! - Add a public layout-width token, center the complete documentation frame at a 1400px default maximum, and render a persistent divider beneath desktop navigation tabs.

## 0.2.1

### Patch Changes

- [#6](https://github.com/tenphi/cookbook/pull/6) [`45bbffa`](https://github.com/tenphi/cookbook/commit/45bbffa8d54efcbbd406178caa027b6eace0b0e1) Thanks [@tenphi](https://github.com/tenphi)! - Restore structural borders, use 6px control and 10px card radii, self-host
  Onest and JetBrains Mono as the default fonts, and align controls with the
  surface elevation state model and Tabler iconography. Selected navigation uses
  the fixed accent surface in every color scheme, and appearance controls use
  balanced icon, label, and outer spacing. Elevated surfaces use two-step Glaze
  tone intervals instead of approximate text blends. Buttons and search inputs
  use border-defined, shadow-free control styling. The documentation shell is now
  borderless and roomier, with quieter selected navigation, a compact appearance
  control, keyboard-labelled search, and optional primary navigation tabs.
- [#4](https://github.com/tenphi/cookbook/pull/4) [`db4d3c6`](https://github.com/tenphi/cookbook/commit/db4d3c60d0b182341158968dd557b03f8de28641) Thanks [@tenphi](https://github.com/tenphi)! - Apply the public card radius to Expressive Code frames without overriding the
  copy button's intrinsic dimensions.

## 0.2.0

### Minor Changes

- [#2](https://github.com/tenphi/cookbook/pull/2) [`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777) Thanks [@tenphi](https://github.com/tenphi)! - Add semantic palette inputs, public shape and layout tokens, composable typography presets with separate body and heading fonts, and consistent token-driven styling across both renderers.

## 0.1.1

### Patch Changes

- [`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c) Thanks [@tenphi](https://github.com/tenphi)! - Keep registry package discovery compatible with the documented Node 22.14 minimum.
- [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778) Thanks [@tenphi](https://github.com/tenphi)! - Render custom-loader Markdown bodies and map Cookbook navigation and component overrides into Starlight.
