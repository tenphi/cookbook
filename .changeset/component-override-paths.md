---
"@tenphi/docs": minor
"@tenphi/cookbook": minor
---

`components.overrides` now rejects names that are not Cookbook component slots with `DOCS_CONFIG_UNKNOWN_KEY`; its type and JSON schema list every slot. `cookbook doctor` resolves override paths from the Astro project directory, as the build does: `./` paths and package specifiers resolve from the app, and a value such as `src/Header.astro` is reported as `DOCS_COMPONENT_UNRESOLVED`. `DocsProject` exposes the `directory` searched for configuration.

Package pages no longer receive an edit link generated from `editLink.baseUrl`, which pointed into the site's repository at a file that exists only in the npm artifact. A package page's own `editUrl` still applies.
