---
title: Content sources
description: Collect local files, globs, and locked npm package documentation into one route graph.
sidebar:
  order: 3
---

Cookbook first collects every source and assigns each one a canonical route.
Only then does it rewrite links and assets. That two-phase graph lets pages
link across directories and source declarations without depending on discovery
order.

## Convention mode

When `content.sources` is omitted, Cookbook includes these sources when they
exist:

```ts
[
  { file: "README.md", route: "/" },
  { glob: "docs/**/*.{md,mdx}", base: "docs" },
];
```

Files or directories beginning with `_` are excluded from glob discovery.
Explicit `content.sources` replace these conventions.

## Local files

Use a file declaration for a single document with an optional explicit route
or inferred metadata:

```ts
{
  file: "README.md",
  route: "/",
  title: "Product documentation",
  description: "Learn how to use the product."
}
```

Use a glob for a documentation tree:

```ts
{
  glob: ["docs/**/*.md", "docs/**/*.mdx"],
  base: "docs",
  routeBase: "/",
  exclude: ["docs/internal/**"]
}
```

`base` is removed from generated routes. `routeBase` is then prepended. A
directory `README.md` or `index.md` maps to the directory route; other pages
use extensionless routes.

| Source path          | `base` | `routeBase`  | Route                        |
| -------------------- | ------ | ------------ | ---------------------------- |
| `README.md`          | —      | —            | `/` when explicitly assigned |
| `docs/setup.md`      | `docs` | —            | `/setup`                     |
| `docs/api/index.md`  | `docs` | —            | `/api`                       |
| `docs/api/client.md` | `docs` | `/reference` | `/reference/api/client`      |

Source paths are resolved from the configured project root. Paths outside that
root are rejected unless `content.allowOutsideRoot` is explicitly enabled.

## npm package sources

Package sources read documentation from the actual npm artifact:

```ts
{
  package: "@scope/package@latest",
  include: ["README.md", "docs/**/*.md"],
  exclude: ["docs/internal/**"],
  index: "README.md",
  routeBase: "/"
}
```

A production build uses the exact version and integrity stored in
`cookbook.lock.json`. The package creator writes this lock automatically.
Artifacts are integrity-checked, extracted with file-count and size limits,
and cached by integrity.

Package Markdown is untrusted by default. Script-capable HTML and unsafe URL
protocols are rejected, and MDX cannot execute. Set `trust: "mdx"` only after
reviewing the exact locked artifact; doing so allows its build-time code to
run.

## Links and assets

Write ordinary repository-relative Markdown:

```md
[Install](./getting-started.md)
![Architecture](./assets/architecture.svg)
```

Known document links are rewritten to public routes. Query strings and heading
fragments are preserved, and fragments are checked against the target page's
GitHub-style heading IDs. Local images are validated, content-hashed, and
copied into the static build.

Absolute web links, `mailto:`, `tel:`, and hash-only links remain unchanged.
Missing links are errors in strict mode; missing assets and paths escaping an
allowed source root are always errors.

Run the [doctor command](./cli.md#validate-with-doctor) before committing a
large content move.
