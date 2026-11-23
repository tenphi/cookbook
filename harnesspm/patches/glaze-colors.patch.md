## Where colors come from

- Cookbook's palette is one Glaze theme, built in `packages/docs/src/theme/palette.ts` from a site's `theme.brand` and `theme.palette`. Components use its semantic tokens, such as `#text` or `#accent-text`. Never hard-code a color in a component.
- A new color role is a `theme.palette` input that Glaze resolves for every scheme and contrast mode, with its public types, schema, docs and tests: see "All component colors must use semantic theme color tokens" under "Behavior layer" in `AGENTS.md`.
- The reference site's own colors are in `apps/reference/docs.config.ts`.
- The `glaze-theme` skill is written for a site, such as the reference site. Its steps for writing declarations also hold for the built-in roles in `palette.ts`, the one place that calls `glaze()`; the pages it names are in `docs/`. Check the result as "Checking a theme" says below, not with the site scripts the skill names.

## Checking a theme

- After `pnpm build`, run `glaze:inspect @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from `apps/reference` to see every color of the reference site in light, dark and high contrast. It reads the built `dist/` folders.
- Cookbook adds its own contrast checks: `node packages/facade/dist/cli.js doctor --root apps/reference` and `pnpm check:theming` run them.
- To try one color, run `glaze:color <color> --base '#ffffff' --contrast AA`. To check two literal colors, run `glaze:contrast <text> <background>`.
