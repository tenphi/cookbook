---
title: CLI commands
description: Validate documentation and reconcile package locks using the same configuration as Astro.
sidebar:
  order: 6
---

Cookbook has two command-line tools: the `cookbook` command from
`@tenphi/cookbook`, and the project creator run through
`npm create @tenphi/cookbook`.

| Command                | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `cookbook doctor`      | Check configuration, content, links, and local files (preflight) |
| `cookbook check-build` | Check the built site and, with `--url`, its deployment           |
| `cookbook update`      | Create or refresh `cookbook.lock.json` for npm package sources   |
| `cookbook --help`      | Print usage; `cookbook` without a command does the same          |

The integration and CLI discover `docs.config.ts`, `.mts`, `.js`, or `.mjs` in the
project directory. Its `root` sets the content and lock directory. Use `--root`
to select another project, or `--config` for an explicit config path relative to
that project. Add `--json` to any command for machine-readable output.

Projects made by the creator wrap these commands in `package.json` scripts:

| Script        | Runs                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| `dev`         | `astro dev`                                                              |
| `build`       | `astro build`                                                            |
| `preview`     | `astro preview`                                                          |
| `typecheck`   | `tsc --noEmit`                                                           |
| `doctor`      | `cookbook doctor`                                                        |
| `check-build` | `cookbook check-build`                                                   |
| `validate`    | `tsc --noEmit && cookbook doctor && astro build && cookbook check-build` |
| `update`      | `cookbook update`                                                        |

In a project you set up yourself, add the same scripts or run
`npx @tenphi/cookbook <command>`.

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

Every JSON result has `ok`, `pages`, `assets`, and `diagnostics`, including
argument and configuration failures. Doctor adds `scope: "preflight"` and
`buildVerified: false`:

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

Use the same environment variables and configuration for building and checking.
`--out` defaults to `dist` and is relative to the selected app directory, even
when `docs.config.ts` points at a different content root.

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

JSON output has `scope` (`built-output` or `deployment`) and `checkedUrls`
instead of `buildVerified`. A missing production site URL is a warning:
configure `site.url` or Astro's `site` before relying on canonical or sitemap
checks. Warnings do not fail the command. This checks output and hosting;
browser accessibility and interaction testing remain separate steps.

## Update package content

```sh
npx @tenphi/cookbook update
npx @tenphi/cookbook update @scope/package --dry-run
npx @tenphi/cookbook update --json
```

`update` reads package sources from configuration, creates the first lock,
resolves every declared tag or range again, and removes entries that are no
longer declared. An unchanged `@latest` or `^1` therefore moves to its newest
match. A package name or exact requested specifier selects individual updates.
An unselected source must already have a matching lock; otherwise run a full
update.

`--dry-run` resolves versions and shows the proposed changes without writing
files. JSON output adds `dryRun`, `changes`, `removed`, and `lock`. Review and
commit the resulting lock diff before deploying. Builds require an exact
requested-specifier match and never silently substitute a lock for another
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

Pass creator flags after `--` so `npm create` forwards them.

| Argument or flag                                                 | Purpose                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[destination]`                                                  | Target directory; defaults to `docs-site`, or `<name>-docs` with `--package`   |
| `--source <directory>`                                           | Document an existing local repository                                          |
| `--package <specifier>`                                          | Document a locked npm artifact                                                 |
| `--yes`, `-y`                                                    | Never prompt; fail instead of asking to overwrite a non-empty destination      |
| `--brand <color>`                                                | Set the Glaze brand seed                                                       |
| `--site <url>`                                                   | Set the canonical site URL                                                     |
| `--base <path>`                                                  | Set Astro's hosting subpath                                                    |
| `--deploy github-pages\|netlify\|cloudflare-pages\|vercel\|none` | Add a [deployment workflow or host guide](./deployment.md)                     |
| `--package-manager npm\|pnpm\|yarn`                              | Select the package manager; defaults to the one that ran the creator, then npm |
| `--no-install`                                                   | Generate files without installing dependencies                                 |
| `--vendor`                                                       | Vendor the npm artifact for offline builds                                     |
| `--trust-package`                                                | Permit MDX execution from the locked npm artifact                              |
| `--open`                                                         | Start the development server in the background, without output, and open it    |
| `--help`, `-h`                                                   | Print usage                                                                    |

`--source` and `--package` are mutually exclusive. With neither, the creator
writes a local starter. `--vendor` and `--trust-package` require `--package`.
`--open` requires installation; stop the background server yourself when you
are done. A non-empty destination requires interactive confirmation before
generated files can be overwritten.

Yarn 4 uses Plug'n'Play by default, which Cookbook does not support. For Yarn,
the creator writes `.yarnrc.yml` with `nodeLinker: node-modules` and an empty
`yarn.lock`, so the site also installs as its own project inside an existing
Yarn repository. With `--deploy github-pages`, a site created inside a Git
repository gets its workflow at the repository root; see
[GitHub Pages](./deployment.md#github-pages).

## Diagnostic codes

Each diagnostic has a code, a severity, a message, and usually a source file,
line, and hint. Errors fail the command; warnings do not.

| Stage                        | Codes                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration                | `DOCS_CONFIG_INVALID`, `DOCS_CONFIG_UNKNOWN_KEY`                                                                                                                                                                                                                                                                                |
| Sources and routes           | `DOCS_NO_PAGES`, `DOCS_SOURCE_NOT_FOUND`, `DOCS_SOURCE_OUTSIDE_ROOT`, `DOCS_DUPLICATE_SOURCE`, `DOCS_DUPLICATE_ROUTE`, `DOCS_FRONTMATTER_INVALID`, `DOCS_REDIRECT_INVALID`, `DOCS_VERSION_ROOT_MISSING`, `DOCS_NAV_TARGET_NOT_FOUND`, `DOCS_OPENAPI_INVALID`                                                                    |
| Links and assets             | `DOCS_LINK_NOT_FOUND` (a warning unless `build.strict`), `DOCS_FRAGMENT_NOT_FOUND` (an error with `build.ci`), `DOCS_LINK_UNSAFE`, `DOCS_AMBIGUOUS_LINK`, `DOCS_HEADING_DUPLICATE`, `DOCS_ASSET_NOT_FOUND`, `DOCS_ASSET_UNSAFE`                                                                                                 |
| Content safety               | `DOCS_RAW_HTML_STRIPPED`, `DOCS_RAW_HTML_REJECTED`, `DOCS_UNTRUSTED_HTML`, `DOCS_UNTRUSTED_MDX`                                                                                                                                                                                                                                 |
| Doctor only                  | `DOCS_CONFIG_ASSET_MISSING`, `DOCS_COMPONENT_UNRESOLVED`, `DOCS_SEMANTIC_CONTRAST_UNMET`, `DOCS_BRAND_CONTRAST_UNMET`                                                                                                                                                                                                           |
| Built output (`check-build`) | `DOCS_BUILD_MISSING`, `DOCS_SITE_URL_MISSING` (a warning), `DOCS_OUTPUT_URL_INVALID`, `DOCS_OUTPUT_LINK_MISSING`, `DOCS_OUTPUT_FRAGMENT_MISSING`, `DOCS_PUBLISHING_PAGE_MISSING`, `DOCS_CANONICAL_INVALID`, `DOCS_INDEX_POLICY_MISMATCH`, `DOCS_SITEMAP_PAGE_MISSING`, `DOCS_SITEMAP_UNLISTED_PAGE`, `DOCS_AGENT_UNLISTED_PAGE` |
| Deployment (`--url`)         | `DOCS_DEPLOYMENT_HTTP`, `DOCS_DEPLOYMENT_PAGE_MISMATCH`, `DOCS_DEPLOYMENT_NOINDEX`, `DOCS_DEPLOYMENT_ASSET_INVALID`, `DOCS_DEPLOYMENT_FETCH`                                                                                                                                                                                    |
| Command line                 | `COOKBOOK_CLI_ERROR` for invalid arguments and other command failures                                                                                                                                                                                                                                                           |

See [troubleshooting](./troubleshooting.md) for common fixes.
