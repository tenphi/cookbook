# @tenphi/cookbook

## 0.31.2

### Patch Changes

- Updated dependencies [[`e8e391f`](https://github.com/tenphi/cookbook/commit/e8e391fc37ae45b640c863770ce963d602356b83)]:
  - @tenphi/docs@0.31.2
  - @tenphi/renderer@0.31.2

## 0.31.1

### Patch Changes

- Updated dependencies [[`ff84d1f`](https://github.com/tenphi/cookbook/commit/ff84d1f165288684cbbeb7ad247bdd8b0535e3d8)]:
  - @tenphi/docs@0.31.1
  - @tenphi/renderer@0.31.1

## 0.31.0

### Patch Changes

- Updated dependencies [[`80f1821`](https://github.com/tenphi/cookbook/commit/80f18210bfd6c40caccaeb58d09461adf05c1316)]:
  - @tenphi/renderer@0.31.0
  - @tenphi/docs@0.31.0

## 0.30.2

### Patch Changes

- Updated dependencies [[`a406b29`](https://github.com/tenphi/cookbook/commit/a406b297cd538db788d7cd593f34cde90b31e4ec)]:
  - @tenphi/renderer@0.30.2
  - @tenphi/docs@0.30.2

## 0.30.1

### Patch Changes

- [#179](https://github.com/tenphi/cookbook/pull/179) [`b82025b`](https://github.com/tenphi/cookbook/commit/b82025b364fcdf2bbd4e893bb6728c222fb05b09) Thanks [@tenphi](https://github.com/tenphi)! - The mobile navigation drawer no longer moves focus back to its close button when focus has already moved elsewhere in the drawer. The browser focuses the close button as the drawer opens and fires the drawer's `toggle` event later; refocusing it then could take focus from a control the user had just reached, so the next Enter closed the drawer.

- Updated dependencies [[`b82025b`](https://github.com/tenphi/cookbook/commit/b82025b364fcdf2bbd4e893bb6728c222fb05b09), [`2a9b382`](https://github.com/tenphi/cookbook/commit/2a9b382095c7706b7bb1770f3b2219d2ab08715f)]:
  - @tenphi/renderer@0.30.1
  - @tenphi/docs@0.30.1

## 0.30.0

### Minor Changes

- [#172](https://github.com/tenphi/cookbook/pull/172) [`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af) Thanks [@tenphi](https://github.com/tenphi)! - GitHub alerts (`MarkdownAlert`) now use the status palette roles that `Callout` uses: `info` for notes, `success` for tips, `warning` for cautions, and `danger` for danger, instead of the `blue`, `green`, and `red` hues. Default colors are unchanged; a customized `theme.palette.info`, `success`, or `danger` now restyles alerts as well as Callouts.

  `@tenphi/cookbook` re-exports `resolveDocsTheme` and the `ResolvedDocsTheme` type, so a site can inspect its theme's contrast checks without depending on `@tenphi/renderer` directly.

- [#172](https://github.com/tenphi/cookbook/pull/172) [`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af) Thanks [@tenphi](https://github.com/tenphi)! - `components.overrides` now rejects names that are not Cookbook component slots with `DOCS_CONFIG_UNKNOWN_KEY`; its type and JSON schema list every slot. `cookbook doctor` resolves override paths from the Astro project directory, as the build does: `./` paths and package specifiers resolve from the app, and a value such as `src/Header.astro` is reported as `DOCS_COMPONENT_UNRESOLVED`. `DocsProject` exposes the `directory` searched for configuration.

  Package pages no longer receive an edit link generated from `editLink.baseUrl`, which pointed into the site's repository at a file that exists only in the npm artifact. A package page's own `editUrl` still applies.

### Patch Changes

- [#172](https://github.com/tenphi/cookbook/pull/172) [`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af) Thanks [@tenphi](https://github.com/tenphi)! - Review and correct the packaged documentation. The configuration reference now follows the configuration's top-level keys and documents every page frontmatter field, the table of contents defaults, source-level navigation, and how package sources choose pages. The CLI reference lists the generated project scripts, the exact `validate` steps, creator defaults, Yarn setup, and every diagnostic code. The upgrade guide is ordered by release, including the 0.21–0.29 changes. Logo setup moves to the theme guide, and the custom components guide documents `createValidationConfig()`. Examples cover content layouts, languages, and previews; theme recipes cover branding, component styles, fonts, and shared themes.

  Corrected facts include the APCA floors for accent text and filled controls, border saturation, the overlay's Glaze mode, GitHub alert sub-elements and colors, breadcrumb thresholds, badge palette role names, the state alias count, and component override path resolution. Package READMEs now link to the published documentation and list the complete styling and lint exports.

- [#174](https://github.com/tenphi/cookbook/pull/174) [`015aca8`](https://github.com/tenphi/cookbook/commit/015aca8bf32eedf775b35420b4776c04d0c788af) Thanks [@tenphi](https://github.com/tenphi)! - Reserve enough desktop content padding for heading copy-link buttons and their focus rings, preventing the sidebar or viewport edge from clipping them.

- [#175](https://github.com/tenphi/cookbook/pull/175) [`2ab65d3`](https://github.com/tenphi/cookbook/commit/2ab65d397de9402f5d258ff83109d555c39b56c2) Thanks [@tenphi](https://github.com/tenphi)! - Upgrade Tasty from 3.11.2 to 3.14.0 and the Tasty ESLint plugin from 1.8.0 to 1.12.0. Tasty now emits working `transition: none` declarations for reduced motion, composes color opacity suffixes with `color-mix()`, and omits disabled spacing and size declarations. See the migration guide for custom translucent colors, numeric alpha tokens, and styles that relied on `false` emitting defaults.

  Use the plugin's built-in `mergeStyles` argument validation instead of a custom registration, so base styles require defaults while later arguments remain partial overrides. Remove an obsolete lint suppression for a value fixed during module evaluation.

- Updated dependencies [[`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af), [`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af), [`010c02a`](https://github.com/tenphi/cookbook/commit/010c02a45430d7717bbeef52eb02162e442722af), [`015aca8`](https://github.com/tenphi/cookbook/commit/015aca8bf32eedf775b35420b4776c04d0c788af), [`2ab65d3`](https://github.com/tenphi/cookbook/commit/2ab65d397de9402f5d258ff83109d555c39b56c2)]:
  - @tenphi/renderer@0.30.0
  - @tenphi/docs@0.30.0

## 0.29.0

### Minor Changes

- [#169](https://github.com/tenphi/cookbook/pull/169) [`8a7dc97`](https://github.com/tenphi/cookbook/commit/8a7dc9762874de35ef99341d62fcd206b1334c79) Thanks [@tenphi](https://github.com/tenphi)! - Update Tasty to 3.11.1 and the Tasty ESLint plugin to 1.7.2. Built-in styles now follow Tasty's style guidelines. They use spacing, radius, and border units instead of token arithmetic and `hide` instead of `display: none`. Transitions use semantic names that honor per-property duration tokens, and every state map has a default state. The renderer no longer needs file-wide lint exemptions. Tasty now emits each configured `@property` once, so spacing tokens keep their `inherits: false` registration.

  Code blocks, steps, the search button, the skip link, and the mobile header-link panel use logical spacing and positions, so they mirror correctly in right-to-left locales. Table header cells round their top corners without depending on direction. Card's `fill`, `shadow`, and `translate` overrides now also apply to linked cards, whose hover and pressed states live in Card's own state maps.

  Remove the `clear` palette role: Tasty now compiles `#clear` to `transparent`, so a customized `theme.palette.clear` no longer has any effect. See the migration guide for overrides that now use logical properties or `hide`.

### Patch Changes

- [#171](https://github.com/tenphi/cookbook/pull/171) [`940f785`](https://github.com/tenphi/cookbook/commit/940f785b34b2631e850f3cbfcba713282bc53048) Thanks [@tenphi](https://github.com/tenphi)! - Truncate desktop header links and the search button label with an ellipsis when the header runs out of room, instead of letting the search label overflow its button. `HeaderLinks.DesktopLink` now renders each link as a vertically centered block so its text can truncate.

- [#171](https://github.com/tenphi/cookbook/pull/171) [`940f785`](https://github.com/tenphi/cookbook/commit/940f785b34b2631e850f3cbfcba713282bc53048) Thanks [@tenphi](https://github.com/tenphi)! - Update Tasty to 3.11.2 and the Tasty ESLint plugin to 1.8.0. On a sub-element whose selector ends in a pseudo-element, `@own(...)` now describes the pseudo-element itself. Tasty ignores modifier, attribute, class, and tree-position states there with a warning instead of emitting selectors that never match. The `@tenphi/cookbook/eslint-plugin` presets accept every standard pseudo-class, such as `:popover-open` and `:dir(rtl)`, and no longer report conditions on the element a pseudo-element belongs to. The new `tasty/no-ignored-pseudo-element-state` rule reports ignored states as errors. Built-in styles drop the lint exceptions these limitations required.

- Updated dependencies [[`940f785`](https://github.com/tenphi/cookbook/commit/940f785b34b2631e850f3cbfcba713282bc53048), [`8a7dc97`](https://github.com/tenphi/cookbook/commit/8a7dc9762874de35ef99341d62fcd206b1334c79), [`940f785`](https://github.com/tenphi/cookbook/commit/940f785b34b2631e850f3cbfcba713282bc53048)]:
  - @tenphi/renderer@0.29.0
  - @tenphi/docs@0.29.0

## 0.28.0

### Minor Changes

- [#167](https://github.com/tenphi/cookbook/pull/167) [`6019743`](https://github.com/tenphi/cookbook/commit/601974300bff2a73904dc6fd1e9087f65e22c53a) Thanks [@tenphi](https://github.com/tenphi)! - `Preview` frames that run scripts now fit their content. The frame grows and
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

### Patch Changes

- Updated dependencies [[`6019743`](https://github.com/tenphi/cookbook/commit/601974300bff2a73904dc6fd1e9087f65e22c53a)]:
  - @tenphi/renderer@0.28.0
  - @tenphi/docs@0.28.0

## 0.27.0

### Minor Changes

- [#165](https://github.com/tenphi/cookbook/pull/165) [`4647fe2`](https://github.com/tenphi/cookbook/commit/4647fe23e20fd699f40f5da58eeb7fcbbe4e5cb8) Thanks [@tenphi](https://github.com/tenphi)! - Add a `height` prop to `Preview` for demos that need more room, such as a
  listbox, a popover, or a modal dialog. It sets the frame's minimum height to a
  CSS length, such as `18rem`, in place of the default `10rem`; any other value
  fails the build. Forms in previews can now be submitted: the frame's sandbox
  includes `allow-forms`, so a `submit` listener can call `event.preventDefault()`
  and show the form's data. The frame keeps its opaque origin, and a submission
  can navigate only the frame, never the documentation page.

### Patch Changes

- Updated dependencies [[`4647fe2`](https://github.com/tenphi/cookbook/commit/4647fe23e20fd699f40f5da58eeb7fcbbe4e5cb8)]:
  - @tenphi/renderer@0.27.0
  - @tenphi/docs@0.27.0

## 0.26.0

### Minor Changes

- [#163](https://github.com/tenphi/cookbook/pull/163) [`42dedd7`](https://github.com/tenphi/cookbook/commit/42dedd772adc44a96f8429c6e7c740db5c8f3107) Thanks [@tenphi](https://github.com/tenphi)! - Add a `scripts` prop to `Preview` for demos that run your own library code.
  List files from the site's public directory, such as `["/demo/button.js"]`;
  Cookbook inlines them as classic scripts, in order, before `javascript`, so the
  preview stays in its opaque-origin sandbox and also works in `astro dev`,
  `astro preview`, and offline, where a `<script src>` request from the frame
  fails. View source shows each file as a `<script src>` tag, and a missing path
  or one outside the public directory fails the build. Authored `javascript` that
  contains `</script>` no longer ends the preview's script early.

### Patch Changes

- Updated dependencies [[`42dedd7`](https://github.com/tenphi/cookbook/commit/42dedd772adc44a96f8429c6e7c740db5c8f3107)]:
  - @tenphi/renderer@0.26.0
  - @tenphi/docs@0.26.0

## 0.25.4

### Patch Changes

- [#162](https://github.com/tenphi/cookbook/pull/162) [`bf5b10a`](https://github.com/tenphi/cookbook/commit/bf5b10a49e3afb55efa63258258755f12143ade0) Thanks [@tenphi](https://github.com/tenphi)! - Store the reader's color scheme and contrast in one `cookbook-appearance` object,
  `{ theme, contrast }`, and document it as a stable contract. Another app on the
  same origin, such as a product site that serves the docs under `/docs/`, can now
  share the preference. A scheme saved under the previous `cookbook-theme` key is
  still read and moves into the object on the next change.

- [#160](https://github.com/tenphi/cookbook/pull/160) [`07c308c`](https://github.com/tenphi/cookbook/commit/07c308c1ad52043bfaeec348554552e5afdb7eb4) Thanks [@tenphi](https://github.com/tenphi)! - Polish focus and pagination styles:

  - Keyboard-focused sidebar links draw their focus ring above the next item.
  - The main content no longer shows a focus ring after a click followed by
    keyboard scrolling. It remains the skip-link and page-swap focus target.
  - Previous/Next pagination links show their border at rest again.

- Updated dependencies [[`bf5b10a`](https://github.com/tenphi/cookbook/commit/bf5b10a49e3afb55efa63258258755f12143ade0), [`07c308c`](https://github.com/tenphi/cookbook/commit/07c308c1ad52043bfaeec348554552e5afdb7eb4)]:
  - @tenphi/renderer@0.25.4
  - @tenphi/docs@0.25.4

## 0.25.3

### Patch Changes

- [#158](https://github.com/tenphi/cookbook/pull/158) [`7778fc9`](https://github.com/tenphi/cookbook/commit/7778fc9c564401ae6554466e04dfa97805184c85) Thanks [@tenphi](https://github.com/tenphi)! - Restore the gap above top-level sidebar sections. `Sidebar.TopLevelSpacing`
  no longer applies to sections, so `Sidebar.GroupSpacing` sets their spacing
  regardless of stylesheet order.
- Updated dependencies [[`7778fc9`](https://github.com/tenphi/cookbook/commit/7778fc9c564401ae6554466e04dfa97805184c85)]:
  - @tenphi/renderer@0.25.3
  - @tenphi/docs@0.25.3

## 0.25.2

### Patch Changes

- [#155](https://github.com/tenphi/cookbook/pull/155) [`b5cc407`](https://github.com/tenphi/cookbook/commit/b5cc40780d9614d573c2aaf1f3c4698b6265768e) Thanks [@tenphi](https://github.com/tenphi)! - Stop client navigation from logging `Uncaught (in promise) AbortError:
Transition was skipped` on every page swap. Cookbook skips the browser's view
  transition for instant swaps, and the rejected `ready` promise is now handled.
  Navigation behavior is unchanged.
- Updated dependencies [[`b5cc407`](https://github.com/tenphi/cookbook/commit/b5cc40780d9614d573c2aaf1f3c4698b6265768e)]:
  - @tenphi/renderer@0.25.2
  - @tenphi/docs@0.25.2

## 0.25.1

### Patch Changes

- [#153](https://github.com/tenphi/cookbook/pull/153) [`c3448e8`](https://github.com/tenphi/cookbook/commit/c3448e866b5fafb84608e6220fd03bf0623be570) Thanks [@tenphi](https://github.com/tenphi)! - Follow Astro's `trailingSlash` and `build.format` for page URLs. Sites built
  with `build.format: "file"` now resolve every page instead of rendering an
  untitled `noindex` fallback, and `check-build` accepts `guide.html` output.
  Internal links, alias redirects, language and version switchers, search
  results, canonicals, and `llms.txt` now share one URL format. With the default
  directory output, internal links end with a slash (`/guide/`) to match their
  canonicals and avoid a host redirect on every navigation.

- [#153](https://github.com/tenphi/cookbook/pull/153) [`c3448e8`](https://github.com/tenphi/cookbook/commit/c3448e866b5fafb84608e6220fd03bf0623be570) Thanks [@tenphi](https://github.com/tenphi)! - Support GFM table column alignment. Astro's default Markdown processor emits
  `style="text-align: …"` for aligned columns, which failed the Tasty-only output
  check. Aligned cells now receive a `data-align` modifier styled by
  `MarkdownTable.Cell`, under both Markdown processors.
- Updated dependencies [[`c3448e8`](https://github.com/tenphi/cookbook/commit/c3448e866b5fafb84608e6220fd03bf0623be570), [`c3448e8`](https://github.com/tenphi/cookbook/commit/c3448e866b5fafb84608e6220fd03bf0623be570)]:
  - @tenphi/docs@0.25.1
  - @tenphi/renderer@0.25.1

## 0.25.0

### Minor Changes

- [#151](https://github.com/tenphi/cookbook/pull/151) [`cd06973`](https://github.com/tenphi/cookbook/commit/cd0697360131f35e77f4472c7307d073776d9f41) Thanks [@tenphi](https://github.com/tenphi)! - Enable Astro's built-in hover/focus page prefetching by default. Brief pointer
  crossings do not prefetch pages, and data-saving or slow connections fall back
  to tap intent. Preserve explicit Astro prefetch settings, including disabling
  prefetching with `prefetch: false`. Notify the initial page-load lifecycle when
  the router is still lazy so prefetching also works after the first client
  navigation, and retain keyboard-focus prefetching when the document body is
  replaced.

### Patch Changes

- Updated dependencies [[`cd06973`](https://github.com/tenphi/cookbook/commit/cd0697360131f35e77f4472c7307d073776d9f41)]:
  - @tenphi/renderer@0.25.0
  - @tenphi/docs@0.25.0

## 0.24.0

### Minor Changes

- [#149](https://github.com/tenphi/cookbook/pull/149) [`fefabb1`](https://github.com/tenphi/cookbook/commit/fefabb15c2c00e0be78cf4b57541dae4ea733223) Thanks [@tenphi](https://github.com/tenphi)! - Add client navigation over static documentation pages with preserved appearance,
  sidebar state and scroll, and localized search queries. Load the router on link
  hover, focus, or click to keep the initial page lightweight. Reset article scroll on
  page changes while retaining fragment navigation. Apply saved appearance before
  the first paint, including when Head or Header is replaced. Custom client scripts
  can initialize on `astro:page-load` or use custom-element lifecycle callbacks.

### Patch Changes

- Updated dependencies [[`fefabb1`](https://github.com/tenphi/cookbook/commit/fefabb15c2c00e0be78cf4b57541dae4ea733223)]:
  - @tenphi/renderer@0.24.0
  - @tenphi/docs@0.24.0

## 0.23.0

### Minor Changes

- [#147](https://github.com/tenphi/cookbook/pull/147) [`66fd40a`](https://github.com/tenphi/cookbook/commit/66fd40a14b99a870c55b8dcfb30061dfccb42c56) Thanks [@tenphi](https://github.com/tenphi)! - Use Tasty element identities for owned anatomy and modifiers for state, while preserving stable root classes and Logo’s root class prop. Simplify Markdown conditions and move diff/copy state to its owning code-block wrapper. Keep hero buttons and pagination links stationary on hover, preserve customized pagination borders, and give minimal actions outline geometry with a transparent border.

  Variant and syntax category overrides express conditions in property state maps. See the migration guide for sub-element/modifier replacements and shared prose states.

  Unify responsive aliases as `@sm`, `@md`, and `@lg`, matching wider viewports; use negation for narrower layouts. Preserve the existing thresholds. Use native `:is(:popover-open)` for popovers and direct media conditions for component-specific thresholds. Remove the unused shell and medium-layout aliases; the migration guide covers renamed and removed aliases, including custom breakpoint definitions.

  Upgrade the shared Tasty dependency to 3.9.10, preserving environment checks in production consumers.

### Patch Changes

- Updated dependencies [[`66fd40a`](https://github.com/tenphi/cookbook/commit/66fd40a14b99a870c55b8dcfb30061dfccb42c56)]:
  - @tenphi/renderer@0.23.0
  - @tenphi/docs@0.23.0

## 0.22.1

### Patch Changes

- Updated dependencies [[`ec93d99`](https://github.com/tenphi/cookbook/commit/ec93d997017431280a42de457ba6765ed301bb36)]:
  - @tenphi/renderer@0.22.1
  - @tenphi/docs@0.22.1

## 0.22.0

### Patch Changes

- Updated dependencies [[`a211d15`](https://github.com/tenphi/cookbook/commit/a211d15ccb61442e58459205637a1ad3eb8e1c33), [`a211d15`](https://github.com/tenphi/cookbook/commit/a211d15ccb61442e58459205637a1ad3eb8e1c33)]:
  - @tenphi/docs@0.22.0
  - @tenphi/renderer@0.22.0

## 0.21.4

### Patch Changes

- [#140](https://github.com/tenphi/cookbook/pull/140) [`1f3adf7`](https://github.com/tenphi/cookbook/commit/1f3adf726238be1fc4ec2cc0b08ea769d563748e) Thanks [@tenphi](https://github.com/tenphi)! - Keep the last successful content graph when a refresh fails validation. Share
  translation catalog ownership and language fallback logic while preserving existing
  message keys, defaults and overrides, and document all supported control keys.
- Updated dependencies [[`1f3adf7`](https://github.com/tenphi/cookbook/commit/1f3adf726238be1fc4ec2cc0b08ea769d563748e)]:
  - @tenphi/renderer@0.21.4
  - @tenphi/docs@0.21.4

## 0.21.3

### Patch Changes

- [#137](https://github.com/tenphi/cookbook/pull/137) [`3536e94`](https://github.com/tenphi/cookbook/commit/3536e947b60b6004ceba772b8efc8d50b38b5dc4) Thanks [@tenphi](https://github.com/tenphi)! - Document the self-hosted Onest Variable and JetBrains Mono Variable defaults,
  including their continuous weight ranges and bundled Latin subsets.
- Updated dependencies []:
  - @tenphi/docs@0.21.3
  - @tenphi/renderer@0.21.3

## 0.21.2

### Patch Changes

- [#135](https://github.com/tenphi/cookbook/pull/135) [`00f14de`](https://github.com/tenphi/cookbook/commit/00f14de30338ccd77f64df6c67f6142731fcfdbb) Thanks [@tenphi](https://github.com/tenphi)! - Move built-in styles into component-owned modules and initialize document foundations from the page shell, so replacing Header preserves fonts and unrelated styling. Keep named theme customization on actual component parts, and collect CodeGroup's generated-content styles independently.

  Use shared appearance states for scheme-dependent component styling, including automatic hero and logo selection with explicit theme choices taking precedence over system preferences.

  Upgrade Tasty to 3.9.6 and its ESLint plugin to 1.5.1.

  Enable shorthand-property diagnostics for component-owned styles and register renderer-local style helpers so global bridges receive the same validation. Use registered warning palette roles for Markdown warning alerts.

  Support named component inheritance through extendComponent(name, base, options), preserving inherited props and compound parts. Export a configurable Button foundation shared by search, mobile-menu, and consumer buttons.

  Unify built-in and consumer component creation and theme customization with defineComponent, removing the separate customizeComponent wrapper.

  Require zero ESLint warnings locally and in the CI and release gates. Migrate native properties to Tasty shorthands and specialized typography presets while preserving the cascade; document narrow exceptions for shared style composition and build-only SVG encoding.

  Enable selector-state warnings and move supported attribute and pseudo-class conditions into property state maps. Give copy controls and popover panels explicit Tasty identities so partial anatomy overrides remain scoped. Preserve prose spacing and conditional omissions, with narrow documented exceptions for unsupported pseudo-element conditions and empty legacy customization hooks.

  Use built-in data-element identities for owned Header, Footer, and logo anatomy, and remove data-tasty-anatomy markers. Model heading levels as root states. Consume paired spacing tokens through blockMargin/blockPadding so single-edge state changes preserve the other edge without native longhand exceptions.

  Use Tasty ESLint plugin 1.5.1, which recommends mergeStyles for shallow style composition, and fix its containing-element diagnostics by moving root variants into property state maps. Use element-name selector shorthand, update the public anatomy reference, and verify both new rules in packed ESLint and Oxlint consumers.

- Updated dependencies [[`00f14de`](https://github.com/tenphi/cookbook/commit/00f14de30338ccd77f64df6c67f6142731fcfdbb)]:
  - @tenphi/renderer@0.21.2
  - @tenphi/docs@0.21.2

## 0.21.1

### Patch Changes

- Updated dependencies [[`6c43a1f`](https://github.com/tenphi/cookbook/commit/6c43a1f9d20be4dfc05f1e3ef09c6b5b54ceb24e)]:
  - @tenphi/renderer@0.21.1
  - @tenphi/docs@0.21.1

## 0.21.0

### Minor Changes

- [#130](https://github.com/tenphi/cookbook/pull/130) [`299fa57`](https://github.com/tenphi/cookbook/commit/299fa572c5e12a336306b21813c922316050cbd2) Thanks [@tenphi](https://github.com/tenphi)! - Remove legacy theme compatibility paths. Palette configuration, dependencies,
  and resolved color properties now use canonical lowercase Glaze names such as
  `text-soft` and `accent-text`. Configure design tokens with Tasty `$name` keys;
  the old `--name` keys now report a validation error. Custom style overrides must
  be consumed through `defineComponent()` or `resolveComponentStyles()` instead of
  the automatic `data-tasty-anatomy` bridge. See the upgrade guide for migration.

### Patch Changes

- Updated dependencies [[`338a8f5`](https://github.com/tenphi/cookbook/commit/338a8f56c4051bb9988fea9737b3de1df0ec5aaa), [`299fa57`](https://github.com/tenphi/cookbook/commit/299fa572c5e12a336306b21813c922316050cbd2)]:
  - @tenphi/renderer@0.21.0
  - @tenphi/docs@0.21.0

## 0.20.5

### Patch Changes

- [#128](https://github.com/tenphi/cookbook/pull/128) [`367bed1`](https://github.com/tenphi/cookbook/commit/367bed14194acfbf724bca500eb93af8f6bca793) Thanks [@tenphi](https://github.com/tenphi)! - Showcase Spanish, Russian, Japanese, and Simplified Chinese on the Cookbook home and Getting Started pages. Keep untranslated guides reachable through English fallback links and localize the header navigation. Render the language and version selectors with a shared, configurable, server-rendered popover, including a mobile sidebar placement for language. Align their transitions with the Appearance and links menus and refine the globe icon.

- Updated dependencies [[`367bed1`](https://github.com/tenphi/cookbook/commit/367bed14194acfbf724bca500eb93af8f6bca793)]:
  - @tenphi/docs@0.20.5
  - @tenphi/renderer@0.20.5

## 0.20.4

### Patch Changes

- Updated dependencies [[`c032992`](https://github.com/tenphi/cookbook/commit/c032992d34027ae05949be9e9a173b88c4241e04)]:
  - @tenphi/renderer@0.20.4
  - @tenphi/docs@0.20.4

## 0.20.3

### Patch Changes

- [#123](https://github.com/tenphi/cookbook/pull/123) [`ad0edfd`](https://github.com/tenphi/cookbook/commit/ad0edfdac6bc6d9cbcd3ba41e0b7c633f8aea42e) Thanks [@tenphi](https://github.com/tenphi)! - Report an actionable error when adding Cookbook to a server-rendered Astro project instead of silently changing its output mode.

- Updated dependencies []:
  - @tenphi/docs@0.20.3
  - @tenphi/renderer@0.20.3

## 0.20.2

### Patch Changes

- Label the Cookbook reference homepage "Overview" in the sidebar to distinguish it from the project name in the header.

- Updated dependencies []:
  - @tenphi/renderer@0.20.2
  - @tenphi/docs@0.20.2

## 0.20.1

### Patch Changes

- Place the Cookbook logo above the headline at a smaller size on mobile documentation homepages.

- Updated dependencies []:
  - @tenphi/docs@0.20.1
  - @tenphi/renderer@0.20.1

## 0.20.0

### Patch Changes

- Updated dependencies [[`17821f8`](https://github.com/tenphi/cookbook/commit/17821f8b17f5175c0b98d39862bf2c5250133533)]:
  - @tenphi/renderer@0.20.0
  - @tenphi/docs@0.20.0

## 0.19.2

### Patch Changes

- Updated dependencies [[`c0652bc`](https://github.com/tenphi/cookbook/commit/c0652bca6582fb5938c0eb539bb7494d78ff8793)]:
  - @tenphi/renderer@0.19.2
  - @tenphi/docs@0.19.2

## 0.19.1

### Patch Changes

- Updated dependencies [[`c0d02ef`](https://github.com/tenphi/cookbook/commit/c0d02ef721c6b5ad10ca71f00360f64ffee91753)]:
  - @tenphi/docs@0.19.1
  - @tenphi/renderer@0.19.1

## 0.19.0

### Minor Changes

- [#112](https://github.com/tenphi/cookbook/pull/112) [`4fc3e3e`](https://github.com/tenphi/cookbook/commit/4fc3e3e8c1c6d95f41c47f0d4b22f835d4950894) Thanks [@tenphi](https://github.com/tenphi)! - Replace Starlight with Cookbook's own Astro renderer and publish it as `@tenphi/renderer`. Keep the documentation graph, navigation, search, Tasty and Glaze theme, and server-rendered component overrides. Render GitHub alert blockquotes directly in Markdown and MDX, and accept Astro Markdown plugins without Starlight plugin hooks.

  Direct renderer consumers must change `@tenphi/starlight` imports to `@tenphi/renderer`. Custom component overrides must use `Astro.locals.cookbookRoute`, and the renamed theme style surfaces are `Header` and `MarkdownAlert`. See the migration guide for plugin and style changes.

  Renderer-owned markup now uses Cookbook class names. Custom selectors that targeted the previous markup need updating; use named `theme.styles` surfaces where possible.

### Patch Changes

- Updated dependencies [[`4fc3e3e`](https://github.com/tenphi/cookbook/commit/4fc3e3e8c1c6d95f41c47f0d4b22f835d4950894)]:
  - @tenphi/docs@0.19.0
  - @tenphi/renderer@0.19.0

## 0.18.2

### Patch Changes

- [#109](https://github.com/tenphi/cookbook/pull/109) [`716f515`](https://github.com/tenphi/cookbook/commit/716f515c462ede40aa66b34be38a485cc1e519c2) Thanks [@tenphi](https://github.com/tenphi)! - Keep primary button and hero logo fills brand-colored in dark mode with fixed Glaze palette roles. Link Glaze and Tasty from their first mentions in the styling overview.
  Render Next first in the page navigation's source and keyboard order, with responsive placement in CSS and no client-side reordering.
  Give inactive sidebar items a slightly softer semantic color than the shared secondary text, while retaining stronger high-contrast colors and a palette override.
- Updated dependencies [[`716f515`](https://github.com/tenphi/cookbook/commit/716f515c462ede40aa66b34be38a485cc1e519c2)]:
  - @tenphi/docs@0.18.2
  - @tenphi/starlight@0.18.2

## 0.18.1

### Patch Changes

- [#106](https://github.com/tenphi/cookbook/pull/106) [`a0265b4`](https://github.com/tenphi/cookbook/commit/a0265b4763b21ef015866c85b631947f0a2a3c1f) Thanks [@tenphi](https://github.com/tenphi)! - Repair the clean npm creator path, validate generated theme types, allow custom components before the first Markdown page, and report unused custom style names. Make the style surface reference easier to navigate.

- [#108](https://github.com/tenphi/cookbook/pull/108) [`f10f85e`](https://github.com/tenphi/cookbook/commit/f10f85ebed69494d43b647ec13ec3125b4107aad) Thanks [@tenphi](https://github.com/tenphi)! - Explain how Cookbook combines Glaze palettes and Tasty design tokens, state maps, and direct style overrides in its static theme workflow.

- Updated dependencies [[`a0265b4`](https://github.com/tenphi/cookbook/commit/a0265b4763b21ef015866c85b631947f0a2a3c1f), [`f10f85e`](https://github.com/tenphi/cookbook/commit/f10f85ebed69494d43b647ec13ec3125b4107aad)]:
  - @tenphi/docs@0.18.1
  - @tenphi/starlight@0.18.1

## 0.18.0

### Minor Changes

- [#99](https://github.com/tenphi/cookbook/pull/99) [`d8678db`](https://github.com/tenphi/cookbook/commit/d8678db5a669731259178467cd1490e0a0e3d03a) Thanks [@tenphi](https://github.com/tenphi)! - Complete the developer workflow from setup and customization through publishing and maintenance.

  - Keep production drafts available by direct link while excluding them from navigation, search, sitemaps, and agent indexes. Correct locale navigation, real language fallbacks, translated controls, and locale-aware version links.
  - Expose the complete Glaze palette graph, custom color roles, adaptation settings, Tasty units and recipes, and every owned style surface with named sub-elements. Strengthen contrast diagnostics across light, dark, and high-contrast modes while retaining absolute body and heading tones.
  - Self-host and cache Google Fonts with preset-aware weights, variable ranges, and italics. Add one site logo configuration for headers and mobile navigation, a full-width mobile header divider, and a separate rounded-header-control token. Keep logo colors fixed across schemes, align custom artwork with site titles, soften pagination titles, and balance single-line code-copy insets.
  - Replace inline syntax highlighting styles with extracted Tasty rules, enforce the rendered styling contract and build-only Tasty/Glaze boundary, and improve search focus, code-group highlighting/copying, optional mobile contents, and hero image dimensions.
  - Define tested Starlight plugin compatibility, custom frontmatter schemas, and a server-side content API. Improve OpenAPI parameter overrides, examples, local references, and authentication requirements.
  - Add typed publishing metadata, preview and version indexing controls, canonical/social/breadcrumb settings, clean per-page Markdown, and copy/download actions for readers and agents.
  - Expand preflight asset checks and add `cookbook check-build` for built output and deployed routes. Generated sites include a complete validation command. Add real packed-consumer, browser/accessibility, upstream, and performance checks.
  - Document versioned upgrades and troubleshooting, build-check complete configuration recipes, and organize guides around developer tasks while preserving existing URLs.

  Migration notes: Google font shorthand now downloads the needed weights/styles and serves them locally; preserve its build cache or select remote delivery explicitly. Stricter contrast and inline-style checks can expose existing custom-theme or plugin problems. Header controls now use `$header-control-radius` independently of `$radius`. See the upgrade guide for details.

### Patch Changes

- Updated dependencies [[`d8678db`](https://github.com/tenphi/cookbook/commit/d8678db5a669731259178467cd1490e0a0e3d03a)]:
  - @tenphi/docs@0.18.0
  - @tenphi/starlight@0.18.0

## 0.17.1

### Patch Changes

- [#95](https://github.com/tenphi/cookbook/pull/95) [`3f65be3`](https://github.com/tenphi/cookbook/commit/3f65be36efa0db2125bfa2af7646d218d80e0016) Thanks [@tenphi](https://github.com/tenphi)! - Restore strong heading and body colors with absolute Glaze tones: body text
  starts at 0 and headings at 4, with normal-mode tone boundaries applied by Glaze.
  Expose the heading palette role and configurable Heading style tree. Update the packaged palette examples to preserve dark
  reading text, adapt it for dark and high-contrast modes, and use contrast
  requirements as minimum safeguards.
- Updated dependencies [[`3f65be3`](https://github.com/tenphi/cookbook/commit/3f65be36efa0db2125bfa2af7646d218d80e0016)]:
  - @tenphi/docs@0.17.1
  - @tenphi/starlight@0.17.1

## 0.17.0

### Minor Changes

- [#75](https://github.com/tenphi/cookbook/pull/75) [`f4f5f13`](https://github.com/tenphi/cookbook/commit/f4f5f132e83e6e5c60dedd91a5e7dcfc4a0673ac) Thanks [@tenphi](https://github.com/tenphi)! - Generate project instructions for coding agents and publish a documentation index and sitemap-aware robots file with static Cookbook sites. Add a guide for agent-assisted setup and checking deployed documentation.

- [#76](https://github.com/tenphi/cookbook/pull/76) [`c4589b8`](https://github.com/tenphi/cookbook/commit/c4589b824ff6404863d30f388e8f56a9c6b86a19) Thanks [@tenphi](https://github.com/tenphi)! - Add static OpenAPI reference pages, documentation version navigation, Starlight plugin forwarding, and Netlify, Cloudflare Pages, and Vercel creator presets. Require Node.js 22.19 or newer and deploy the Cookbook reference site from its release tag.
  Upgrade Starlight to 0.42.4 and add agent skills for Starlight upgrades in Cookbook and Cookbook upgrades in generated sites.

- [#73](https://github.com/tenphi/cookbook/pull/73) [`09d7152`](https://github.com/tenphi/cookbook/commit/09d7152c8bfffba01d76bf28f51b7bac047b3941) Thanks [@tenphi](https://github.com/tenphi)! - Add `theme.fonts` for Google Fonts families and local font files, with semantic body, heading, and code roles. Load font faces through Tasty, validate local files at build time, and make font definitions replaceable in shared config presets.

- [#77](https://github.com/tenphi/cookbook/pull/77) [`0af1bdc`](https://github.com/tenphi/cookbook/commit/0af1bdc295671d4384736ae8c4f0cd056614c416) Thanks [@tenphi](https://github.com/tenphi)! - Accept Glaze color declarations for the brand and semantic palette, including tone, base, and contrast targets. Use declarations in the reference site and theme guides while retaining literal color seed compatibility.

### Patch Changes

- Updated dependencies [[`f4f5f13`](https://github.com/tenphi/cookbook/commit/f4f5f132e83e6e5c60dedd91a5e7dcfc4a0673ac), [`c4589b8`](https://github.com/tenphi/cookbook/commit/c4589b824ff6404863d30f388e8f56a9c6b86a19), [`09d7152`](https://github.com/tenphi/cookbook/commit/09d7152c8bfffba01d76bf28f51b7bac047b3941), [`0af1bdc`](https://github.com/tenphi/cookbook/commit/0af1bdc295671d4384736ae8c4f0cd056614c416)]:
  - @tenphi/docs@0.17.0
  - @tenphi/starlight@0.17.0

## 0.16.0

### Minor Changes

- [#70](https://github.com/tenphi/cookbook/pull/70) [`b522b14`](https://github.com/tenphi/cookbook/commit/b522b14994c1bec2adeadc6efcdb07f0ac35c9c9) Thanks [@tenphi](https://github.com/tenphi)! - Ship Cookbook documentation with the public package, including consumer
  customization rules and versioned Tasty and Glaze reference snapshots with
  local links. Expose documentation paths through `@tenphi/cookbook/docs/*` for
  tooling and document how projects can guide coding agents and lint custom styles.
  Set an explicit package documentation index so the bundled guide has a single
  home route when used as a Cookbook content source.

- [#72](https://github.com/tenphi/cookbook/pull/72) [`db5339d`](https://github.com/tenphi/cookbook/commit/db5339d7298df9b8912003ff5ff96398c7692033) Thanks [@tenphi](https://github.com/tenphi)! - Add configurable header buttons with a mobile More menu, a translucent blurred
  header, and a mobile navigation row opening a left drawer with a section
  selector. Hide the table of contents on tablet and mobile, retain plain icon
  button styling, and expose the new layout, header, search, and drawer surfaces
  through theme styles and the header palette role.

### Patch Changes

- Updated dependencies [[`7696043`](https://github.com/tenphi/cookbook/commit/76960432f481be38fb67e1669196dc6b8ef2efe0), [`66a8aa2`](https://github.com/tenphi/cookbook/commit/66a8aa2d4b2d8be916a5a5bb13fed0e54d18638c), [`037160c`](https://github.com/tenphi/cookbook/commit/037160cd9093911b6b58cb2dcb95aba2c5ca060a), [`7caaa59`](https://github.com/tenphi/cookbook/commit/7caaa597fdc37d4f6616c25cbc0e11299949954b), [`db5339d`](https://github.com/tenphi/cookbook/commit/db5339d7298df9b8912003ff5ff96398c7692033)]:
  - @tenphi/docs@0.16.0
  - @tenphi/starlight@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [[`9c373f1`](https://github.com/tenphi/cookbook/commit/9c373f105d8a77cadb0f90d1e0b95024527c8b7c)]:
  - @tenphi/starlight@0.15.0
  - @tenphi/docs@0.15.0

## 0.14.0

### Minor Changes

- [#64](https://github.com/tenphi/cookbook/pull/64) [`20b0233`](https://github.com/tenphi/cookbook/commit/20b023330baaa3d87125df552601687c13003487) Thanks [@tenphi](https://github.com/tenphi)! - Unify project configuration across Astro and the CLI, support local repository starters, reconcile declared package sources with locks, and restore the development server and content watching.

  Add source IDs and roots, repeated mounts, scoped slugs, explicit cross-source links, redirects, reusable configuration presets, HTML sanitization, preserved page metadata, typed component styles and props, and accessible tabs, callouts, and code groups. Update guides and add development and public API regression checks.

  Breaking prerelease changes: locks must match requested package specifiers; slugs are relative to source mounts; safe HTML is preserved by `sanitize` (use `strip` for removal); custom styles move to `theme.customStyles`; `Tabs` expects labeled `Tab` panels. See the migration guide.

- [#62](https://github.com/tenphi/cookbook/pull/62) [`990f3a7`](https://github.com/tenphi/cookbook/commit/990f3a79de225086cf3b5d2376817b0ed9a41c74) Thanks [@tenphi](https://github.com/tenphi)! - Upgrade the renderer to Astro 7.3 and Starlight 0.42, adopt Starlight's
  Popover-based mobile navigation, and use a single graph-backed rendering path
  that is independent of Astro content collections. Render trusted MDX through
  Starlight with relative imports intact, restore a generated 404 page, and
  support content-hashed local hero images, including deployments under Astro
  base paths.

  Harden locked npm content by confining package paths and globs to the artifact,
  revalidating cached trees, rejecting ambiguous lock matches, removing raw HTML
  from untrusted Markdown and HTML-capable frontmatter. Rewrite reference-style
  links and images plus local downloadable files as hashed static assets.

  Align page frontmatter with Starlight (`tableOfContents`, `pagefind`, and
  `banner`), apply sidebar metadata to generated navigation, connect site URL and
  repository metadata to Astro/Starlight, implement repository-link localization
  and explicit raw HTML policies, remove the remaining inactive configuration
  keys, and strengthen runtime and JSON Schema validation.

  Generate projects with the creator's matching Cookbook release, typed
  configuration, and package-manager-aware GitHub Pages workflows. Standardize
  CLI JSON output and report empty documentation graphs as errors.

### Patch Changes

- Updated dependencies [[`20b0233`](https://github.com/tenphi/cookbook/commit/20b023330baaa3d87125df552601687c13003487), [`990f3a7`](https://github.com/tenphi/cookbook/commit/990f3a79de225086cf3b5d2376817b0ed9a41c74)]:
  - @tenphi/docs@0.14.0
  - @tenphi/starlight@0.14.0

## 0.13.0

### Minor Changes

- [#60](https://github.com/tenphi/cookbook/pull/60) [`f7185c5`](https://github.com/tenphi/cookbook/commit/f7185c5695b6bf2bd1142ee557b64ce930a1636c) Thanks [@tenphi](https://github.com/tenphi)! - Re-export the Tasty ESLint plugin, recommended and strict rule maps, and a
  Cookbook validation preset through `/eslint-plugin`. Document and verify
  consumer style linting with ESLint and oxlint, including shared tokens,
  responsive aliases, typography presets, and Cookbook styling imports.
  Support `extends: "@tenphi/cookbook"` and `extends: "@tenphi/starlight"` so
  consumers can add theme names without copying the preset's arrays.

### Patch Changes

- Updated dependencies [[`f7185c5`](https://github.com/tenphi/cookbook/commit/f7185c5695b6bf2bd1142ee557b64ce930a1636c)]:
  - @tenphi/starlight@0.13.0
  - @tenphi/docs@0.13.0

## 0.12.0

### Minor Changes

- [#58](https://github.com/tenphi/cookbook/pull/58) [`e1df4df`](https://github.com/tenphi/cookbook/commit/e1df4df0ff1a9f0a6cbfa7da52ec8e2c2a876e58) Thanks [@tenphi](https://github.com/tenphi)! - Expose Tasty component and global styling tools through `/styling`, including
  typed style objects and `defineComponent(name, options)` for creating
  consumer-owned components with `theme.styles` merged into their defaults.
  Preserve Tasty's generated subcomponents and inferred prop types. Document a
  custom site title with an aligned, linked logo and verify CSS extraction from
  a clean package installation.

### Patch Changes

- Updated dependencies [[`e1df4df`](https://github.com/tenphi/cookbook/commit/e1df4df0ff1a9f0a6cbfa7da52ec8e2c2a876e58)]:
  - @tenphi/starlight@0.12.0
  - @tenphi/docs@0.12.0

## 0.11.3

### Patch Changes

- Updated dependencies [[`d937549`](https://github.com/tenphi/cookbook/commit/d937549b46ab27b02fa171fbbf06faeca66c21fa)]:
  - @tenphi/starlight@0.11.3
  - @tenphi/docs@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies [[`485eb46`](https://github.com/tenphi/cookbook/commit/485eb4612f4293cfad6b83e0971904c5c828c4b6)]:
  - @tenphi/starlight@0.11.2
  - @tenphi/docs@0.11.2

## 0.11.1

### Patch Changes

- Updated dependencies [[`c6ca1bd`](https://github.com/tenphi/cookbook/commit/c6ca1bd566b1a9167b13cafb8165899662d1e279)]:
  - @tenphi/starlight@0.11.1
  - @tenphi/docs@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [[`66ab10c`](https://github.com/tenphi/cookbook/commit/66ab10cafc33d846a3f1fc46d04f0034223209af)]:
  - @tenphi/docs@0.11.0
  - @tenphi/starlight@0.11.0

## 0.10.2

### Patch Changes

- Updated dependencies [[`8801739`](https://github.com/tenphi/cookbook/commit/8801739540b0c080d916c81b02120622da434573)]:
  - @tenphi/starlight@0.10.2
  - @tenphi/docs@0.10.2

## 0.10.1

### Patch Changes

- Updated dependencies [[`1ca1405`](https://github.com/tenphi/cookbook/commit/1ca14057656a9725e9531697654a8aa64cb4eb81)]:
  - @tenphi/starlight@0.10.1
  - @tenphi/docs@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [[`0df2ffb`](https://github.com/tenphi/cookbook/commit/0df2ffb0df205f5e6ca190b7d8105fdf912272ea)]:
  - @tenphi/docs@0.10.0
  - @tenphi/starlight@0.10.0

## 0.9.6

### Patch Changes

- Updated dependencies [[`49b6155`](https://github.com/tenphi/cookbook/commit/49b615507a60f7f9422ed17a10ea70fe5d23b0f9)]:
  - @tenphi/starlight@0.9.6
  - @tenphi/docs@0.9.6

## 0.9.5

### Patch Changes

- Updated dependencies [[`e515933`](https://github.com/tenphi/cookbook/commit/e51593387f09f66c0bb959a619226adf227ee5b2)]:
  - @tenphi/starlight@0.9.5
  - @tenphi/docs@0.9.5

## 0.9.4

### Patch Changes

- Updated dependencies [[`4b1d043`](https://github.com/tenphi/cookbook/commit/4b1d043776860d77a7d576b30e3f5156f7182995)]:
  - @tenphi/starlight@0.9.4
  - @tenphi/docs@0.9.4

## 0.9.3

### Patch Changes

- Updated dependencies [[`be10cd5`](https://github.com/tenphi/cookbook/commit/be10cd58ab001a45afd87f5fd67a34f274cd00a5), [`e4ebf0a`](https://github.com/tenphi/cookbook/commit/e4ebf0a059266b1ca94ff86ca21372ce39bb0d31)]:
  - @tenphi/docs@0.9.3
  - @tenphi/starlight@0.9.3

## 0.9.2

### Patch Changes

- Updated dependencies [[`9362386`](https://github.com/tenphi/cookbook/commit/9362386506c472954f51d42f4045b1c5ee6324a6)]:
  - @tenphi/docs@0.9.2
  - @tenphi/starlight@0.9.2

## 0.9.1

### Patch Changes

- Updated dependencies [[`e4bd0b0`](https://github.com/tenphi/cookbook/commit/e4bd0b085fa46e0654e4cc410e37f59d3530cce2)]:
  - @tenphi/starlight@0.9.1
  - @tenphi/docs@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`0dfb05a`](https://github.com/tenphi/cookbook/commit/0dfb05ad2bfae7d3a434eb2377ce95e06c8e068e), [`bbb8e58`](https://github.com/tenphi/cookbook/commit/bbb8e58c5aa2c084b0cf8c9bcdb4c8ebde5908f8), [`0394323`](https://github.com/tenphi/cookbook/commit/039432304bc066f1bc7edea98b280e894e4ec1ec)]:
  - @tenphi/starlight@0.9.0
  - @tenphi/docs@0.9.0

## 0.8.0

### Minor Changes

- [#21](https://github.com/tenphi/cookbook/pull/21) [`49a21e5`](https://github.com/tenphi/cookbook/commit/49a21e5f4b92cc10dfa1905d32bc996dd8e47f83) Thanks [@tenphi](https://github.com/tenphi)! - Render fenced Mermaid diagrams at build time with responsive light and dark themes,
  and keep hyphenated placeholders such as `<plan-id>` consistently highlighted
  inside Bash code blocks.

### Patch Changes

- Updated dependencies [[`49a21e5`](https://github.com/tenphi/cookbook/commit/49a21e5f4b92cc10dfa1905d32bc996dd8e47f83)]:
  - @tenphi/starlight@0.8.0
  - @tenphi/docs@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`318863a`](https://github.com/tenphi/cookbook/commit/318863af129665428fbee927001badf1c8745c1a)]:
  - @tenphi/docs@0.7.0
  - @tenphi/starlight@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`8e60ef9`](https://github.com/tenphi/cookbook/commit/8e60ef998824ab97902c3fcd45c04f8937c06a53)]:
  - @tenphi/starlight@0.6.1
  - @tenphi/docs@0.6.1

## 0.6.0

### Minor Changes

- [#16](https://github.com/tenphi/cookbook/pull/16) [`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae) Thanks [@tenphi](https://github.com/tenphi)! - Add typed Cookbook component-style configuration with explicit extension and
  full-replacement modes, and expose the brand-colored Cookbook logo as a public
  Tasty component.

### Patch Changes

- Updated dependencies [[`8e2d9c9`](https://github.com/tenphi/cookbook/commit/8e2d9c936116eca161cd19e4d78165d82b05c9ae), [`61abff2`](https://github.com/tenphi/cookbook/commit/61abff2c613022df2ab5f621540b8fc99010a895), [`689bf56`](https://github.com/tenphi/cookbook/commit/689bf56abbe9d7ef9eaa76c809bf238eec1ee149)]:
  - @tenphi/docs@0.6.0
  - @tenphi/starlight@0.6.0

## 0.5.0

### Minor Changes

- [#11](https://github.com/tenphi/cookbook/pull/11) [`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53) Thanks [@tenphi](https://github.com/tenphi)! - Rename the project to Cookbook, publish the public integration as
  `@tenphi/cookbook`, and move the package creator to
  `@tenphi/create-cookbook`.

### Patch Changes

- Updated dependencies [[`5ead3fc`](https://github.com/tenphi/cookbook/commit/5ead3fcba924dfa7317d217e8bd5aa1a21c0fa53)]:
  - @tenphi/docs@0.5.0
  - @tenphi/starlight@0.5.0

## 0.4.0

### Minor Changes

- [#9](https://github.com/tenphi/cookbook/pull/9) [`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390) Thanks [@tenphi](https://github.com/tenphi)! - Add independent per-tab sidebar trees with recursive nesting, route-based tab ownership, and matching standalone renderer support. Expose configured sections in mobile navigation, serve validated local content assets in development, attach the desktop tab row directly to its divider, tighten article spacing, refine responsive header and page-outline placement, and improve table readability and overflow behavior.

### Patch Changes

- Updated dependencies [[`27bf290`](https://github.com/tenphi/cookbook/commit/27bf290dfaa178e416ec990816ec79839760d390)]:
  - @tenphi/docs@0.4.0
  - @tenphi/starlight@0.4.0

## 0.3.0

### Minor Changes

- [#7](https://github.com/tenphi/cookbook/pull/7) [`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b) Thanks [@tenphi](https://github.com/tenphi)! - Add a public layout-width token, center the complete documentation frame at a 1400px default maximum, and render a persistent divider beneath desktop navigation tabs.

### Patch Changes

- Updated dependencies [[`9ea4169`](https://github.com/tenphi/cookbook/commit/9ea4169c27e2c279a21c7563858359aadbaedd2b)]:
  - @tenphi/docs@0.3.0
  - @tenphi/starlight@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [[`45bbffa`](https://github.com/tenphi/cookbook/commit/45bbffa8d54efcbbd406178caa027b6eace0b0e1), [`db4d3c6`](https://github.com/tenphi/cookbook/commit/db4d3c60d0b182341158968dd557b03f8de28641)]:
  - @tenphi/starlight@0.2.1
  - @tenphi/docs@0.2.1

## 0.2.0

### Minor Changes

- [#2](https://github.com/tenphi/cookbook/pull/2) [`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777) Thanks [@tenphi](https://github.com/tenphi)! - Add semantic palette inputs, public shape and layout tokens, composable typography presets with separate body and heading fonts, and consistent token-driven styling across both renderers.

### Patch Changes

- Updated dependencies [[`f8438de`](https://github.com/tenphi/cookbook/commit/f8438de111c229b49910528a83f0bfe729e9a777)]:
  - @tenphi/docs@0.2.0
  - @tenphi/starlight@0.2.0

## 0.1.1

### Patch Changes

- [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778) Thanks [@tenphi](https://github.com/tenphi)! - Render custom-loader Markdown bodies and map Cookbook navigation and component overrides into Starlight.

- Updated dependencies [[`aae3c5e`](https://github.com/tenphi/cookbook/commit/aae3c5e579749ab5ab190408c601ff339e92db6c), [`e67224e`](https://github.com/tenphi/cookbook/commit/e67224e3cc3822cd3e590a34be31bdd66cd8f778)]:
  - @tenphi/docs@0.1.1
  - @tenphi/starlight@0.1.1
