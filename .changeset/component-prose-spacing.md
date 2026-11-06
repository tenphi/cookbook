---
"@tenphi/renderer": patch
---

Keep prose block spacing out of tab, code group, code block, and card anatomy. Tab panels now sit directly under the tab list, panel content starts at the panel padding, code group captions keep their own gap to the code, copy buttons stay in the top-right corner regardless of stylesheet order, and card descriptions follow the title by the card gap, staying at the top when a grid stretches the card. New customizable sub-elements: `Tabs.Tab`, `Tab.Body`, `CodeGroup.MarkdownCodeBlock`, and `Card.Body`.
