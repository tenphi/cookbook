---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
"@tenphi/docs": minor
---

Update Tasty to 3.11.1 and the Tasty ESLint plugin to 1.7.2. Built-in styles now follow Tasty's style guidelines. They use spacing, radius, and border units instead of token arithmetic and `hide` instead of `display: none`. Transitions use semantic names that honor per-property duration tokens, and every state map has a default state. The renderer no longer needs file-wide lint exemptions. Tasty now emits each configured `@property` once, so spacing tokens keep their `inherits: false` registration.

Code blocks, steps, the search button, the skip link, and the mobile header-link panel use logical spacing and positions, so they mirror correctly in right-to-left locales. Table header cells round their top corners without depending on direction. Card's `fill`, `shadow`, and `translate` overrides now also apply to linked cards, whose hover and pressed states live in Card's own state maps.

Remove the `clear` palette role: Tasty now compiles `#clear` to `transparent`, so a customized `theme.palette.clear` no longer has any effect. See the migration guide for overrides that now use logical properties or `hide`.
