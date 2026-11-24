---
"@tenphi/renderer": patch
---

A component module beside content outside the site's folder, such as `docs/components/StatusBadge.ts` in a site created with `--source`, can import `@tenphi/cookbook/styling`. Node resolution from that folder could not reach the site's `node_modules`, so `astro dev` and `astro build` failed to resolve the import. Cookbook now resolves its own entries from the site for every importer.
