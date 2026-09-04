# @tenphi/docs

## 0.11.0

### Minor Changes

- [#50](https://github.com/tenphi/cookbook/pull/50) [`66ab10c`](https://github.com/tenphi/cookbook/commit/66ab10cafc33d846a3f1fc46d04f0034223209af) Thanks [@tenphi](https://github.com/tenphi)! - Add Starlight-compatible edit links, Git last-updated metadata, multilingual
  configuration, splash and hero frontmatter, visible heading permalinks, and
  Tabler copy controls for ordinary code blocks. Improve the compact mobile
  header and expose all new themed surfaces through `theme.styles`. Generate a
  modern favicon, touch-icon, and web-app icon set by default, with custom source
  artwork available through `site.favicon`. Upgrade the renderer to Tasty 3.8.0.

## 0.10.2

## 0.10.1

## 0.10.0

### Minor Changes

- [#44](https://github.com/tenphi/cookbook/pull/44) [`0df2ffb`](https://github.com/tenphi/cookbook/commit/0df2ffb0df205f5e6ca190b7d8105fdf912272ea) Thanks [@tenphi](https://github.com/tenphi)! - Add configuration-based Tasty style customization for the sidebar, desktop
  table of contents, and mobile table of contents. Users provide only partial
  style overrides, which Cookbook merges into each complete base style tree. All
  `theme.styles` entries now use this single object shape; mode wrappers are no
  longer accepted. Complete sub-element metadata and typed suggestions are
  published for every configurable surface.

## 0.9.6

## 0.9.5

## 0.9.4

## 0.9.3

### Patch Changes

- [#32](https://github.com/tenphi/cookbook/pull/32) [`be10cd5`](https://github.com/tenphi/cookbook/commit/be10cd58ab001a45afd87f5fd67a34f274cd00a5) Thanks [@tenphi](https://github.com/tenphi)! - Add configurable document head elements for analytics scripts and other remote resources.

## 0.9.2

### Patch Changes

- [#30](https://github.com/tenphi/cookbook/pull/30) [`9362386`](https://github.com/tenphi/cookbook/commit/9362386506c472954f51d42f4045b1c5ee6324a6) Thanks [@tenphi](https://github.com/tenphi)! - Hide the native scheme-picker arrows on mobile, center the hamburger icon in its navigation button, and add a default Cookbook credit footer that can be replaced or disabled through component configuration.

## 0.9.1

## 0.9.0

## 0.8.0

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

## 0.2.0

### Minor Changes

- [#2](https://github.com/tenphi/cookbook/pull/2) [`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777) Thanks [@tenphi](https://github.com/tenphi)! - Add semantic palette inputs, public shape and layout tokens, composable typography presets with separate body and heading fonts, and consistent token-driven styling across both renderers.

## 0.1.1

### Patch Changes

- [`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c) Thanks [@tenphi](https://github.com/tenphi)! - Keep registry package discovery compatible with the documented Node 22.14 minimum.

- [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778) Thanks [@tenphi](https://github.com/tenphi)! - Render custom-loader Markdown bodies and map Cookbook navigation and component overrides into Starlight.
