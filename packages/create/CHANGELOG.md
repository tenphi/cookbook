# @tenphi/create-cookbook

## 0.15.1

### Patch Changes

- Updated dependencies [[`66a8aa2`](https://github.com/tenphi/cookbook/commit/66a8aa2d4b2d8be916a5a5bb13fed0e54d18638c)]:
  - @tenphi/docs@0.15.1

## 0.15.0

### Patch Changes

- Updated dependencies [[`9c373f1`](https://github.com/tenphi/cookbook/commit/9c373f105d8a77cadb0f90d1e0b95024527c8b7c)]:
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

## 0.13.0

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.12.0

## 0.11.3

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.11.2

## 0.11.1

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [[`66ab10c`](https://github.com/tenphi/cookbook/commit/66ab10cafc33d846a3f1fc46d04f0034223209af)]:
  - @tenphi/docs@0.11.0

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`0df2ffb`](https://github.com/tenphi/cookbook/commit/0df2ffb0df205f5e6ca190b7d8105fdf912272ea)]:
  - @tenphi/docs@0.10.0

## 0.9.6

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.9.6

## 0.9.5

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.9.5

## 0.9.4

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.9.4

## 0.9.3

### Patch Changes

- Updated dependencies [[`be10cd5`](https://github.com/tenphi/cookbook/commit/be10cd58ab001a45afd87f5fd67a34f274cd00a5)]:
  - @tenphi/docs@0.9.3

## 0.9.2

### Patch Changes

- Updated dependencies [[`9362386`](https://github.com/tenphi/cookbook/commit/9362386506c472954f51d42f4045b1c5ee6324a6)]:
  - @tenphi/docs@0.9.2

## 0.9.1

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`318863a`](https://github.com/tenphi/cookbook/commit/318863af129665428fbee927001badf1c8745c1a)]:
  - @tenphi/docs@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53)]:
  - @tenphi/docs@0.6.1

## 0.6.0

### Patch Changes

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

### Patch Changes

- Updated dependencies [[`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390)]:
  - @tenphi/docs@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies [[`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b)]:
  - @tenphi/docs@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @tenphi/docs@0.2.1

## 0.2.0

### Patch Changes

- Updated dependencies [[`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777)]:
  - @tenphi/docs@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c), [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778)]:
  - @tenphi/docs@0.1.1
