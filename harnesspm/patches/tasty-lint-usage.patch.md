## After you change styles

- Run `pnpm lint`, or `tasty-lint:check <files>` for the Tasty rules alone, and fix every `tasty/*` problem. ESLint lints the `.js` and `.mjs` modules here, such as the renderer's `*.styles.js`. The `tasty.config.mjs` files of `packages/renderer` and `packages/facade` describe Cookbook's helpers and theme names; they read the built `dist/`.
- Each `tasty/<rule>` has a page in the `tasty-lint` docs index.

## Exceptions

- Run `pnpm lint`: it allows no warnings. Disable a rule only in the cases that "Validation" in `AGENTS.md` lists, for one line, with a specific reason: `// eslint-disable-next-line tasty/<rule> -- <reason>`. Never weaken a rule or raise the warning limit.
