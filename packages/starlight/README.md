# @tenphi/starlight

The supported Astro/Starlight renderer for Cookbook. The default export is a
complete Astro integration; consumers do not compose Starlight themselves.

`@tenphi/starlight/styling` exports `tasty`, `useGlobalStyles`, `mergeStyles`,
the `Styles` type, and the `defineComponent` and `resolveComponentStyles`
helpers for merging `theme.styles` into custom components. The facade exposes
the same API through `@tenphi/cookbook/styling`.

`@tenphi/starlight/eslint-plugin` exports the default Tasty ESLint plugin,
`recommended` and `strict` rule maps, its configuration types, and a
`validationConfig` preset covering Cookbook's theme names and styling helpers.
It matches `@tenphi/cookbook/eslint-plugin`; see
[Linting custom styles](https://cookbook.tenphi.me/theme-and-components/#linting-custom-styles)
for ESLint and oxlint setup.
