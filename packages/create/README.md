# @tenphi/create-cookbook

Create a local documentation project:

```sh
npm create @tenphi/cookbook@latest my-docs
```

Pass `-- --source ../my-project` to document an existing repository without
copying its content:

```sh
npm create @tenphi/cookbook@latest my-docs -- --source ../my-project
```

The generated `docs.config.ts` is shared by Astro and `cookbook doctor`.
The creator also writes `AGENTS.md` with setup and validation guidance for
coding agents and `.agents/skills/upgrade-cookbook/SKILL.md` for upgrading the
generated site. Existing agent instructions and skills are preserved.
Or create a site from the actual contents of a published package:

```sh
npm create @tenphi/cookbook@latest my-docs -- --package your-package --yes
```

The creator resolves an exact npm version and integrity hash, inspects the
published README/docs/assets, and generates an Astro 7 project using the same
Cookbook release as the creator. Choose npm, pnpm, or Yarn with
`--package-manager`; Yarn sites use the `node-modules` linker. The optional
`--deploy github-pages` workflow uses that manager's immutable install command.
Inside an existing Git repository, it is written to the repository root's
`.github/workflows/deploy-docs.yml` and builds in the site directory.
`--deploy netlify`, `cloudflare-pages`,
or `vercel` writes host-specific setup guidance; Netlify also receives a
`netlify.toml` build configuration.

Package scripts are never executed. Markdown is handled in safe mode by
default; pass `--trust-package` only after reviewing the exact locked artifact
when its MDX needs to execute at build time.
