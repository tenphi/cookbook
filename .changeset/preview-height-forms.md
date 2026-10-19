---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

Add a `height` prop to `Preview` for demos that need more room, such as a
listbox, a popover, or a modal dialog. It sets the frame's minimum height to a
CSS length, such as `18rem`, in place of the default `10rem`; any other value
fails the build. Forms in previews can now be submitted: the frame's sandbox
includes `allow-forms`, so a `submit` listener can call `event.preventDefault()`
and show the form's data. The frame keeps its opaque origin, and a submission
can navigate only the frame, never the documentation page.
