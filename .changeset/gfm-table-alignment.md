---
"@tenphi/cookbook": patch
"@tenphi/renderer": patch
---

Support GFM table column alignment. Astro's default Markdown processor emits
`style="text-align: …"` for aligned columns, which failed the Tasty-only output
check. Aligned cells now receive a `data-align` modifier styled by
`MarkdownTable.Cell`, under both Markdown processors.
