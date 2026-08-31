# @tenphi/starlight

## 0.6.1

### Patch Changes

- [#17](https://github.com/tenphi/cookbook/pull/17) [`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53) Thanks [@tenphi](https://github.com/tenphi)! - Use the full Starlight theme, page outline, search, and Expressive Code renderer
  by default when a project does not define an Astro content collection.
- Updated dependencies [[`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53)]:
  - @tenphi/docs@0.6.1

## 0.6.0

### Minor Changes

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
- Updated dependencies [[`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae)]:
  - @tenphi/docs@0.6.0

## 0.5.0

### Minor Changes

- [#11](https://github.com/tenphi/cookbook/pull/11) [`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53) Thanks [@tenphi](https://github.com/tenphi)! - Rename the project to Cookbook, publish the public integration as
  `@tenphi/cookbook`, and move the package creator to
  `@tenphi/create-cookbook`.

### Patch Changes

- Updated dependencies [[`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53)]:
  - @tenphi/docs@0.5.0

## 0.4.0

### Minor Changes

- [#9](https://github.com/tenphi/cookbook/pull/9) [`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390) Thanks [@tenphi](https://github.com/tenphi)! - Add independent per-tab sidebar trees with recursive nesting, route-based tab ownership, and matching standalone renderer support. Expose configured sections in mobile navigation, serve validated local content assets in development, attach the desktop tab row directly to its divider, tighten article spacing, refine responsive header and page-outline placement, and improve table readability and overflow behavior.

### Patch Changes

- Updated dependencies [[`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390)]:
  - @tenphi/docs@0.4.0

## 0.3.0

### Minor Changes

- [#7](https://github.com/tenphi/cookbook/pull/7) [`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b) Thanks [@tenphi](https://github.com/tenphi)! - Add a public layout-width token, center the complete documentation frame at a 1400px default maximum, and render a persistent divider beneath desktop navigation tabs.

### Patch Changes

- Updated dependencies [[`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b)]:
  - @tenphi/docs@0.3.0

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
- Updated dependencies []:
  - @tenphi/docs@0.2.1

## 0.2.0

### Minor Changes

- [#2](https://github.com/tenphi/cookbook/pull/2) [`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777) Thanks [@tenphi](https://github.com/tenphi)! - Add semantic palette inputs, public shape and layout tokens, composable typography presets with separate body and heading fonts, and consistent token-driven styling across both renderers.

### Patch Changes

- Updated dependencies [[`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777)]:
  - @tenphi/docs@0.2.0

## 0.1.1

### Patch Changes

- [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778) Thanks [@tenphi](https://github.com/tenphi)! - Render custom-loader Markdown bodies and map Cookbook navigation and component overrides into Starlight.

- Updated dependencies [[`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c), [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778)]:
  - @tenphi/docs@0.1.1
