---
"@tenphi/cookbook": patch
"@tenphi/renderer": patch
---

Stop client navigation from logging `Uncaught (in promise) AbortError:
Transition was skipped` on every page swap. Cookbook skips the browser's view
transition for instant swaps, and the rejected `ready` promise is now handled.
Navigation behavior is unchanged.
