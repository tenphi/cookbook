---
"@tenphi/create-cookbook": patch
---

`--deploy github-pages` now writes the workflow where GitHub runs it. For a site created inside an existing Git repository, such as `docs-site/` after `--source .`, the creator writes `.github/workflows/deploy-docs.yml` at the repository root, runs the build in the site directory, prints the workflow path, and stops without writing files if that workflow already exists.

Yarn sites get `.yarnrc.yml` with `nodeLinker: node-modules`, because Cookbook does not support Plug'n'Play, and an empty `yarn.lock` so they install as their own project inside an existing Yarn repository. The generated upgrade skill runs the site's `validate` script, which includes the built-output checks.
