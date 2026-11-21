## Where colors come from

- In a Cookbook site, colors come from `theme.brand` and `theme.palette` in `docs.config.ts`. Cookbook resolves them with Glaze for light, dark and high contrast. Styles use them as tokens, such as `#text`, `#surface` or `#accent-text`.
- A new color role goes into `theme.palette` as a Glaze declaration with `base`, `tone` and `contrast`, before you use its `#name`. Do not make a Glaze theme of your own, and do not write dark or high-contrast values by hand.
- The `glaze-theme` skill explains how to write a declaration. In a Cookbook site, the theme it changes is `theme.palette`.

## Checking a theme

- After you change `theme.brand` or `theme.palette`, run `cookbook doctor` (the site's `doctor` script). It fails on every contrast floor that the theme misses.
- To see every color of the site in light, dark and high contrast, with its contrast floor, run `glaze:inspect @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from the folder with `docs.config.ts`; `-C` does not change that folder. Add `--color <part>` for fewer colors.
- To try a brand color before you set it, run `glaze:color <color> --base '#ffffff' --contrast AA`.
- To check two literal colors, run `glaze:contrast <text> <background>`.
