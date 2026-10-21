---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
"@tenphi/docs": patch
---

Update Tasty to 3.11.2 and the Tasty ESLint plugin to 1.8.0. On a sub-element whose selector ends in a pseudo-element, `@own(...)` now describes the pseudo-element itself. Tasty ignores modifier, attribute, class, and tree-position states there with a warning instead of emitting selectors that never match. The `@tenphi/cookbook/eslint-plugin` presets accept every standard pseudo-class, such as `:popover-open` and `:dir(rtl)`, and no longer report conditions on the element a pseudo-element belongs to. The new `tasty/no-ignored-pseudo-element-state` rule reports ignored states as errors. Built-in styles drop the lint exceptions these limitations required.
