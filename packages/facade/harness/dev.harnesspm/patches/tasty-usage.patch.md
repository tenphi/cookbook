## Checking styles

- To see the CSS that styles produce with the site's tokens, units, presets and states, run `tasty:styles '<json>' --setup @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from the folder with `docs.config.ts`; `-C` does not change that folder. The setup reads the theme as a Cookbook build does.
- The tool does not check `#color` or `$token` names: a misspelled one still prints as a `var()` ([tasty#473](https://github.com/tenphi/tasty/issues/473)). Look a color up with `glaze:inspect` and `--color <name>`, as the Glaze rule shows.
