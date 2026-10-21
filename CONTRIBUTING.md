# Contributing

Use Node.js 22.19+ and pnpm 11. Run `pnpm install`, then `pnpm test`,
`pnpm typecheck`, and `pnpm build`. Public package changes require a Changeset.

Follow [the repository rules](AGENTS.md) and [the Entropy policy](.claude/rules/entropy.md).
Before requesting review, use [the local review procedure](.claude/skills/review/SKILL.md)
to check the diff against those rules and document material exceptions or required
follow-up tasks. See [the README](README.md#local-agent-review) for agent commands.

Keep consumer documentation in the root `docs/` directory. The facade build
and prepack step generate `packages/facade/docs/` from those sources and the
renderer dependencies' published Tasty and Glaze documentation. Do not edit or
commit the generated copies. Packaging localizes reference links, retains
upstream licenses, and records dependency versions in `upstream/manifest.json`.
Source files and artwork absent from the dependencies link to their release
refs. `pnpm check:packages` validates the documentation in the actual tarball.

## Verification suite

Run these checks after `pnpm build`:

| Command                      | Coverage                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm test`                  | Configuration, graph, rendering helpers, diagnostics, and interaction logic                  |
| `pnpm lint`                  | ESLint with zero warnings, including Tasty style rules                                       |
| `pnpm check:locales`         | Real locale/fallback/navigation consumers                                                    |
| `pnpm check:publishing-site` | Combined base paths, locales, versions, drafts, SEO, and agent Markdown                      |
| `pnpm check:theming`         | Consumer components, colors, units, recipes, presets, overrides, and logos                   |
| `pnpm check:fonts`           | Real Google variable/italic fonts, local fonts, and offline cache rebuild                    |
| `pnpm check:plugins`         | Tested plugin contracts and actionable incompatibility failures                              |
| `pnpm check:recipes`         | Public anatomy inventory and build-checked documentation examples                            |
| `pnpm check:authoring`       | Custom highlighting, code groups, mobile contents, hero images, and OpenAPI                  |
| `pnpm check:browser`         | Chromium keyboard/focus, search, copy actions, appearance, mobile navigation, and axe checks |
| `pnpm check:install`         | Clean installation and build from packed artifacts, including lint/type exports              |
| `pnpm check:benchmark`       | A generated 500-page corpus with 10,000 headings and code samples                            |

Install the browser once with `pnpm exec playwright install chromium`. CI retains
browser traces on failure. After `pnpm build:reference`, `node scripts/check-reference-budgets.mjs` prints
the reference site's current raw budgets and a gzip estimate; investigate
regressions before changing a budget. The benchmark reports graph timings,
memory, and optional build time:

```sh
COOKBOOK_BENCH_PAGES=1000 COOKBOOK_BENCH_BUILD=1 pnpm check:benchmark
COOKBOOK_TEST_MANAGER=pnpm pnpm check:install
COOKBOOK_TEST_UPSTREAM=1 pnpm check:install
```

The lint consumer uses TypeScript 6 for the typescript-eslint parser and the
workspace TypeScript compiler for public API checks; typescript-eslint currently
rejects the TypeScript 7 API. Runtime compilation and lint parsing are separate.
