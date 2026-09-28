# @tenphi/renderer

The Astro renderer for Cookbook. The default export is a complete integration;
consumers normally use it through `@tenphi/cookbook`.

The integration uses one graph-backed route pipeline for convention, explicit,
and locked-package sources. It targets Astro 7.3 and includes a Popover-based
mobile sidebar. Application-owned Astro content
collections remain independent.

`@tenphi/renderer/styling` exports `tasty`, `useGlobalStyles`, `mergeStyles`,
the `Styles` type, and the `defineComponent` and `resolveComponentStyles`
helpers for merging `theme.styles` into custom components. The facade exposes
the same API through `@tenphi/cookbook/styling`.

`@tenphi/renderer/eslint-plugin` exports the default Tasty ESLint plugin,
`recommended` and `strict` rule maps, its configuration types, and a
`validationConfig` preset covering Cookbook's theme names and styling helpers.
Use `extends: "@tenphi/renderer"` in `tasty.config.ts` to inherit this preset
and list only your additional tokens, states, or presets.
It matches `@tenphi/cookbook/eslint-plugin`; see
[Linting custom styles](https://cookbook.tenphi.me/theme-and-components/#linting-custom-styles)
for ESLint and oxlint setup.
