# @tenphi/create-cookbook

Create a static docs project from the actual contents of a published package:

```sh
npm create @tenphi/cookbook@latest my-docs -- --package your-package --yes
```

The creator resolves an exact npm version and integrity hash, inspects the
published README/docs/assets, and generates an Astro 7 project using the same
Cookbook release as the creator. Choose npm, pnpm, or Yarn with
`--package-manager`; the optional `--deploy github-pages` workflow uses that
manager's immutable install command.

Package scripts are never executed. Markdown is handled in safe mode by
default; pass `--trust-package` only after reviewing the exact locked artifact
when its MDX needs to execute at build time.
