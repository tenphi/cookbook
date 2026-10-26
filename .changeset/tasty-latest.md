---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
"@tenphi/docs": patch
---

Upgrade Tasty from 3.11.2 to 3.14.0 and the Tasty ESLint plugin from 1.8.0 to 1.12.0. Tasty now emits working `transition: none` declarations for reduced motion, composes color opacity suffixes with `color-mix()`, and omits disabled spacing and size declarations. See the migration guide for custom translucent colors, numeric alpha tokens, and styles that relied on `false` emitting defaults.

Use the plugin's built-in `mergeStyles` argument validation instead of a custom registration, so base styles require defaults while later arguments remain partial overrides. Remove an obsolete lint suppression for a value fixed during module evaluation.
