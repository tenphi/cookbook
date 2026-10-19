---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

`Preview` frames that run scripts now fit their content. The frame grows and
shrinks as the demo's content, the page width, or its fonts change, from its
minimum height (`10rem`, or the `height` prop) up to the browser window's
height; taller content scrolls inside the frame, as before. The frame keeps its
opaque origin: a small script in the preview document reports the content's
height to the page with `postMessage`. Overlays such as a listbox, a popover,
or a modal dialog aren't measured, so a new `buffer` prop adds room below the
content, such as `15rem` for a select's list, and that room follows the content
as the page width changes. `buffer` takes a CSS length like `height`; any other
value fails the build. Previews without scripts keep their `10rem` frame and
ignore `buffer`.
