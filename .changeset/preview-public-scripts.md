---
"@tenphi/renderer": minor
"@tenphi/cookbook": minor
---

Add a `scripts` prop to `Preview` for demos that run your own library code.
List files from the site's public directory, such as `["/demo/button.js"]`;
Cookbook inlines them in order before `javascript`, so the preview stays in its
opaque-origin sandbox and also works in `astro dev`, `astro preview`, and
offline, where a `<script src>` request from the frame fails. View source shows
each file as a `<script src>` tag, and a missing path or one outside the public
directory fails the build. Authored `javascript` that contains `</script>` no
longer ends the preview's script early.
