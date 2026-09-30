---
"@tenphi/docs": minor
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

Remove legacy theme compatibility paths. Palette configuration, dependencies,
and resolved color properties now use canonical lowercase Glaze names such as
`text-soft` and `accent-text`. Configure design tokens with Tasty `$name` keys;
the old `--name` keys now report a validation error. Custom style overrides must
be consumed through `defineComponent()` or `resolveComponentStyles()` instead of
the automatic `data-tasty-anatomy` bridge. See the upgrade guide for migration.
