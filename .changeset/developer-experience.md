---
"@tenphi/cookbook": minor
"@tenphi/docs": minor
"@tenphi/starlight": minor
"@tenphi/create-cookbook": minor
---

Unify project configuration across Astro and the CLI, support local repository starters, reconcile declared package sources with locks, and restore the development server and content watching.

Add source IDs and roots, repeated mounts, scoped slugs, explicit cross-source links, redirects, reusable configuration presets, HTML sanitization, preserved page metadata, typed component styles and props, and accessible tabs, callouts, and code groups. Update guides and add development and public API regression checks.

Breaking prerelease changes: locks must match requested package specifiers; slugs are relative to source mounts; safe HTML is preserved by `sanitize` (use `strip` for removal); custom styles move to `theme.customStyles`; `Tabs` expects labeled `Tab` panels. See the migration guide.
