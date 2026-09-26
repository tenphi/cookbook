# @tenphi/cookbook

## 0.17.0

### Minor Changes

- [#75](https://github.com/tenphi/cookbook/pull/75) [`f4f5f13`](https://github.com/tenphi/cookbook/commit/f4f5f132e83e6e5c60dedd91a5e7dcfc4a0673ac) Thanks [@tenphi](https://github.com/tenphi)! - Generate project instructions for coding agents and publish a documentation index and sitemap-aware robots file with static Cookbook sites. Add a guide for agent-assisted setup and checking deployed documentation.

- [#76](https://github.com/tenphi/cookbook/pull/76) [`c4589b8`](https://github.com/tenphi/cookbook/commit/c4589b824ff6404863d30f388e8f56a9c6b86a19) Thanks [@tenphi](https://github.com/tenphi)! - Add static OpenAPI reference pages, documentation version navigation, Starlight plugin forwarding, and Netlify, Cloudflare Pages, and Vercel creator presets. Require Node.js 22.19 or newer and deploy the Cookbook reference site from its release tag.
  Upgrade Starlight to 0.42.4 and add agent skills for Starlight upgrades in Cookbook and Cookbook upgrades in generated sites.

- [#73](https://github.com/tenphi/cookbook/pull/73) [`09d7152`](https://github.com/tenphi/cookbook/commit/09d7152c8bfffba01d76bf28f51b7bac047b3941) Thanks [@tenphi](https://github.com/tenphi)! - Add `theme.fonts` for Google Fonts families and local font files, with semantic body, heading, and code roles. Load font faces through Tasty, validate local files at build time, and make font definitions replaceable in shared config presets.

- [#77](https://github.com/tenphi/cookbook/pull/77) [`0af1bdc`](https://github.com/tenphi/cookbook/commit/0af1bdc295671d4384736ae8c4f0cd056614c416) Thanks [@tenphi](https://github.com/tenphi)! - Accept Glaze color declarations for the brand and semantic palette, including tone, base, and contrast targets. Use declarations in the reference site and theme guides while retaining literal color seed compatibility.

### Patch Changes

- Updated dependencies [[`f4f5f13`](https://github.com/tenphi/cookbook/commit/f4f5f132e83e6e5c60dedd91a5e7dcfc4a0673ac), [`c4589b8`](https://github.com/tenphi/cookbook/commit/c4589b824ff6404863d30f388e8f56a9c6b86a19), [`09d7152`](https://github.com/tenphi/cookbook/commit/09d7152c8bfffba01d76bf28f51b7bac047b3941), [`0af1bdc`](https://github.com/tenphi/cookbook/commit/0af1bdc295671d4384736ae8c4f0cd056614c416)]:
  - @tenphi/docs@0.17.0
  - @tenphi/starlight@0.17.0

## 0.16.0

### Minor Changes

- [#70](https://github.com/tenphi/cookbook/pull/70) [`b522b14`](https://github.com/tenphi/cookbook/commit/b522b14994c1bec2adeadc6efcdb07f0ac35c9c9) Thanks [@tenphi](https://github.com/tenphi)! - Ship Cookbook documentation with the public package, including consumer
  customization rules and versioned Tasty and Glaze reference snapshots with
  local links. Expose documentation paths through `@tenphi/cookbook/docs/*` for
  tooling and document how projects can guide coding agents and lint custom styles.
  Set an explicit package documentation index so the bundled guide has a single
  home route when used as a Cookbook content source.

- [#72](https://github.com/tenphi/cookbook/pull/72) [`db5339d`](https://github.com/tenphi/cookbook/commit/db5339d7298df9b8912003ff5ff96398c7692033) Thanks [@tenphi](https://github.com/tenphi)! - Add configurable header buttons with a mobile More menu, a translucent blurred
  header, and a mobile navigation row opening a left drawer with a section
  selector. Hide the table of contents on tablet and mobile, retain plain icon
  button styling, and expose the new layout, header, search, and drawer surfaces
  through theme styles and the header palette role.

### Patch Changes

- Updated dependencies [[`7696043`](https://github.com/tenphi/cookbook/commit/76960432f481be38fb67e1669196dc6b8ef2efe0), [`66a8aa2`](https://github.com/tenphi/cookbook/commit/66a8aa2d4b2d8be916a5a5bb13fed0e54d18638c), [`037160c`](https://github.com/tenphi/cookbook/commit/037160cd9093911b6b58cb2dcb95aba2c5ca060a), [`7caaa59`](https://github.com/tenphi/cookbook/commit/7caaa597fdc37d4f6616c25cbc0e11299949954b), [`db5339d`](https://github.com/tenphi/cookbook/commit/db5339d7298df9b8912003ff5ff96398c7692033)]:
  - @tenphi/docs@0.16.0
  - @tenphi/starlight@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [[`9c373f1`](https://github.com/tenphi/cookbook/commit/9c373f105d8a77cadb0f90d1e0b95024527c8b7c)]:
  - @tenphi/starlight@0.15.0
  - @tenphi/docs@0.15.0

## 0.14.0

### Minor Changes

- [#64](https://github.com/tenphi/cookbook/pull/64) [`20b0233`](https://github.com/tenphi/cookbook/commit/20b023330baaa3d87125df552601687c13003487) Thanks [@tenphi](https://github.com/tenphi)! - Unify project configuration across Astro and the CLI, support local repository starters, reconcile declared package sources with locks, and restore the development server and content watching.

  Add source IDs and roots, repeated mounts, scoped slugs, explicit cross-source links, redirects, reusable configuration presets, HTML sanitization, preserved page metadata, typed component styles and props, and accessible tabs, callouts, and code groups. Update guides and add development and public API regression checks.

  Breaking prerelease changes: locks must match requested package specifiers; slugs are relative to source mounts; safe HTML is preserved by `sanitize` (use `strip` for removal); custom styles move to `theme.customStyles`; `Tabs` expects labeled `Tab` panels. See the migration guide.

- [#62](https://github.com/tenphi/cookbook/pull/62) [`990f3a7`](https://github.com/tenphi/cookbook/commit/990f3a79de225086cf3b5d2376817b0ed9a41c74) Thanks [@tenphi](https://github.com/tenphi)! - Upgrade the renderer to Astro 7.3 and Starlight 0.42, adopt Starlight's
  Popover-based mobile navigation, and use a single graph-backed rendering path
  that is independent of Astro content collections. Render trusted MDX through
  Starlight with relative imports intact, restore a generated 404 page, and
  support content-hashed local hero images, including deployments under Astro
  base paths.

  Harden locked npm content by confining package paths and globs to the artifact,
  revalidating cached trees, rejecting ambiguous lock matches, removing raw HTML
  from untrusted Markdown and HTML-capable frontmatter. Rewrite reference-style
  links and images plus local downloadable files as hashed static assets.

  Align page frontmatter with Starlight (`tableOfContents`, `pagefind`, and
  `banner`), apply sidebar metadata to generated navigation, connect site URL and
  repository metadata to Astro/Starlight, implement repository-link localization
  and explicit raw HTML policies, remove the remaining inactive configuration
  keys, and strengthen runtime and JSON Schema validation.

  Generate projects with the creator's matching Cookbook release, typed
  configuration, and package-manager-aware GitHub Pages workflows. Standardize
  CLI JSON output and report empty documentation graphs as errors.

### Patch Changes

- Updated dependencies [[`20b0233`](https://github.com/tenphi/cookbook/commit/20b023330baaa3d87125df552601687c13003487), [`990f3a7`](https://github.com/tenphi/cookbook/commit/990f3a79de225086cf3b5d2376817b0ed9a41c74)]:
  - @tenphi/docs@0.14.0
  - @tenphi/starlight@0.14.0

## 0.13.0

### Minor Changes

- [#60](https://github.com/tenphi/cookbook/pull/60) [`f7185c5`](https://github.com/tenphi/cookbook/commit/f7185c5695b6bf2bd1142ee557b64ce930a1636c) Thanks [@tenphi](https://github.com/tenphi)! - Re-export the Tasty ESLint plugin, recommended and strict rule maps, and a
  Cookbook validation preset through `/eslint-plugin`. Document and verify
  consumer style linting with ESLint and oxlint, including shared tokens,
  responsive aliases, typography presets, and Cookbook styling imports.
  Support `extends: "@tenphi/cookbook"` and `extends: "@tenphi/starlight"` so
  consumers can add theme names without copying the preset's arrays.

### Patch Changes

- Updated dependencies [[`f7185c5`](https://github.com/tenphi/cookbook/commit/f7185c5695b6bf2bd1142ee557b64ce930a1636c)]:
  - @tenphi/starlight@0.13.0
  - @tenphi/docs@0.13.0

## 0.12.0

### Minor Changes

- [#58](https://github.com/tenphi/cookbook/pull/58) [`e1df4df`](https://github.com/tenphi/cookbook/commit/e1df4df0ff1a9f0a6cbfa7da52ec8e2c2a876e58) Thanks [@tenphi](https://github.com/tenphi)! - Expose Tasty component and global styling tools through `/styling`, including
  typed style objects and `defineComponent(name, options)` for creating
  consumer-owned components with `theme.styles` merged into their defaults.
  Preserve Tasty's generated subcomponents and inferred prop types. Document a
  custom site title with an aligned, linked logo and verify CSS extraction from
  a clean package installation.

### Patch Changes

- Updated dependencies [[`e1df4df`](https://github.com/tenphi/cookbook/commit/e1df4df0ff1a9f0a6cbfa7da52ec8e2c2a876e58)]:
  - @tenphi/starlight@0.12.0
  - @tenphi/docs@0.12.0

## 0.11.3

### Patch Changes

- Updated dependencies [[`d937549`](https://github.com/tenphi/cookbook/commit/d937549b46ab27b02fa171fbbf06faeca66c21fa)]:
  - @tenphi/starlight@0.11.3
  - @tenphi/docs@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies [[`485eb46`](https://github.com/tenphi/cookbook/commit/485eb4612f4293cfad6b83e0971904c5c828c4b6)]:
  - @tenphi/starlight@0.11.2
  - @tenphi/docs@0.11.2

## 0.11.1

### Patch Changes

- Updated dependencies [[`c6ca1bd`](https://github.com/tenphi/cookbook/commit/c6ca1bd566b1a9167b13cafb8165899662d1e279)]:
  - @tenphi/starlight@0.11.1
  - @tenphi/docs@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [[`66ab10c`](https://github.com/tenphi/cookbook/commit/66ab10cafc33d846a3f1fc46d04f0034223209af)]:
  - @tenphi/docs@0.11.0
  - @tenphi/starlight@0.11.0

## 0.10.2

### Patch Changes

- Updated dependencies [[`8801739`](https://github.com/tenphi/cookbook/commit/8801739540b0c080d916c81b02120622da434573)]:
  - @tenphi/starlight@0.10.2
  - @tenphi/docs@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies [[`1ca1405`](https://github.com/tenphi/cookbook/commit/1ca14057656a9725e9531697654a8aa64cb4eb81)]:
  - @tenphi/starlight@0.10.1
  - @tenphi/docs@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`0df2ffb`](https://github.com/tenphi/cookbook/commit/0df2ffb0df205f5e6ca190b7d8105fdf912272ea)]:
  - @tenphi/docs@0.10.0
  - @tenphi/starlight@0.10.0

## 0.9.6

### Patch Changes

- Updated dependencies [[`49b6155`](https://github.com/tenphi/cookbook/commit/49b615507a60f7f9422ed17a10ea70fe5d23b0f9)]:
  - @tenphi/starlight@0.9.6
  - @tenphi/docs@0.9.6

## 0.9.5

### Patch Changes

- Updated dependencies [[`e515933`](https://github.com/tenphi/cookbook/commit/e51593387f09f66c0bb959a619226adf227ee5b2)]:
  - @tenphi/starlight@0.9.5
  - @tenphi/docs@0.9.5

## 0.9.4

### Patch Changes

- Updated dependencies [[`4b1d043`](https://github.com/tenphi/cookbook/commit/4b1d043776860d77a7d576b30e3f5156f7182995)]:
  - @tenphi/starlight@0.9.4
  - @tenphi/docs@0.9.4

## 0.9.3

### Patch Changes

- Updated dependencies [[`be10cd5`](https://github.com/tenphi/cookbook/commit/be10cd58ab001a45afd87f5fd67a34f274cd00a5), [`e4ebf0a`](https://github.com/tenphi/cookbook/commit/e4ebf0a059266b1ca94ff86ca21372ce39bb0d31)]:
  - @tenphi/docs@0.9.3
  - @tenphi/starlight@0.9.3

## 0.9.2

### Patch Changes

- Updated dependencies [[`9362386`](https://github.com/tenphi/cookbook/commit/9362386506c472954f51d42f4045b1c5ee6324a6)]:
  - @tenphi/docs@0.9.2
  - @tenphi/starlight@0.9.2

## 0.9.1

### Patch Changes

- Updated dependencies [[`e4bd0b0`](https://github.com/tenphi/cookbook/commit/e4bd0b085fa46e0654e4cc410e37f59d3530cce2)]:
  - @tenphi/starlight@0.9.1
  - @tenphi/docs@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`0dfb05a`](https://github.com/tenphi/cookbook/commit/0dfb05ad2bfae7d3a434eb2377ce95e06c8e068e), [`bbb8e58`](https://github.com/tenphi/cookbook/commit/bbb8e58c5aa2c084b0cf8c9bcdb4c8ebde5908f8), [`0394323`](https://github.com/tenphi/cookbook/commit/039432304bc066f1bc7edea98b280e894e4ec1ec)]:
  - @tenphi/starlight@0.9.0
  - @tenphi/docs@0.9.0

## 0.8.0

### Minor Changes

- [#21](https://github.com/tenphi/cookbook/pull/21) [`49a21e5`](https://github.com/tenphi/cookbook/commit/49a21e5f4b92cc10dfa1905d32bc996dd8e47f83) Thanks [@tenphi](https://github.com/tenphi)! - Render fenced Mermaid diagrams at build time with responsive light and dark themes,
  and keep hyphenated placeholders such as `<plan-id>` consistently highlighted
  inside Bash code blocks.

### Patch Changes

- Updated dependencies [[`49a21e5`](https://github.com/tenphi/cookbook/commit/49a21e5f4b92cc10dfa1905d32bc996dd8e47f83)]:
  - @tenphi/starlight@0.8.0
  - @tenphi/docs@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`318863a`](https://github.com/tenphi/cookbook/commit/318863af129665428fbee927001badf1c8745c1a)]:
  - @tenphi/docs@0.7.0
  - @tenphi/starlight@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53)]:
  - @tenphi/starlight@0.6.1
  - @tenphi/docs@0.6.1

## 0.6.0

### Minor Changes

- [#16](https://github.com/tenphi/cookbook/pull/16) [`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae) Thanks [@tenphi](https://github.com/tenphi)! - Add typed Cookbook component-style configuration with explicit extension and
  full-replacement modes, and expose the brand-colored Cookbook logo as a public
  Tasty component.

### Patch Changes

- Updated dependencies [[`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae), [`61abff2`](https://github.com/tenphi/cookbook/commit/61abff2c613022df2ab5f621540b8fc99010a895), [`689bf56`](https://github.com/tenphi/cookbook/commit/689bf56abbe9d7ef9eaa76c809bf238eec1ee149)]:
  - @tenphi/docs@0.6.0
  - @tenphi/starlight@0.6.0

## 0.5.0

### Minor Changes

- [#11](https://github.com/tenphi/cookbook/pull/11) [`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53) Thanks [@tenphi](https://github.com/tenphi)! - Rename the project to Cookbook, publish the public integration as
  `@tenphi/cookbook`, and move the package creator to
  `@tenphi/create-cookbook`.

### Patch Changes

- Updated dependencies [[`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53)]:
  - @tenphi/docs@0.5.0
  - @tenphi/starlight@0.5.0

## 0.4.0

### Minor Changes

- [#9](https://github.com/tenphi/cookbook/pull/9) [`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390) Thanks [@tenphi](https://github.com/tenphi)! - Add independent per-tab sidebar trees with recursive nesting, route-based tab ownership, and matching standalone renderer support. Expose configured sections in mobile navigation, serve validated local content assets in development, attach the desktop tab row directly to its divider, tighten article spacing, refine responsive header and page-outline placement, and improve table readability and overflow behavior.

### Patch Changes

- Updated dependencies [[`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390)]:
  - @tenphi/docs@0.4.0
  - @tenphi/starlight@0.4.0

## 0.3.0

### Minor Changes

- [#7](https://github.com/tenphi/cookbook/pull/7) [`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b) Thanks [@tenphi](https://github.com/tenphi)! - Add a public layout-width token, center the complete documentation frame at a 1400px default maximum, and render a persistent divider beneath desktop navigation tabs.

### Patch Changes

- Updated dependencies [[`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b)]:
  - @tenphi/docs@0.3.0
  - @tenphi/starlight@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [[`45bbffa`](https://github.com/tenphi/cookbook/commit/45bbffa8d54efcbbd406178caa027b6eace0b0e1), [`db4d3c6`](https://github.com/tenphi/cookbook/commit/db4d3c60d0b182341158968dd557b03f8de28641)]:
  - @tenphi/starlight@0.2.1
  - @tenphi/docs@0.2.1

## 0.2.0

### Minor Changes

- [#2](https://github.com/tenphi/cookbook/pull/2) [`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777) Thanks [@tenphi](https://github.com/tenphi)! - Add semantic palette inputs, public shape and layout tokens, composable typography presets with separate body and heading fonts, and consistent token-driven styling across both renderers.

### Patch Changes

- Updated dependencies [[`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777)]:
  - @tenphi/docs@0.2.0
  - @tenphi/starlight@0.2.0

## 0.1.1

### Patch Changes

- [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778) Thanks [@tenphi](https://github.com/tenphi)! - Render custom-loader Markdown bodies and map Cookbook navigation and component overrides into Starlight.

- Updated dependencies [[`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c), [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778)]:
  - @tenphi/docs@0.1.1
  - @tenphi/starlight@0.1.1
