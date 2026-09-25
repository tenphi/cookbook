---
name: upgrade-cookbook
description: Upgrade @tenphi/cookbook in a generated documentation site while preserving its content and configuration. Use when updating the site's Cookbook runtime.
---

# Upgrade a Cookbook site

1. Read `package.json`, the lockfile, `astro.config.ts`, and `docs.config.ts`. Use the package manager already selected by the site. Check the current and latest stable `@tenphi/cookbook` versions on npm, its release notes, and the target package's Astro peer range before changing dependencies.
2. Update `@tenphi/cookbook` and the lockfile with that package manager (`npm install`, `pnpm add`, or `yarn add`). Update `astro` only when the target Cookbook release requires or recommends it. Keep the site's content, `theme.styles`, component overrides, and deployment settings; the project creator is for new sites, not an upgrade command.
3. Read the installed `node_modules/@tenphi/cookbook/docs/migration.md` and the release notes for changes between the old and new versions. Adapt configuration or components only where the new release requires it.
4. Treat `cookbook.lock.json` separately: it pins documentation imported from an npm package, not Cookbook itself. Run the site's `update` script only when intentionally changing that source package or repairing an invalid source lock.
5. Run the site's `doctor` and `build` scripts. Check representative pages, internal links, search, assets, and the generated sitemap and `llms.txt` when `site.url` is configured. If the site has a preview deployment, check it before publishing. Commit the dependency and lockfile changes together with any required migration edits.
