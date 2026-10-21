---
title: Quality checks
description: Validate a documentation site, see which environments Cookbook supports, and review its output budgets.
---

## Check your documentation site

Run `npm run validate` in a generated project: it type-checks the project,
checks the configuration and local files, builds the site, and validates the
output. After deploying, run
`npx @tenphi/cookbook check-build --url https://docs.example.com/` against the
same build. See [CLI validation](./cli.md#check-the-built-site-and-deployment)
for coverage and preview-host behavior.

Also review keyboard navigation, mobile layouts, and all four light/dark and
normal/high-contrast combinations after changing styles. Automated accessibility
checks supplement this review; they do not establish complete accessibility.

## Supported environments

Cookbook's CI covers npm, pnpm, and Yarn installations, Node 22/24/26, and
Linux, macOS, and Windows in representative combinations. Yarn uses its
`node-modules` linker; Plug'n'Play is not covered. A weekly upstream canary
installs the newest Astro version allowed by Cookbook's peer range and builds
a packed consumer site. The same network-enabled canary runs the real Google
Fonts download check and a 1,000-page benchmark build. Cookbook's own
published documentation is checked after deployment against its uploaded build
artifact.

## Performance budgets and corpus measurements

The reference build enforces separate limits for initial page JavaScript,
lazy search assets, font files, images, and extracted Tasty CSS. A default guide
currently loads about 22 KB of first-party JavaScript initially (about 10 KB
gzipped), including Astro's built-in hover prefetching; search and the client
router remain lazy. The initial JavaScript budget is 24 KiB.
The checked reference output contains about 73 KB of fonts, 66 KB of images and
icons, and a 181 KB shared stylesheet. The guide's first-party HTML, CSS, and
initial JavaScript total about 40 KB when gzipped. Actual network transfers vary
with hosting compression and caching. None of these figures include external
analytics.

A local macOS / Node 22.22 run processed 500 pages with 10,000 headings in about
1.1 seconds and built that site in 33.5 seconds. A 1,000-page / 20,000-heading
graph took about 2.8 seconds, with roughly 499 MiB RSS after three runs. These are
observations on one machine, not throughput guarantees. The full-build corpus
uses explicit minimal navigation so the measurement is not dominated by repeating
hundreds of sidebar links in every page.

Cookbook's own test suite, browser checks, and benchmark commands are described
in the repository's
[contributing guide](https://github.com/tenphi/cookbook/blob/main/CONTRIBUTING.md#verification-suite).
