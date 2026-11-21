---
"@tenphi/docs": minor
"@tenphi/renderer": minor
---

Add `createColorTheme(theme)` to `@tenphi/docs`, which returns a site's colors as one Glaze theme, and `configureTastyTheme(theme)` to `@tenphi/renderer`, which configures Tasty with a site's theme as a Cookbook build does. Agent tools use them to read a site's theme. Update Tasty to 3.19.1, whose `tasty:styles` tool resolves `--setup` modules from the current folder, Glaze to 3.1.1, whose `glaze:inspect` tool takes a module inside an installed package, and the Tasty ESLint plugin to 1.21.1, whose `tasty-lint:check` tool notes a file in which it may have found no styles.
