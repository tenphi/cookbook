import searchIcon from "../icons/search.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { extendComponent } from "../define-component.js";
import { Button } from "./Button.styles.js";

configureCookbookStates();

export const SearchButtonRoot = extendComponent("SearchButton", Button, {
  "data-tasty-anatomy": "SearchButton",
  styles: {
    justifyContent: { "": "flex-start", "@mobile": "center" },
    inlineSize: { "": "100%", "@mobile": "$docs-menu-button-size" },
    maxInlineSize: "22rem",
    marginInlineStart: {
      "": "0",
      "@media(w >= 80rem)": "min(5rem, max(0px, calc(100% - 22rem)))",
    },
    blockSize: { "": "$control-height", "@mobile": "$docs-menu-button-size" },
    padding: { "": "0 $gap 0 ($gap * 1.5)", "@mobile": "0" },
    border: { "": true, "@mobile": "0" },
    radius: "$header-control-radius",
    fill: { "": "#surface", "@mobile": "#clear" },
    preset: "small",
    shadow: "none",
    transition: "color $transition, fill $transition",
    Label: { $: "> span", hide: { "": false, "@mobile": true } },
    PendingShortcut: { $: "> kbd[data-pending]", visibility: "hidden" },
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
    Hover: { $: "&:hover", color: "#text", fill: "#surface-2-hover" },
    Active: { $: "&:active", color: "#text", fill: "#surface-2-pressed" },
    NativeIcon: { $: "> svg", hide: true },
    Icon: {
      $: "&::before",
      content: '""',
      display: "block",
      flexShrink: "0",
      inlineSize: { "": "1rem", "@mobile": "1.25rem" },
      blockSize: { "": "1rem", "@mobile": "1.25rem" },
      fill: "#current",
      mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
    },
  },
});
