import { configure } from "@tenphi/tasty/core";

/**
 * Color and token names that Cookbook's own style trees define on a
 * component's root or parts, such as `#callout-text`, `$copy-button-size` or
 * Mermaid's `$bg`.
 * A site's `theme.styles` overrides may use them. `component-tokens.test.ts`
 * keeps this list equal to the names the style modules define.
 */
export const COMPONENT_TOKENS = [
  "#callout-border",
  "#callout-surface",
  "#callout-text",
  "$_arrow",
  "$_group-fill",
  "$_group-hdr",
  "$_inner-stroke",
  "$_key-badge",
  "$_line",
  "$_node-fill",
  "$_node-stroke",
  "$_text",
  "$_text-faint",
  "$_text-muted",
  "$_text-sec",
  "$accent",
  "$backdrop-blur",
  "$bg",
  "$border",
  "$copy-button-size",
  "$details-border-width",
  "$dialog-transition",
  "$docs-content-pad-x",
  "$docs-menu-button-size",
  "$docs-mobile-toc-height",
  "$docs-nav-gap",
  "$docs-nav-height",
  "$docs-nav-pad-x",
  "$docs-sidebar-pad-x",
  "$fg",
  "$hover-offset",
  "$indicator-height",
  "$item-gap",
  "$line",
  "$margin-block-end",
  "$margin-block-start",
  "$muted",
  "$padding-block-end",
  "$padding-block-start",
  "$pagefind-ui-background",
  "$pagefind-ui-border",
  "$pagefind-ui-border-width",
  "$pagefind-ui-primary",
  "$pagefind-ui-tag",
  "$pagefind-ui-text",
  "$popover-transition",
  "$resting-shadow-blur",
  "$resting-shadow-offset",
  "$sidebar-transition",
  "$surface",
  "$visually-hidden-size",
] as const;

/**
 * For agent tools only: tell Tasty that the names in `COMPONENT_TOKENS` are
 * defined, so `tasty:styles` does not report them as missing when it checks a
 * `theme.styles` override. Call it after `configureTastyTheme()`. It adds the
 * names to Tasty's global styles with neutral values, so a build never calls it.
 */
export function declareComponentTokensForTools(): void {
  configure({
    globalStyles: {
      ":root": Object.fromEntries(
        COMPONENT_TOKENS.map((name) => [
          name,
          name.startsWith("#") ? "#clear" : "initial",
        ]),
      ),
    },
  });
}
