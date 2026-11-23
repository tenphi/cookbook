## Checking styles

- To see the CSS that styles produce, run `tasty:styles '<json>' --setup <module that calls configure()>`.
- In a Cookbook site, the module is `@tenphi/cookbook/harness/dev.harnesspm/theme.mjs`: run the tool from the folder with `docs.config.ts`, which `-C` does not change. The module loads the site's tokens, units, presets and states as a Cookbook build does.
- With that module, the tool also warns about each `#color` or `$token` name that the site's theme does not define.
