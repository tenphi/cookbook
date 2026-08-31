---
title: CLI commands
description: Validate a site and update locked package documentation from the command line.
sidebar:
  order: 6
---

The `@tenphi/cookbook` package installs a CLI alongside the Astro integration.

## Validate with doctor

```sh
npx @tenphi/cookbook doctor
```

`doctor` loads `docs.config.ts`, builds the content graph, and reports source,
route, link, fragment, asset, navigation, configuration, and theme errors
without starting Astro.

Run it against another directory with `--root`:

```sh
npx @tenphi/cookbook doctor --root ./packages/example-docs
```

Machine-readable output is available for scripts:

```sh
npx @tenphi/cookbook doctor --json
```

A healthy JSON result contains the page count:

```json
{ "ok": true, "pages": 8 }
```

The process exits non-zero when any error diagnostic is present.

## Update package content

```sh
npx @tenphi/cookbook update
```

`update` reads every requested package specifier in
`cookbook.lock.json`, resolves it again through its configured registry, and
writes the new exact versions and integrity hashes. Review and commit the lock
diff before deploying.

Use JSON output when another tool consumes the updated lock:

```sh
npx @tenphi/cookbook update --json
```

The command stops if the project has no package sources in its lock.

## Creator flags

The package-first creator accepts a destination followed by a required package
specifier:

```sh
npm create @tenphi/cookbook@latest docs-site -- \
  --package @scope/package@latest \
  --yes \
  --brand "#2f5bff" \
  --site "https://docs.example.com" \
  --deploy github-pages
```

Available flags include:

| Flag                                | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `--yes`, `-y`                       | Use non-interactive defaults                                |
| `--brand <color>`                   | Seed the Glaze brand palette                                |
| `--site <url>`                      | Set the canonical site URL                                  |
| `--base <path>`                     | Set a hosting subpath                                       |
| `--deploy github-pages\|none`       | Add or skip a deployment preset                             |
| `--package-manager npm\|pnpm\|yarn` | Select the generated project manager                        |
| `--no-install`                      | Write files without installing dependencies                 |
| `--vendor`                          | Store the locked artifact in the project for offline builds |
| `--trust-package`                   | Allow MDX execution from the exact locked package           |
| `--open`                            | Start and open the development server after installation    |

The creator refuses to overwrite a non-empty destination without interactive
confirmation.
