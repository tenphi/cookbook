## Site files

- In this repository, `apps/reference` is Cookbook's own docs site. Its `docs.config.ts` reads the root `docs/` folder: edit pages there, never the generated `packages/facade/docs/`. `apps/convention` passes its configuration to `cookbook()` inline.
- `docs/agents.md` is the start page of the docs for agents. The rules for working on Cookbook itself are in the root `AGENTS.md`.

## Checking a site

- After `pnpm build`, check the reference site: `node packages/facade/dist/cli.js doctor --root apps/reference`, then `pnpm build:reference`, `node packages/facade/dist/cli.js check-build --root apps/reference` and `node scripts/check-reference-budgets.mjs`. `CONTRIBUTING.md` lists the other checks.
