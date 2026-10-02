---
"@tenphi/renderer": patch
"@tenphi/cookbook": patch
"@tenphi/docs": patch
---

Move built-in styles into component-owned modules and initialize document foundations from the page shell, so replacing Header preserves fonts and unrelated styling. Keep named theme customization on actual component parts, and collect CodeGroup's generated-content styles independently.

Use shared appearance states for scheme-dependent component styling, including automatic hero and logo selection with explicit theme choices taking precedence over system preferences.

Upgrade Tasty to 3.9.3 and its ESLint plugin to 1.4.0.

Enable shorthand-property diagnostics for component-owned styles and register renderer-local style helpers so global bridges receive the same validation. Use registered warning palette roles for Markdown warning alerts.

Support named component inheritance through extendComponent(name, base, options), preserving inherited props and compound parts. Export a configurable Button foundation shared by search, mobile-menu, and consumer buttons.

Unify built-in and consumer component creation and theme customization with defineComponent, removing the separate customizeComponent wrapper.

Require zero ESLint warnings locally and in the CI and release gates. Migrate native properties to Tasty shorthands and specialized typography presets while preserving the cascade; document narrow exceptions for shared style composition and build-only SVG encoding.

Enable selector-state warnings and move supported attribute and pseudo-class conditions into property state maps. Give copy controls and popover panels explicit Tasty identities so partial anatomy overrides remain scoped. Preserve prose spacing and conditional omissions, with narrow documented exceptions for unsupported pseudo-element conditions and empty legacy customization hooks.

Use built-in data-element identities for owned Header, Footer, and logo anatomy, and remove data-tasty-anatomy markers. Model heading levels as root states. Consume paired spacing tokens through blockMargin/blockPadding so single-edge state changes preserve the other edge without native longhand exceptions.
