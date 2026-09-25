---
name: upgrade-starlight
description: Upgrade @astrojs/starlight in the Cookbook repository, including compatibility changes and verification. Use when changing Cookbook's Starlight dependency.
---

# Upgrade Starlight in Cookbook

1. Check the current version in `pnpm-lock.yaml`, then verify the latest stable `@astrojs/starlight` release, release notes, and peer dependencies from npm and the [upstream releases](https://github.com/withastro/starlight/releases). Review the changes between the installed and target versions before editing Cookbook.
2. Update the Starlight catalog in `pnpm-workspace.yaml` and install with the repository's Node version and pnpm. If the target is younger than the repository's `minimumReleaseAge`, add its exact version to `minimumReleaseAgeExclude` only after reviewing that release. Inspect the lockfile for unrelated resolution changes.
3. Check the compatibility surfaces in `packages/starlight/src/`: the Starlight integration, virtual modules, owned component overrides, client behavior, and the CSS stripping bridge. Adapt markup or behavior when upstream changes require it. Preserve `AGENTS.md` styling rules: site CSS comes from Tasty and Glaze, and configurable styled components expose their named sub-elements. Assess new upstream features for useful Cookbook configuration rather than copying upstream styles.
4. Build both reference and convention sites and run the repository's type, test, development, package, publishing, and clean-install checks. Inspect built HTML and assets when a changed upstream component, route, search feature, or style bridge makes output behavior uncertain. Fix regressions and rerun affected checks.
5. Record user-facing compatibility or feature changes in a changeset and documentation. Keep the upgrade in a reviewable PR; follow the repository's release process after merge.
