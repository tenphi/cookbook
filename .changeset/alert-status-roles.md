---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

GitHub alerts (`MarkdownAlert`) now use the status palette roles that `Callout` uses: `info` for notes, `success` for tips, `warning` for cautions, and `danger` for danger, instead of the `blue`, `green`, and `red` hues. Default colors are unchanged; a customized `theme.palette.info`, `success`, or `danger` now restyles alerts as well as Callouts.

`@tenphi/cookbook` re-exports `resolveDocsTheme` and the `ResolvedDocsTheme` type, so a site can inspect its theme's contrast checks without depending on `@tenphi/renderer` directly.
