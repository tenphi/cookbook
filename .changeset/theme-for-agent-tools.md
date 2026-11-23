---
"@tenphi/docs": minor
"@tenphi/renderer": minor
---

Add `createColorTheme(theme)` to `@tenphi/docs`, which returns a site's colors as one Glaze theme, and `configureTastyTheme(theme)` to `@tenphi/renderer`, which configures Tasty with a site's theme as a Cookbook build does. Agent tools use them to read a site's theme. `declareComponentTokensForTools()` in `@tenphi/renderer` tells Tasty's `tasty:styles` tool about the color and token names that Cookbook's components define on their own roots, such as `#callout-text`, so the tool does not report them as undefined; builds never call it. Update Tasty to 3.19.2, whose `tasty:styles` tool resolves `--setup` modules from the current folder and warns about color and token names the theme does not define, Glaze to 3.1.1, whose `glaze:inspect` tool takes a module inside an installed package, and the Tasty ESLint plugin to 1.21.2, whose `tasty-lint:check` tool notes a file in which it may have found no styles and lints TypeScript 7 files without installing TypeScript 6.
