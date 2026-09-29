---
title: Quality checks
description: Validate a site, understand the consumer test matrix, and measure output budgets.
---

## For your documentation site

Run `npm run validate` in a generated project: it checks the configuration and
local files, builds the site, and validates the output. After deploying, run
`npx @tenphi/cookbook check-build --url https://docs.example.com/` against the
same build. See [CLI validation](./cli.md#check-the-built-site-and-deployment)
for coverage and preview-host behavior.

Also review keyboard navigation, mobile layouts, and all four light/dark and
normal/high-contrast combinations after changing styles. Automated accessibility
checks supplement this review; they do not establish complete accessibility.

## Cookbook's verification suite

Repository contributors can run these checks after `pnpm build`:

| Command                      | Coverage                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm test`                  | Configuration, graph, rendering helpers, diagnostics, and interaction logic                  |
| `pnpm check:locales`         | Real locale/fallback/navigation consumers                                                    |
| `pnpm check:publishing-site` | Combined base paths, locales, versions, drafts, SEO, and agent Markdown                      |
| `pnpm check:theming`         | Consumer components, colors, units, recipes, presets, overrides, and logos                   |
| `pnpm check:fonts`           | Real Google variable/italic fonts, local fonts, and offline cache rebuild                    |
| `pnpm check:plugins`         | Tested plugin contracts and actionable incompatibility failures                              |
| `pnpm check:recipes`         | Extract, type-check, build, and validate documented configurations verbatim                  |
| `pnpm check:authoring`       | Custom highlighting, code groups, mobile contents, hero images, and OpenAPI                  |
| `pnpm check:browser`         | Chromium keyboard/focus, search, copy actions, appearance, mobile navigation, and axe checks |
| `pnpm check:install`         | Clean installation and build from packed artifacts, including lint/type exports              |
| `pnpm check:benchmark`       | A generated 500-page corpus with 10,000 headings and code samples                            |

Install the browser once with `pnpm exec playwright install chromium`.
CI covers npm, pnpm, and Yarn installations, Node 22/24/26, and Linux, macOS,
and Windows in representative combinations. Yarn uses its `node-modules` linker;
Plug'n'Play is not covered. The weekly upstream canary installs the newest Astro
version allowed by Cookbook's peer range and actually builds the packed consumer.
Google Fonts checks run in that network-enabled canary. Published documentation
is checked after deployment against its uploaded build artifact.

The lint consumer uses TypeScript 6 for the typescript-eslint parser and the
workspace TypeScript compiler for public API checks; typescript-eslint currently
rejects the TypeScript 7 API. Runtime compilation and lint parsing are separate.

## Performance budgets and corpus measurements

The reference build enforces separate limits for initial page JavaScript,
lazy search assets, font files, images, and extracted Tasty CSS. A default guide
currently loads about 9 KB of first-party JavaScript initially; search is lazy.
The checked reference output contains about 73 KB of fonts, 66 KB of images and
icons, and a 189 KB shared stylesheet. The guide's first-party HTML, CSS, and
initial JavaScript total about 33 KB when gzipped. Actual network transfers vary
with hosting compression and caching. `node scripts/check-reference-budgets.mjs`
prints current raw budgets and the gzip estimate; neither includes external
analytics.

A local macOS / Node 22.22 run processed 500 pages with 10,000 headings in about
1.1 seconds and built that site in 33.5 seconds. A 1,000-page / 20,000-heading
graph took about 2.8 seconds, with roughly 499 MiB RSS after three runs. These are
observations on one machine, not throughput guarantees. The full-build corpus
uses explicit minimal navigation so the measurement is not dominated by repeating
hundreds of sidebar links in every page.

```sh
COOKBOOK_BENCH_PAGES=1000 COOKBOOK_BENCH_BUILD=1 pnpm check:benchmark
COOKBOOK_TEST_MANAGER=pnpm pnpm check:install
COOKBOOK_TEST_UPSTREAM=1 pnpm check:install
```

Investigate regressions before changing a budget. CI retains browser traces on
failure, and the benchmark reports graph timings, memory, and optional build time.
