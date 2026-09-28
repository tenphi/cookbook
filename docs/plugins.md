---
title: Extend Cookbook
description: Add Markdown transforms, validate custom metadata, and query the content graph.
sidebar:
  order: 7
---

Cookbook renders with Astro and accepts Astro Markdown integrations. Configure
remark and rehype plugins in `astro.config.ts`; Cookbook adds its own transforms
to the same processor. Extensions that emit CSS must be adapted to Tasty because
the finished site ships only Tasty-generated styles.

```ts
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import cookbook from "@tenphi/cookbook";
import myRemarkPlugin from "./plugins/my-remark-plugin.js";

export default defineConfig({
  markdown: { processor: unified({ remarkPlugins: [myRemarkPlugin] }) },
  integrations: [cookbook()],
});
```

## GitHub alerts

Cookbook renders GitHub alert blockquotes in Markdown and MDX without an extra
plugin. `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` map to the semantic
note, tip, caution, and danger surfaces. For example:

The default Astro integration is sufficient for alert rendering:

```js cookbook-verify=github-alerts
import cookbook from "@tenphi/cookbook";

export default { integrations: [cookbook()] };
```

Write the alert in a Markdown or MDX page:

```md
> [!TIP]
> Keep source documentation next to the code it describes.
```

Customize the result through `theme.styles.MarkdownAlert`. Its named
sub-elements are `Note`, `Tip`, `Caution`, `Danger`, `Title`, and
`FirstContent`.

## Custom frontmatter

Unknown frontmatter fields can be preserved as JSON metadata. Set
`content.frontmatter: "preserve"`, then validate or add custom fields with
`frontmatterSchema`:

```ts
export default defineConfig({
  integrations: [
    cookbook({
      frontmatterSchema: {
        parse(metadata) {
          return { ...metadata, owner: metadata.owner ?? "maintainers" };
        },
      },
    }),
  ],
});
```

The schema receives only custom metadata. It cannot change route, title, draft,
or other reserved page fields. Returned values must be JSON-safe because the
renderer passes them through a build-time virtual module.

## Read the content graph

Server-rendered Astro components can query the validated graph:

```ts
import {
  getCookbookCollection,
  getCookbookEntry,
} from "@tenphi/cookbook/content";

const visiblePages = getCookbookCollection();
const guide = getCookbookEntry("/guide");
```

Queries return snapshots. Drafts are omitted from the collection by default;
`getCookbookEntry()` can retrieve one by its exact route. The same API is
available at `@tenphi/renderer/content` for renderer-only projects.

Component overrides receive page data from `Astro.locals.cookbookRoute`,
including the current entry, locale, navigation, table of contents, and head
tags. See [theme and components](./theme-and-components.md) for Tasty styling
and [configuration](./configuration.md) for structural overrides.

Use Astro's Markdown plugin APIs for content transforms, and Cookbook's graph
and built-output checks for link validation. Extensions tied to another
renderer need an adapter built against Cookbook's APIs.
