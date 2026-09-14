# @tenphi/starlight

The supported Astro/Starlight renderer for Cookbook. The default export is a
complete Astro integration; consumers do not compose Starlight themselves.

`@tenphi/starlight/styling` exports `tasty`, `useGlobalStyles`, `mergeStyles`,
the `Styles` type, and the `customizeComponent` and `resolveComponentStyles`
helpers for merging `theme.styles` into custom components. The facade exposes
the same API through `@tenphi/cookbook/styling`.
