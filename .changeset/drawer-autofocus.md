---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
---

The mobile navigation drawer no longer moves focus back to its close button when focus has already moved elsewhere in the drawer. The browser focuses the close button as the drawer opens and fires the drawer's `toggle` event later; refocusing it then could take focus from a control the user had just reached, so the next Enter closed the drawer.
