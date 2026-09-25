# Contributing

Use Node.js 22.19+ and pnpm 11. Run `pnpm install`, then `pnpm test`,
`pnpm typecheck`, and `pnpm build`. Public package changes require a Changeset.

Keep consumer documentation in the root `docs/` directory. The facade build
and prepack step generate `packages/facade/docs/` from those sources and the
renderer dependencies' published Tasty and Glaze documentation. Do not edit or
commit the generated copies. Packaging localizes reference links, retains
upstream licenses, and records dependency versions in `upstream/manifest.json`.
Source files and artwork absent from the dependencies link to their release
refs. `pnpm check:packages` validates the documentation in the actual tarball.
