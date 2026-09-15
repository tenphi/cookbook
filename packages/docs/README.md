# @tenphi/docs

Renderer-neutral configuration, source discovery, npm artifact locking, content
graph construction, Markdown reference rewriting, and diagnostics for Cookbook.

```ts
import { createDocsGraph, defineDocsConfig } from "@tenphi/docs";

const config = defineDocsConfig({
  content: {
    sources: [
      { file: "README.md", route: "/" },
      { glob: "docs/**/*.{md,mdx}", base: "docs" },
    ],
  },
});

const graph = await createDocsGraph({ root: process.cwd(), config });
```

The graph validates routes, fragments, navigation, and assets without mutating
source files. It rewrites inline and reference-style document links, hashes and
collects local images/downloads, understands trusted MDX syntax, and confines
locked npm artifacts to their extraction root.

Most applications should install `@tenphi/cookbook`, which combines this engine
with the supported Astro/Starlight renderer. This package is useful for custom
tooling, validation, and alternate renderers. Node.js 22.14 or newer is required.
