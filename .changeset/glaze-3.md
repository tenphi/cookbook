---
"@tenphi/docs": minor
"@tenphi/renderer": minor
---

Upgrade Glaze to 3.0.0. Shadows now step an exact number of tones: the built-in `shadow` role steps 8 tones in light and dark and is transparent in high contrast. In the default contrast mode, light shadows look as before and dark ones are noticeably stronger, since 2.x stepped only about 3 tones on a dark page. `theme.glaze.shadowTuning` and a shadow role's own `tuning` take Glaze 3's `objectInfluence`, `tint`, `reach`, and `hueBleed` instead of the removed 2.x fields, and palette roles accept `glow` declarations.
