---
"@tenphi/docs": patch
"@tenphi/renderer": patch
---

Make borders quieter and refresh the page footer controls. The `border` and `border-strong` roles now take about one eighth (a `0.12` factor) of the brand saturation instead of one fifth, so with a vivid brand they stay close to the soft text color instead of reading as tinted lines. The page actions share the pagination cards' fill, gain copy and download icons, and give clearer hover and pressed feedback. The copy control is now labeled **Copy as Markdown** and briefly shows a check after a successful copy. Pagination hover strengthens the card border, and the **Edit page** link gains a pencil icon, a rounded focus ring, and a stronger resting color than the surrounding metadata. New customizable sub-elements: `PageActions.Active`, `PageActions.Icon`, `PageActions.CopyIcon`, `PageActions.DownloadIcon`, and `Footer.MetaLinkIcon`.
