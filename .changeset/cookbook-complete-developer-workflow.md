---
"@tenphi/cookbook": minor
"@tenphi/create-cookbook": minor
"@tenphi/docs": minor
"@tenphi/starlight": minor
---

Complete the developer workflow from setup and customization through publishing and maintenance.

- Keep production drafts available by direct link while excluding them from navigation, search, sitemaps, and agent indexes. Correct locale navigation, real language fallbacks, translated controls, and locale-aware version links.
- Expose the complete Glaze palette graph, custom color roles, adaptation settings, Tasty units and recipes, and every owned style surface with named sub-elements. Strengthen contrast diagnostics across light, dark, and high-contrast modes while retaining absolute body and heading tones.
- Self-host and cache Google Fonts with preset-aware weights, variable ranges, and italics. Add one site logo configuration for headers and mobile navigation, a full-width mobile header divider, and a separate rounded-header-control token.
- Replace inline syntax highlighting styles with extracted Tasty rules, enforce the rendered styling contract, and improve search focus, code-group highlighting/copying, optional mobile contents, and hero image dimensions.
- Define tested Starlight plugin compatibility, custom frontmatter schemas, and a server-side content API. Improve OpenAPI parameter overrides, examples, local references, and authentication requirements.
- Add typed publishing metadata, preview and version indexing controls, canonical/social/breadcrumb settings, clean per-page Markdown, and copy/download actions for readers and agents.
- Expand preflight asset checks and add `cookbook check-build` for built output and deployed routes. Generated sites include a complete validation command. Add real packed-consumer, browser/accessibility, upstream, and performance checks.
- Document versioned upgrades and troubleshooting, build-check complete configuration recipes, and organize guides around developer tasks while preserving existing URLs.

Migration notes: Google font shorthand now downloads the needed weights/styles and serves them locally; preserve its build cache or select remote delivery explicitly. Stricter contrast and inline-style checks can expose existing custom-theme or plugin problems. Header controls now use `$header-control-radius` independently of `$radius`. See the upgrade guide for details.
