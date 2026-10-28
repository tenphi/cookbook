---
"@tenphi/renderer": patch
"@tenphi/docs": patch
---

Keep the mobile navigation header and footer visible around an independently scrolling navigation tree, separated by borders. Use the shared Select popover for section navigation, matching language and version controls while retaining existing style customization names.

Reduce mobile footer padding and distinguish selector headings from selectable options with smaller, uppercase labels. Customize their typography through `theme.presets["control-label"]`.

Honor UniAria's entering state so the section selector fades in as well as out, while respecting reduced motion.
