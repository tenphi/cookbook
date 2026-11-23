## Checking styles

- To see the CSS that styles produce, run `tasty:styles '<json>' --setup <module that calls configure()>`.
- In a Cookbook site, the module is `@tenphi/cookbook/harness/dev.harnesspm/theme.mjs`: run the tool from the folder with `docs.config.ts`, which `-C` does not change. The module loads the site's tokens, units, presets and states as a Cookbook build does.
- The tool does not check `#color` or `$token` names: a misspelled one still prints as a `var()` ([tasty#473](https://github.com/tenphi/tasty/issues/473)). Look a color up with `glaze:inspect` and `--color <name>`, as the Glaze rule shows.
