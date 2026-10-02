import searchIcon from "../icons/search.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { extendComponent } from "../define-component.js";
import { Button } from "./Button.styles.js";

configureCookbookStates();

export const SearchButtonRoot = extendComponent("SearchButton", Button, {
  "data-element": "SearchButton",
  styles: {
    color: { ":hover": "#text", ":active": "#text" },
    justifyContent: { "": "flex-start", "@mobile": "center" },
    inlineSize: {
      "": "initial 100% 22rem",
      "@mobile": "initial $docs-menu-button-size 22rem",
    },
    inlineMargin: {
      "": "0 start",
      "@media(w >= 80rem)": "min(5rem, max(0px, calc(100% - 22rem))) start",
    },
    blockSize: {
      "": "0 $control-height initial",
      "@mobile": "0 $docs-menu-button-size initial",
    },
    padding: { "": "0 $gap 0 ($gap * 1.5)", "@mobile": "0" },
    border: { "": true, "@mobile": "0" },
    radius: "$header-control-radius",
    fill: {
      "": "#surface",
      "@mobile": "#clear",
      ":hover": "#surface-2-hover",
      ":active": "#surface-2-pressed",
    },
    preset: "small",
    shadow: "none",
    transition: "color $transition, fill $transition",
    Label: { $: "> span", hide: { "": false, "@mobile": true } },
    PendingShortcut: {
      $: "> kbd",
      visibility: { "": null, "@own([data-pending])": "hidden" },
    },
    Shortcut: {
      $: "> kbd",
      display: "flex",
      hide: { "": false, "@narrow-layout": true },
      gap: "0.25em",
      inlineMargin: "auto start",
      inlinePadding: "0.375rem",
      fill: "#surface-3",
      preset: "small",
      radius: "($radius * 0.75)",
    },
    NativeIcon: { $: "> svg", hide: true },
    Icon: {
      $: "&::before",
      content: '""',
      display: "block",
      flexShrink: "0",
      inlineSize: { "": "1rem", "@mobile": "1.25rem" },
      blockSize: { "": "1rem", "@mobile": "1.25rem" },
      fill: "#current",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
    },
  },
});
