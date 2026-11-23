## After you change styles

- Lint the style modules you changed and fix every `tasty/*` problem: `tasty-lint:check <files>`.
- In a Cookbook site, the rules see Cookbook's styling helpers and the site's theme names only through a `tasty.config.ts` built with `createValidationConfig(docs.theme)` from `@tenphi/cookbook/eslint-plugin`, as the "Custom components" page shows. Without it, they check nothing in a Cookbook site, and `tasty-lint:check` notes each file it found no styles in.
- In a Cookbook site, the rules do not read `theme.styles`, `theme.customStyles` or `theme.recipes` in `docs.config.ts`, and neither `cookbook doctor` nor the build checks their values. Do not lint that file: check each changed object with `tasty:styles`, as the Tasty rule shows.
- Each `tasty/<rule>` has a page in the `tasty-lint` docs index.
