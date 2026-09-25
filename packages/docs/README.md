# @tenphi/docs

Renderer-neutral configuration, source discovery, npm artifact locking, content
graph construction, Markdown reference rewriting, and diagnostics for Cookbook.

```ts
import { createDocsGraph, defineDocsConfig } from "@tenphi/docs";

const config = defineDocsConfig({
  content: {
    localizeRepositoryLinks: true,
    sources: [
      { file: "README.md", route: "/" },
      { glob: "docs/**/*.{md,mdx}", base: "docs" },
    ],
  },
});

const graph = await createDocsGraph({ root: process.cwd(), config });
```

The graph validates routes, fragments, navigation, raw HTML policy, and assets
without mutating source files. It rewrites inline, reference-style, and matched
absolute repository links; hashes and collects local images/downloads;
understands trusted MDX syntax; and confines locked npm artifacts to their
extraction root.

Most applications should install `@tenphi/cookbook`, which combines this engine
with the supported Astro/Starlight renderer. This package is useful for custom
tooling, validation, and alternate renderers. Node.js 22.19 or newer is required.
