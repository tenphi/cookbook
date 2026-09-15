---
"@tenphi/create-cookbook": minor
"@tenphi/cookbook": minor
"@tenphi/docs": minor
"@tenphi/starlight": minor
---

Upgrade the renderer to Astro 7.3 and Starlight 0.42, adopt Starlight's
Popover-based mobile navigation, and use a single graph-backed rendering path
that is independent of Astro content collections. Render trusted MDX through
Starlight with relative imports intact, restore a generated 404 page, and
support content-hashed local hero images, including deployments under Astro
base paths.

Harden locked npm content by confining package paths and globs to the artifact,
revalidating cached trees, rejecting ambiguous lock matches, removing raw HTML
from untrusted Markdown and HTML-capable frontmatter. Rewrite reference-style
links and images plus local downloadable files as hashed static assets.

Align page frontmatter with Starlight (`tableOfContents`, `pagefind`, and
`banner`), apply sidebar metadata to generated navigation, connect site URL and
repository metadata to Astro/Starlight, implement repository-link localization
and explicit raw HTML policies, remove the remaining inactive configuration
keys, and strengthen runtime and JSON Schema validation.

Generate projects with the creator's matching Cookbook release, typed
configuration, and package-manager-aware GitHub Pages workflows. Standardize
CLI JSON output and report empty documentation graphs as errors.
