---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

Enable Astro's built-in hover/focus page prefetching by default. Brief pointer
crossings do not prefetch pages, and data-saving or slow connections fall back
to tap intent. Preserve explicit Astro prefetch settings, including disabling
prefetching with `prefetch: false`. Notify the initial page-load lifecycle when
the router is still lazy so prefetching also works after the first client
navigation, and retain keyboard-focus prefetching when the document body is
replaced.
