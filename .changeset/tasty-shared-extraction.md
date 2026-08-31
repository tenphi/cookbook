---
"@tenphi/starlight": minor
---

Move Cookbook UI styling to linted Tasty components and selector styles backed
by Glaze theme tokens, extract those styles into shared static CSS during Astro
builds without shipping the Tasty client runtime, and support displaying the
documented package version beside the site title, inferred from single-package
npm sources when possible. Cookbook-owned layout, navigation, appearance,
search, and header UI now use direct `tasty()` components whose defaults can be
extended or fully replaced through `theme.styles`.
