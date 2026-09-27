---
title: Upgrade Cookbook
description: Version-specific changes, runtime upgrades, and documentation-source updates.
sidebar:
  order: 9
---

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

## 0.17.x to 0.18

These changes are included in the next minor release:

- **Google fonts:** family-name shorthand loads preset weights and italics and
  self-hosts the files. The initial build requires network access. Preserve the
  Astro font cache for offline rebuilds, use local files for checked-in assets,
  or select `theme.fontLoading.google: "remote"` for CDN delivery. See
  [fonts](./theme-and-components.md#change-font-families).
- **Colors:** body tone 0 and heading tone 4 remain the reading defaults.
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
  [plugin matrix](./plugins.md#verified-compatibility).
- **Styles:** rendered inline styles are rejected. Move custom styling to Tasty
  and registered theme style trees. Isolated, sandboxed `Preview` content is the
  documented exception. The new surface inventory is in the
  [theme reference](./theme-and-components.md).
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
