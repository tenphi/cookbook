---
title: Publishing metadata
description: Configure titles, social previews, canonical URLs, indexing, and agent-readable pages.
---

Set `site.url` (or Astro's `site`) to your public origin. Astro's `base` is applied
to page URLs, local social images, sitemaps, and Markdown downloads automatically.
Conflicting Cookbook and Astro origins fail configuration validation.

## Titles and social previews

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Acme",
    url: "https://docs.example.com",
    seo: {
      titleTemplate: "{title} | {site}",
      image: {
        src: "/social.png", // public/social.png; deployment base is added
        alt: "Acme developer documentation",
        width: 1200,
        height: 630,
      },
      breadcrumbs: true,
    },
  },
});
```

Without a template, Cookbook renders `Page | Site`, or just `Site` when both names
match. Templates require `{title}` and may use `{site}`. A page's `seo.title` is a
complete document title, overriding the template; its visible heading is unchanged.

When no site image is configured, Cookbook generates a 1200×630 PNG preview from
the site title, description, public hostname, and light theme colors. It emits
`og:image` and `twitter:image` for every page using that preview. Set `site.url`
(or Astro's `site`) so those tags contain an absolute URL for social crawlers.
The generated image lives at `/_cookbook/social-preview.png` under the deployment
base and does not modify `public/`.

Set `site.seo.image` to replace the generated preview with your own image, or
`false` to disable the site-wide image. Custom images accept an absolute HTTP(S)
URL or a root-relative public asset path. Provide meaningful `alt` text.
Dimensions are optional but must be provided together. A page inherits the site
image, can replace it, or can set `image: false` to use a plain `summary` card.
Pages with an image use `summary_large_image`.

```yaml
---
title: Authentication
seo:
  title: Authentication reference — Acme
  image:
    src: /authentication.png
    alt: Acme authentication flow
    width: 1200
    height: 630
---
```

Cookbook owns document titles, canonical links, robots directives, and the social
fields described above. Configure these through `seo` instead of duplicating them
in `head`. Other custom head tags remain supported.

## Indexing and previews

`site.seo.index: false` adds `noindex, follow` to documentation pages and omits them
from sitemaps, language alternatives, and `llms.txt`. Navigation and direct links
continue to work. A page cannot override a site or version's `index: false`.

Choose preview policy explicitly in configuration:

```ts
site: {
  url: "https://docs.example.com",
  seo: { index: process.env.DOCS_PREVIEW !== "1" },
}
```

Build previews with `DOCS_PREVIEW=1`. Keep the production canonical origin while
serving the preview from another host. `noindex` is a crawler instruction, not
access control. Crawlers must be allowed to fetch the HTML to see it; do not rely
on a robots.txt disallow rule to communicate noindex. See Google's
[noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

A page can opt out using `seo: { index: false }`. A draft is always noindex and also
omitted from navigation, pagination, search, sitemaps, and agent discovery. Drafts
remain available at their ordinary production URL and do not get Markdown copies.

## Versions, locales, and canonical URLs

Every published version is indexed by default. Opt older versions out explicitly:

```ts
site: {
  versions: [
    { label: "Current", routeBase: "/" },
    { label: "v1", routeBase: "/v1", index: false },
  ],
}
```

Locale prefixes precede version roots: `/fr/v1/guide`. Version matching uses the
most specific configured root after the locale prefix. Only actual, indexable,
self-canonical translations are advertised in `hreflang` and the sitemap.

For duplicate content, set a page's `seo.canonical` to the preferred **absolute
HTTP(S) URL without a fragment**. The duplicate keeps its normal route and is
omitted from sitemap and agent indexes; canonicalization alone does not add
noindex. Distinct versions keep self-canonical URLs unless you explicitly identify
them as duplicates. See Google's
[canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Breadcrumb structured data

`site.seo.breadcrumbs: true` emits a `BreadcrumbList` when at least two actual
ancestor pages exist. Intermediate folders without pages are skipped. To describe
a different navigation journey, supply at least two `{name, url}` items in a page's
`seo.breadcrumbs`. URLs must be absolute HTTP(S); the final URL must match that
page's canonical. Set `seo.breadcrumbs: false` on a page to disable it.

Structured data helps machines understand the page hierarchy. It does not guarantee
any search appearance; validate the deployed output using Google's
[breadcrumb documentation](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

## Page text for readers and agents

Published pages include **Copy page** and **Download Markdown** controls. The head also
advertises a `rel="alternate" type="text/markdown"` URL. Downloads contain clean
Markdown with canonical URL, source path, language, and version metadata. Code
fences and rewritten links are preserved. Executable MDX, expressions, raw HTML,
and isolated previews are omitted; generated interactive component output may
only be available in the HTML. Read the HTML when that content matters.

The version comes from the matching documentation version, then `site.version`.
Copying requires browser clipboard access; the Markdown link remains available if
permission is unavailable or JavaScript is disabled. Set `site.seo.copyPage: false`
to disable page text and both controls. Customize the controls with
`theme.styles.PageActions`: `Control`, `Hover`, `Focus`, `Pending`, and `Status`.

`llms.txt` links to discoverable canonical pages and their Markdown representations.
`_cookbook/publishing.json` records non-draft page URLs and publishing policy for
validation tools. Existing `public/llms.txt` and root `public/robots.txt` take
precedence; maintain their policy yourself.

For static hosts, apply `X-Robots-Tag: noindex` to `/_cookbook/pages/*` (with your
base prefix) to keep alternate Markdown copies out of web search. For example,
Netlify/Cloudflare Pages projects can add this to `public/_headers`:

```text
/_cookbook/pages/*
  X-Robots-Tag: noindex
```

The static HTML's noindex does not automatically apply to a separate Markdown URL.
Preview deployments should apply a site-wide noindex response header when the
host supports it. On hosts without custom headers, disable `copyPage` for previews
and private review content. Agent files are a reading convenience, not a claim of
better AI answers or higher search rankings.
