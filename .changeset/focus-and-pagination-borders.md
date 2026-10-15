---
"@tenphi/cookbook": patch
"@tenphi/renderer": patch
---

Polish focus and pagination styles:

- Keyboard-focused sidebar links draw their focus ring above the next item.
- The main content no longer shows a focus ring after a click followed by
  keyboard scrolling. It remains the skip-link and page-swap focus target.
- Previous/Next pagination links show their border at rest again.
