---
"@tenphi/cookbook": minor
"@tenphi/create-cookbook": minor
"@tenphi/docs": minor
"@tenphi/renderer": minor
---

Replace Starlight with Cookbook's own Astro renderer and publish it as `@tenphi/renderer`. Keep the documentation graph, navigation, search, Tasty and Glaze theme, and server-rendered component overrides. Render GitHub alert blockquotes directly in Markdown and MDX, and accept Astro Markdown plugins without Starlight plugin hooks.

Direct renderer consumers must change `@tenphi/starlight` imports to `@tenphi/renderer`. Custom component overrides must use `Astro.locals.cookbookRoute`, and the renamed theme style surfaces are `Header` and `MarkdownAlert`. See the migration guide for plugin and style changes.
