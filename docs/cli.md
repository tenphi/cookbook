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
It does not compile MDX or replace a full Astro build.

JSON results use a stable envelope, including configuration failures:

```json
{
  "ok": true,
  "pages": 8,
  "assets": 3,
  "diagnostics": []
}
```

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

| Flag                                | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `--source <directory>`              | Document an existing local repository             |
| `--package <specifier>`             | Document a locked npm artifact                    |
| `--yes`, `-y`                       | Use non-interactive defaults                      |
| `--brand <color>`                   | Set the Glaze brand seed                          |
| `--site <url>`                      | Set the canonical site URL                        |
| `--base <path>`                     | Set Astro's hosting subpath                       |
| `--deploy github-pages\|none`       | Add a deployment workflow                         |
| `--package-manager npm\|pnpm\|yarn` | Select the project manager                        |
| `--no-install`                      | Generate files without installing dependencies    |
| `--vendor`                          | Vendor the npm artifact for offline builds        |
| `--trust-package`                   | Permit MDX execution from the locked npm artifact |
| `--open`                            | Start and open the development server             |

`--source` and `--package` are mutually exclusive. With neither, the creator
writes a local starter. `--vendor` and `--trust-package` require `--package`.
`--open` requires installation. A non-empty destination requires interactive
confirmation before generated files can be overwritten.
