---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
---

Move built-in styles into component-owned modules and initialize document foundations from the page shell, so replacing Header preserves fonts and unrelated styling. Preserve existing theme style names and sub-elements, and collect CodeGroup's generated-content styles independently.
