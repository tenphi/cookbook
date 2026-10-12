---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

Use Tasty element identities for owned anatomy and modifiers for state, while preserving stable root classes and Logo’s root class prop. Simplify Markdown conditions and move diff/copy state to its owning code-block wrapper. Keep hero buttons and pagination links stationary on hover, preserve customized pagination borders, and give minimal actions outline geometry with a transparent border.

Variant and syntax category overrides express conditions in property state maps. See the migration guide for sub-element/modifier replacements and shared prose states.

Unify responsive aliases as `@sm`, `@md`, and `@lg`, matching wider viewports; use negation for narrower layouts. Preserve the existing thresholds. Use native `:is(:popover-open)` for popovers and direct media conditions for component-specific thresholds. Remove the unused shell and medium-layout aliases; the migration guide covers renamed and removed aliases, including custom breakpoint definitions.
