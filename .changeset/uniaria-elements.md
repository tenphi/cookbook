---
"@tenphi/renderer": patch
---

Add UniAria (`@uniaria/core` and `@uniaria/elements` 0.3.0) as the renderer's behavior layer for overlays and tabs, and a `client/elements` module that registers its popover and dialog behaviors as `cb-popover` and `cb-dialog`. No page loads the module yet, so rendered sites and their JavaScript are unchanged.
