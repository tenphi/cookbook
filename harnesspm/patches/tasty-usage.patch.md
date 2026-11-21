## Checking styles

- After `pnpm build`, run `tasty:styles '<json>' --setup @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from `apps/reference`. It prints the CSS with the reference site's tokens, units, presets and states, read from the built `dist/` folders.
- The tool does not check `#color` or `$token` names: a misspelled one still prints as a `var()` ([tasty#473](https://github.com/tenphi/tasty/issues/473)). Look a color up with `glaze:inspect` and `--color <name>`, as the Glaze rule shows.
