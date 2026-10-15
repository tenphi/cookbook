---
"@tenphi/cookbook": patch
"@tenphi/renderer": patch
---

Restore the gap above top-level sidebar sections. `Sidebar.TopLevelSpacing`
no longer applies to sections, so `Sidebar.GroupSpacing` sets their spacing
regardless of stylesheet order.
