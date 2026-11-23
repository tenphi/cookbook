## Where colors come from

- Colors that adapt to light, dark and high contrast come from a Glaze theme or palette. Change the theme, not the CSS or tokens exported from it, and do not write dark or high-contrast values by hand.
- In a Cookbook site, that theme is `theme.brand` and `theme.palette` in `docs.config.ts`: Cookbook builds it with Glaze, and styles use its colors as tokens, such as `#text`, `#surface` or `#accent-text`. A new color role goes into `theme.palette` as a Glaze declaration with `base`, `tone` and `contrast`, before you use its `#name`. Do not make a Glaze theme of your own there.
- The `glaze-theme` skill has the steps for a Cookbook site. When another workspace gets Glaze's harness without Cookbook, directly or through a package such as UI Kit, harnesspm keeps Glaze's own skill, `sync` warns, and `npx harnesspm why glaze:skills/glaze-theme` says it keeps the original. Then read Cookbook's steps in `node_modules/.harnesspm/pkgs/@tenphi/cookbook/harness/skills/glaze-theme/SKILL.md` instead.

## Checking a theme

- In a Cookbook site, after you change `theme.brand` or `theme.palette`, run `cookbook doctor` (the site's `doctor` script). It fails on every contrast floor that the theme misses.
- To see every color of the site in light, dark and high contrast, with its contrast floor, run `glaze:inspect @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from the folder with `docs.config.ts`; `-C` does not change that folder. Add `--color <part>` for fewer colors: `--color accent,focus` shows what Cookbook derives from the brand.
- For a theme of your own, run `glaze:inspect` on the file that defines it. Either way, fix every ✗ and every Glaze warning it prints.
- To check two literal colors, run `glaze:contrast <text> <background>`.
