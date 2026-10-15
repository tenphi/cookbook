---
"@tenphi/cookbook": patch
"@tenphi/renderer": patch
---

Store the reader's color scheme and contrast in one `cookbook-appearance` object,
`{ theme, contrast }`, and document it as a stable contract. Another app on the
same origin, such as a product site that serves the docs under `/docs/`, can now
share the preference. A scheme saved under the previous `cookbook-theme` key is
still read and moves into the object on the next change.
