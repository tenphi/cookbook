## Checking styles

- After `pnpm build`, run `tasty:styles '<json>' --setup @tenphi/cookbook/harness/dev.harnesspm/theme.mjs` from `apps/reference`. It prints the CSS with the reference site's tokens, units, presets and states, read from the built `dist/` folders, and warns about each `#color` or `$token` name that the reference theme does not define.
