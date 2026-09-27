---
title: Starlight plugins
---

Cookbook accepts Starlight content and behavior plugins in `astro.config.mjs`:

```js cookbook-verify=github-alerts
import cookbook from "@tenphi/cookbook";
import githubAlerts from "starlight-github-alerts";
import { unified } from "@astrojs/markdown-remark";

export default {
  markdown: { processor: unified() },
  integrations: [cookbook({ plugins: [githubAlerts()] })],
};
```

Install `starlight-github-alerts` and `@astrojs/markdown-remark` in your project. Cookbook supplies the Starlight runtime; respect
plugins' peer dependency ranges when upgrading. See [configuration](./configuration.md)
for Astro Markdown hooks and [customization](./theme-and-components.md) for styling.

## Verified compatibility

The consumer check `pnpm check:plugins` tests these versions with the repository's
pinned Astro and Starlight versions. Compatibility with other versions is not implied.

| Integration                                                        | Tested version   | Contract                                                                                                                             |
| ------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `starlight-github-alerts`                                          | 0.4.0            | With `unified()`, Markdown and MDX alert syntax uses Cookbook's Tasty `StarlightAside` adapter.                                      |
| `starlight-links-validator`                                        | 0.26.0           | Incompatible with mounted sources: error reporting assumes physical `src/content/docs` files. Cookbook rejects it with a diagnostic. |
| Route middleware and `i18n:setup`                                  | Starlight 0.42.4 | Custom metadata, body, file path, and translations survive in real consumer builds with locales and a base path.                     |
| Plugins requiring `astro:content`'s `docs` collection              | —                | Cookbook's renderer uses its own graph. Adapt to the content API below; no native collection is populated automatically.             |
| Plugins supplying CSS, styled Astro components, or Expressive Code | —                | Require an adapter built with Tasty. The build rejects incompatible output.                                                          |

GitHub Alerts 0.4.0 assumes an older Sätteri plugin structure and silently skips
alerts with Starlight 0.42.4's default processor. Cookbook rejects that combination
with a configuration hint. Use `unified()` as above, or Starlight's native
`:::note` / `:::tip` directives with the default processor.

GitHub alerts inherit the semantic blue, green, yellow, and red surfaces. Customize
`theme.styles.StarlightAside` with `Note`, `Tip`, `Caution`, `Danger`, `Title`, `Icon`,
and `FirstContent`. Styles merge into the full owned tree; the plugin's stylesheet
is unnecessary. All supported appearance modes use the Glaze palette.

Cookbook validates graph links itself. `starlight-links-validator` 0.26.0 loads,
but fails while reporting broken links because it tries to read synthesized
`src/content/docs` paths. Its middleware also cannot add previously absent links
to its validation store. Use Cookbook's doctor and built-output checks for mounted
sources. Plugins that depend on native collection IDs or mutate routing after
graph creation need a Cookbook-specific adapter.

## Custom metadata and schemas

Unknown source frontmatter is preserved as `entry.metadata` by default, and is
available to route middleware as `locals.starlightRoute.entry.data`. Cookbook's
validated built-in fields take precedence. Set `content.frontmatter: "reject"`
only if your site does not use custom metadata.

Optionally validate custom fields or supply defaults with a Zod-compatible schema:

```js
import cookbook from "@tenphi/cookbook";
import { z } from "astro/zod";

export default {
  integrations: [
    cookbook({
      frontmatterSchema: z.object({
        owner: z.string().default("docs-team"),
      }),
    }),
  ],
};
```

The schema receives **custom metadata only** and may use `parse` or `parseAsync`.
Returned fields merge with preserved metadata. Values must be JSON-compatible;
errors identify the source file. Reserved fields such as `title`, `slug`, `draft`,
and `aliases` belong in source frontmatter and cannot be set by this schema.
A schema cannot change routing or discovery after the graph is built.

Route middleware also receives the transformed Markdown source in `entry.body`
and the actual source location in `entry.filePath`. Presentation changes made by
middleware do not update the graph, sitemap, or agent text. Put shared publishing
metadata in source configuration so every output agrees.

## Query Cookbook content

Use this build-time API in Astro components and route middleware:

```js
import {
  getCookbookCollection,
  getCookbookEntry,
} from "@tenphi/cookbook/content";

const pages = getCookbookCollection();
const allPages = getCookbookCollection({ includeDrafts: true });
const page = getCookbookEntry("/guide");
```

The renderer package exposes the same functions at `@tenphi/starlight/content`.
Routes include locale/version prefixes but exclude Astro's deployment `base`.
Collection queries omit drafts by default; exact lookups can retrieve a draft.
Results are independent snapshots, including `metadata`, `frontmatter`, `body`,
`transformedBody`, source information, headings, and links. Mutating a result does
not change generated pages. Do not import this API into client-side code: it is
backed by the site's build-time content graph.

## Diagnose incompatible plugins

- **Plugin adds `customCss`:** disable its stylesheet option and provide a Tasty
  adapter, or choose a content-only plugin. The configuration error names the plugin.
- **Inline styles or external stylesheet in built output:** replace that visual
  component with owned markup styled through `tasty()` and registered
  `theme.styles` anatomy. See [customization rules](./customization-rules.md).
- **Empty `getCollection("docs")`:** use the Cookbook content API above. Cookbook
  does not create a second, potentially conflicting Starlight content collection.
- **Missing custom field:** keep `content.frontmatter` at its default `"preserve"`,
  validate its shape, and read it after the Cookbook route bridge has run.
