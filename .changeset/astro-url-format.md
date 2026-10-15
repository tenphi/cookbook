---
"@tenphi/cookbook": patch
"@tenphi/docs": patch
"@tenphi/renderer": patch
---

Follow Astro's `trailingSlash` and `build.format` for page URLs. Sites built
with `build.format: "file"` now resolve every page instead of rendering an
untitled `noindex` fallback, and `check-build` accepts `guide.html` output.
Internal links, alias redirects, language and version switchers, search
results, canonicals, and `llms.txt` now share one URL format. With the default
directory output, internal links end with a slash (`/guide/`) to match their
canonicals and avoid a host redirect on every navigation.
