---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
"@tenphi/docs": patch
---

Move built-in styles into component-owned modules and initialize document foundations from the page shell, so replacing Header preserves fonts and unrelated styling. Preserve existing theme style names and sub-elements, and collect CodeGroup's generated-content styles independently.

Use shared appearance states for scheme-dependent component styling, including automatic hero and logo selection with explicit theme choices taking precedence over system preferences.

Upgrade Tasty to 3.9.3 and its ESLint plugin to 1.3.0.

Enable shorthand-property diagnostics for component-owned styles and register renderer-local style helpers so global bridges receive the same validation. Use registered warning palette roles for Markdown warning alerts.
