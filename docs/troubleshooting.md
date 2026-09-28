---
title: Troubleshooting
description: Diagnose configuration, contrast, fonts, plugins, routes, and deployment failures.
---

Start with `cookbook doctor --json` for configuration, content graph, and local
asset diagnostics. Then build and run `cookbook check-build --json`. The checks
cover different stages; a healthy preflight does not compile MDX or fetch remote
fonts. See [CLI](./cli.md) for flags and diagnostic output.

## Contrast failures

Read the reported foreground/background pair, appearance mode, measured value,
and target. A passing light-mode color can fail in dark or high-contrast mode.
Keep `theme.brand: { from: "#d97706" }` simple, and let the semantic roles adapt.
For custom palette roles use Glaze `base`, absolute or relative `tone`, and
saturation factors. Body and heading colors normally use absolute tones 0 and 4.

A custom background also changes the contrast of text placed on it. Update the
related text declaration to name that background in `base` and set a suitable
`contrast` floor. A custom color name alone cannot tell Cookbook where you will
use it: declare its contrast relationship and review the actual component in all
four appearance modes. For mixed colors, consider a separate regular text role
whose `base` names the mixed background. See the
[palette reference](./theme-and-components.md#semantic-palette).

Do not lower a target just to silence a failure. Check overridden surface tones,
opacity, contrast adaptation settings, and whether the intended text is actually
using the right semantic token. Larger headings should remain close to body
contrast. Browser checks complement the numeric diagnostics.

## Missing or wrong fonts

- **Local file missing:** `/fonts/acme.woff2` means a file in the Astro public
  directory. Font paths must be root-relative public URLs. Run
  `doctor --public-dir ./static` if your Astro app uses a custom public directory.
- **Google request fails:** check the exact family name and supported weights and
  styles. Explicit requests reject missing styles; shorthand warns if italics
  are unavailable. See [font configuration](./theme-and-components.md#change-font-families).
- **Offline cache miss:** warm the cache with `cache: "reuse"` while online, and
  retain `<Astro cacheDir>/cookbook-fonts`. The key includes the requested family,
  weights, and styles. `cache: "refresh"` intentionally needs the network.
- **Wrong weight:** a static file cannot supply every intermediate weight. Use
  matching files or a variable range. Check `theme.presets`: an explicit
  `fontFamily` there takes precedence over the semantic font role.
- **Deployed 404:** verify Astro's `base`, the output files, and your host's asset
  paths with `check-build --url`. Self-hosted Google fonts should be requested
  from your site's `_cookbook/fonts/` directory.

## Incompatible plugins

Cookbook owns content routing and all rendered styles. Starlight plugins that
read its docs collection or inject CSS cannot run in the Astro renderer. GitHub
alerts are supported directly; use Cookbook's graph and built-output checks
for links. See [extending Cookbook](./plugins.md) for Astro Markdown plugins.

Read custom frontmatter through the server-only `@tenphi/cookbook/content` API
or `Astro.locals.cookbookRoute` in a component override. If a schema rejects data, check that
custom fields do not replace reserved Cookbook frontmatter and that parsed
values are JSON-safe. A plugin's successful registration is not proof that its
rendered output works.

## Missing pages or unexpected navigation

Check the source `glob`, `base`, `routeBase`, and frontmatter `slug` with
`doctor`. Use stable source IDs for repeated mounts and `source:<id>/<path>`
for ambiguous cross-source links. Public routes omit Astro's deployment `base`
in configuration; Cookbook adds it to rendered links.

A draft remains directly accessible in production but is unlisted. A missing
translation does not create a duplicate page: the language picker points to a
real default-language fallback, and locale navigation lists real translated
pages. Version roots need an existing home, including a localized home when
configured. See [locales and versions](./configuration.md).

## Preview indexing or deployment mismatch

Use `site.seo.index: false` for a preview build and disable page Markdown if your
host cannot add noindex headers to those files. This controls indexing; it does
not restrict access. Build separately for previews so preview metadata cannot
replace the public site's metadata.

Run `cookbook check-build --url https://preview.example.com/` against the exact
artifact you deployed. Failures can identify missing pages/assets, stale titles
or canonical metadata, and unexpected host noindex headers. A host returning
HTML for a missing asset is also a failure. Check redirects, base paths, output
directory, and the uploaded artifact. See the [deployment recipe](./deployment.md).
