---
title: CLI commands
description: Validate documentation and reconcile package locks using the same configuration as Astro.
sidebar:
  order: 6
---

The integration and CLI discover `docs.config.ts`, `.mts`, `.js`, or `.mjs` in the
project directory. Its `root` sets the content and lock directory. Use `--root`
to select another project, or `--config` for an explicit config path relative to
that project.

## Validate with doctor

```sh
npx @tenphi/cookbook doctor
npx @tenphi/cookbook doctor --root ./apps/docs
npx @tenphi/cookbook doctor --config ./config/manual.ts --json
```

Doctor checks the content graph, configuration, semantic theme, links, assets,
navigation, and redirects without starting Astro. It exits non-zero for errors.
It validates configured local font files, logo/favicon sources, public social
images, and component override paths. `--public-dir ./static` supports a custom
Astro public directory; the default is `public/` in the app directory.

Doctor reports **preflight** health. It does not compile MDX or components,
download Google fonts, check image decoding, inspect Astro plugins, or verify
the emitted site. These checks happen during the build and output validation.

JSON results use a stable envelope, including configuration failures:

```json
{
  "ok": true,
  "scope": "preflight",
  "buildVerified": false,
  "pages": 8,
  "assets": 3,
  "diagnostics": []
}
```

## Check the built site and deployment

```sh
npm run validate
npx @tenphi/cookbook check-build --out dist --json
npx @tenphi/cookbook check-build --out dist --url https://docs.example.com/manual/
```

New projects include `validate`, which runs `cookbook doctor && astro build &&
cookbook check-build`. Existing projects can add that script to `package.json`.
Use the same environment variables and configuration for building and checking.
`--out` is relative to the selected app directory, even when `docs.config.ts`
points at a different content root.

`check-build` reads actual HTML and CSS plus Cookbook's publishing manifest. It
checks local page/asset URLs, heading fragments, referenced fonts, social images,
canonical and indexing metadata, sitemap coverage, and discovery files. Direct
links to drafts are valid; drafts must still be built and carry `noindex`.
External links and remote font availability are outside this local check.

With `--url`, it also fetches the built pages and referenced local assets from
that deployment, checks status codes, rejects HTML fallbacks for assets, and
compares page title/canonical/indexing metadata. Include the deployed path prefix;
it may differ from the production prefix in the build. Production canonicals can
remain unchanged on a preview host. An unexpected `X-Robots-Tag: noindex` on an
indexable page is reported. Network failures exit non-zero; rerun after the host
has finished deploying.

JSON adds `scope` (`built-output` or `deployment`) and `checkedUrls`. A missing
production site URL is a warning: configure `site.url` or Astro's `site` before
relying on canonical or sitemap checks. Warnings do not fail the command.
This checks output and hosting; browser accessibility and interaction testing
remain separate steps.

## Update package content

```sh
npx @tenphi/cookbook update
npx @tenphi/cookbook update @scope/package --dry-run
npx @tenphi/cookbook update --json
```

`update` reads package sources from configuration, creates the first lock,
resolves changed tags or ranges, and removes entries that are no longer declared.
A package name or exact requested specifier selects individual updates. An
unselected source must already have a matching lock; otherwise run a full update.

`--dry-run` resolves versions and shows the proposed changes without writing
files. JSON output adds `dryRun`, `changes`, `removed`, and `lock` to the envelope.
Review and commit the resulting lock diff before deploying. Builds require an
exact requested-specifier match and never silently substitute a lock for another
range or tag.

Vendored sources remain vendored. New artifacts are stored in separate integrity
folders before the lock is replaced, so a failed download leaves the old lock
and its content available. Old vendor folders can be removed after reviewing
which paths the new lock references.

## Creator flags

Start with local content, an existing repository, or an npm artifact:

```sh
npm create @tenphi/cookbook@latest docs-site -- --yes
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
npm create @tenphi/cookbook@latest docs-site -- --package @scope/package --yes
```

| Flag                                                             | Purpose                                           |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `--source <directory>`                                           | Document an existing local repository             |
| `--package <specifier>`                                          | Document a locked npm artifact                    |
| `--yes`, `-y`                                                    | Use non-interactive defaults                      |
| `--brand <color>`                                                | Set the Glaze brand seed                          |
| `--site <url>`                                                   | Set the canonical site URL                        |
| `--base <path>`                                                  | Set Astro's hosting subpath                       |
| `--deploy github-pages\|netlify\|cloudflare-pages\|vercel\|none` | Add deployment setup or a host guide              |
| `--package-manager npm\|pnpm\|yarn`                              | Select the project manager                        |
| `--no-install`                                                   | Generate files without installing dependencies    |
| `--vendor`                                                       | Vendor the npm artifact for offline builds        |
| `--trust-package`                                                | Permit MDX execution from the locked npm artifact |
| `--open`                                                         | Start and open the development server             |

`--source` and `--package` are mutually exclusive. With neither, the creator
writes a local starter. `--vendor` and `--trust-package` require `--package`.
`--open` requires installation. A non-empty destination requires interactive
confirmation before generated files can be overwritten.
