---
"@tenphi/docs": patch
"@tenphi/starlight": patch
---

Render top-level sidebar groups as permanent section headings with aligned links. Collapse deeper groups until expanded, reveal the current page's ancestors, and remember explicit expansion choices within each navigation tab. Replace vertical rails with indentation, constrain long labels to the sidebar width, and expose the section headings, disclosure carets, active groups, and badges through `theme.styles.Sidebar`. Preserve desktop scroll independently of mobile scrolling and clean up persistence listeners when the sidebar is removed.
