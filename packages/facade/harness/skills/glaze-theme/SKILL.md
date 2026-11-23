---
name: glaze-theme
description: Create or change the colors of a Cookbook site, set in theme.brand and theme.palette, and check them in light, dark and high contrast. Use when adding or changing colors, tokens, a dark mode, a high-contrast mode, a status color or a brand color with @tenphi/glaze, or when fixing a contrast problem, a Glaze warning or a cookbook doctor contrast error.
---

# Changing the colors of a Cookbook site

Cookbook passes this skill on in place of Glaze's own: in a Cookbook site, Glaze runs inside Cookbook, which builds one Glaze theme from the site's configuration.

## 1. Read the docs

Open Cookbook's docs index and Glaze's docs index from the harnesspm block in `AGENTS.md`. Read the pages the task needs:

| Task                                           | Page                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| The brand, palette roles, names and references | Cookbook's "Theme and components": "Brand color", "Semantic palette", "Add palette colors and reference other roles" |
| The roles that exist, to override or reuse     | Cookbook's "Theme and components": "Built-in palette inventory"                                                      |
| A contrast error from `cookbook doctor`        | Cookbook's "Theme and components": "Contrast checks and troubleshooting"                                             |
| Tone windows, mix, shadow and glow colors      | Cookbook's "Theme and components": "Configure Glaze adaptation"                                                      |
| Exact fields of a color declaration            | Glaze's "Color definitions" reference                                                                                |
| WCAG or APCA, roles, unmet floors              | Glaze's "Contrast solving"                                                                                           |

## 2. Find the theme

The site's colors are `theme.brand` and `theme.palette` in `docs.config.ts`. `theme.glaze` sets Glaze's tone windows and adaptation, and `theme.contrastLevel` sets the contrast level. Change these and nothing else:

- Do not create a Glaze theme of your own or call `glaze()` in the site.
- Do not write CSS colors, dark values or high-contrast values by hand. Cookbook resolves every declaration for light, dark and both high-contrast schemes, and the build writes the CSS.

## 3. Write colors

1. **The brand** is a Glaze `from` declaration: `brand: { from: "#2f5bff" }`. It seeds the hue and saturation; Cookbook derives the accent text, the filled controls and the focus ring from it, each with its own contrast floor. To see them, set the brand and run `glaze:inspect` (step 4.2) with `--color accent,focus`.
2. **Names.** A palette role is a lowercase name with hyphens. `review-panel` becomes the token `#review-panel`. A built-in name, such as `surface` or `text`, changes that role. Give new roles a project prefix, so a future built-in role cannot take the name.
3. **Surfaces** get an absolute `tone` (0–100).
4. **Dependent colors** name a `base`, another role, with a tone step such as `tone: "-2"`. Order in the file does not matter, and references can name built-in roles.
5. **Readable colors** (text, icons, borders that must be seen) get a `contrast` floor against their base, such as `contrast: { wcag: [4.5, 7] }`. In a pair, the first value is for normal contrast and the second for high contrast. Use an absolute tone for reading text. Do not add floors to decorative colors.
6. **Saturation** is a 0–1 factor of the brand's saturation. Use `hue` or `from` when a role needs its own color.
7. **Status roles** `info`, `success`, `warning` and `danger` take declarations and give `-text` and `-surface` tokens. For `orange`, `green`, `blue`, `purple` and `red`, also set the matching `-text` role.

Use a new color in styles as `#name` only after it is in `theme.palette`.

## 4. Check it

Run the tools from the folder with `docs.config.ts`. `-C` does not change that folder.

1. Run the site's `doctor` script (`cookbook doctor`). It fails on every contrast floor the theme misses and names the pair, the scheme and the target.
2. To see every color in light, dark and both high-contrast schemes, with its contrast against its base, run `npx harnesspm run glaze:inspect @tenphi/cookbook/harness/dev.harnesspm/theme.mjs`. Add `--color <part>` for fewer colors. A ✗ is a missed floor.
3. Fix each miss and each Glaze warning: use an absolute tone for reading text, choose a base further away, lower the saturation, or give the high-contrast side its own value with a pair. Keep `autoFlip` on when a color needs to cross its base.
4. Run both again until every floor is met. The high-contrast columns count: a user with "increase contrast" on sees them.
5. To check two literal colors, run `npx harnesspm run glaze:contrast <text> <background>`. The text color comes first.
6. Run the site's `validate` script before you finish.

There is no export step: the build turns the palette into the site's CSS.
