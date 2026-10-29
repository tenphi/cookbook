---
"@tenphi/renderer": minor
---

Use the `cookbook-*` prefix for all Cookbook-owned custom elements. Rename `cb-popover` to `cookbook-popover`, `cb-dialog` to `cookbook-dialog`, and the `site-search` wrapper to `cookbook-search`, updating registrations, typed tag maps, markup, styling, initialization, and client navigation together.

Custom components or scripts that use the previous tags must update their selectors and element references. Component customization names, part markers, CSS classes, DOM IDs, and stored preferences retain their existing names. See the custom-element naming migration guide.
