---
title: Content sources
description: Collect local files, OpenAPI specs, and locked npm package documentation into one route graph.
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
Prefer an explicit source `root` when documenting another package; file and
glob paths, links, and assets are confined to that declared source root.

## Source identities and repeated mounts

Every source can have an `id` containing letters, digits, underscores, and
hyphens. Without one, Cookbook uses `source-1`, `source-2`, and so on. Explicit
IDs are stable when declarations are reordered and must be unique.

```ts
content: {
  sources: [
    { id: "v1", root: "versions/v1", glob: "**/*.md", routeBase: "/v1" },
    { id: "v2", root: "versions/v2", glob: "**/*.md", routeBase: "/v2" },
  ];
}
```

The same files may appear in several mounts. Relative links prefer the current
source; an unambiguous page in another source can also resolve by file path.
Use `source:v2/guide.md` to select another mount explicitly. The path is relative
to that source's root, before `base` is removed from routes. Queries and heading
fragments are preserved.

A frontmatter `slug` is relative to `routeBase`, including when it begins with
`/`. For example, `slug: intro` under `/v2` creates `/v2/intro`. File sources also
accept `routeBase`, which prefixes their explicit `route`. Empty `sources: []`
means no sources; omit the property to enable conventions.

## OpenAPI references

Add a local OpenAPI 3.x JSON or YAML document to generate a searchable overview
and one page per operation:

```ts
content: {
  sources: [
    { file: "README.md", route: "/" },
    { openapi: "api/openapi.yaml", routeBase: "/api" },
  ],
}
```

The overview appears at `/api`. An operation with `operationId: getWidget`
appears at `/api/get-widget`. Without an operation ID, Cookbook derives a route
from its method and path. Operation IDs must create distinct routes. The pages
include parameters, request bodies, responses, examples, and the document's
schemas. Source links point back to the spec file. Use a navigation item such
as `{ label: "API", link: "/api", items: [{ label: "Operations", autogenerate: { directory: "/api" } }] }`
to show the operations in the sidebar.

The source must stay within its declared `root` unless
`content.allowOutsideRoot` is enabled. External `$ref` values require bundling
into one local document before the build. Cookbook checks the spec size against
`build.maxAssetBytes` and reports invalid or duplicate operation routes.
Generated pages are static references; they do not make requests to the API.

### Supported OpenAPI details

Cookbook renders the core OpenAPI 3.0/3.1 operation model:

- Operation parameters replace path parameters with the same **name and location**.
  The same name in `query` and `path` remains two parameters.
- Parameters and request/response media types render singular `example` values
  (including `false`, `0`, and `null`) and named `examples`. Local Example Object
  references resolve to their summaries, descriptions, and values. HTTP(S)
  `externalValue` examples are linked and never fetched by the build.
- Operations inherit document `security`. An explicit array replaces it;
  `security: []` declares anonymous access. Empty objects allow an anonymous
  alternative. Schemes within an object are required together; array entries
  are alternatives. Scheme details and required scopes appear on each page.
- Local JSON Pointer references support escaped names and reference chains.
  Reference-only cycles and unknown security schemes produce diagnostics.
  Recursive schema definitions remain visible as JSON references.

These follow the [OpenAPI parameter and security rules](https://spec.openapis.org/oas/v3.1.1.html#operation-object).
Cookbook is not a complete OpenAPI validator or an interactive API client.
Callbacks, webhooks, link execution, OAuth login flows, multipart editors,
request serialization, and interactive schema expansion are not implemented.
Schema JSON is displayed as authored; externally split specs must be bundled
first. Use an OpenAPI validator alongside `cookbook doctor` for specification
validation beyond the rendered feature set.

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

Run `cookbook update` to create or reconcile the lock after editing sources.
A production build uses the exact requested specifier, version, and integrity stored in
`cookbook.lock.json`. The package creator writes this lock automatically.
Artifacts are integrity-checked, extracted with file-count and size limits,
and cached by integrity.

Package Markdown is untrusted by default. Raw HTML is sanitized to safe
elements, HTML-capable frontmatter is stripped, custom `head` entries are discarded,
unsafe URL protocols are rejected, and MDX cannot execute. Set `trust: "mdx"`
only after reviewing the exact locked artifact; doing so allows its build-time
code to run. Trusted MDX is compiled by Starlight, including relative component
imports from the source file's directory. Package-provided indexes, include
patterns, exclude patterns, and every discovered file are confined to the
extracted artifact root.

## Links and assets

Write ordinary repository-relative Markdown:

```md
[Install](./getting-started.md)
![Architecture](./assets/architecture.svg)
```

Known document links are rewritten to public routes. Query strings and heading
fragments are preserved, and fragments are checked against the target page's
GitHub-style heading IDs. Inline and reference-style links and images are
supported. Local images and downloadable files are validated, content-hashed,
and copied into the static build.

Absolute web links, `mailto:`, `tel:`, and hash-only links remain unchanged by
default. Set `content.localizeRepositoryLinks: true` to rewrite absolute links
back into the collected documentation when they match `site.repository` or the
current package's `repository` manifest field. GitHub/GitLab `blob`, `tree`, and
`raw` URLs plus Bitbucket `src` URLs are recognized; query strings and fragments
are preserved. Links without a matching collected page remain external.

Missing relative links are errors in strict mode; missing assets and paths
escaping an allowed source root are always errors.

Run the [doctor command](./cli.md#validate-with-doctor) before committing a
large content move.
