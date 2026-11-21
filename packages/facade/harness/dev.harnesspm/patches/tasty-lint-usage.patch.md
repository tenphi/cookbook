## After you change styles

- Lint the style modules you changed and fix every `tasty/*` problem: `tasty-lint:check <files>`.
- The rules see Cookbook's styling helpers and theme names only through a `tasty.config.ts` that extends `@tenphi/cookbook`. Without it, they check nothing in a Cookbook site, and `tasty-lint:check` notes each file it found no styles in. Create it, with `@typescript-eslint/parser` for `.ts` modules, as the "Custom components" page shows.
- Each `tasty/<rule>` has a page in the `tasty-lint` docs index.
