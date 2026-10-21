---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
---

Truncate desktop header links and the search button label with an ellipsis when the header runs out of room, instead of letting the search label overflow its button. `HeaderLinks.DesktopLink` now renders each link as a vertically centered block so its text can truncate.
