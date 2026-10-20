import closeIcon from "../icons/close.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

// Pagefind owns and updates result markup; its UI API exposes classes, not
// configurable data-element identities. Keep class selectors only for that bridge.
export const SearchResultsRoot = defineComponent("SearchResults", {
  as: "div",
  "data-element": "SearchResults",
  styles: {
    display: "flex",
    flow: "column",
    flexGrow: "1",
    blockSize: "min 0",
    "$pagefind-ui-primary": "#accent-text",
    "$pagefind-ui-text": "#text-soft",
    "$pagefind-ui-background": "#surface",
    "$pagefind-ui-border": "#border",
    "$pagefind-ui-border-width": "1bw",
    "$pagefind-ui-tag": "#surface-3",
    preset: "body",
    UI: {
      $: "UI, [data-element=EngineUI], .pagefind-ui",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      blockSize: "min 0",
    },
    Form: {
      $: ".pagefind-ui__form",
      position: "relative",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      blockSize: "min 0",
    },
    Field: {
      $: "Field",
      position: "relative",
      flexShrink: "0",
    },
    EngineControls: {
      $: ".pagefind-ui__search-input, .pagefind-ui__search-clear",
      hide: true,
    },
    Drawer: {
      $: ".pagefind-ui__drawer",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      blockSize: "min 0",
    },
    Input: {
      $: "Input",
      flexShrink: "0",
      inlineSize: "100%",
      blockSize: "min 3rem",
      inlinePadding: "2.75rem",
      color: "#text",
      border: true,
      radius: "1r",
      fill: "#surface",
      shadow: "none",
    },
    Clear: {
      $: "Clear",
      position: "absolute",
      blockInset: "0 start",
      inlineInset: "0 end",
      inlineSize: "3rem",
      blockSize: "3rem",
      padding: "0",
      color: "#text-soft",
      border: "0",
      fill: "#clear",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    Results: {
      $: ".pagefind-ui__results-area",
      flexGrow: "1",
      blockSize: "min 0",
      overflowY: "auto",
      blockMargin: { "": "3x start", "!@md": "2x start" },
      blockBorder: "1bw solid #border start",
      inlineSize: { "": null, "!@md": "(100% + 4x)" },
      inlineMargin: { "": null, "!@md": "-2x" },
      inlinePadding: { "": null, "!@md": "2x" },
      blockPadding: { "": null, "!@md": "2x end" },
    },
    Result: {
      $: ".pagefind-ui__result",
      blockPadding: "2x",
      blockBorder: "1bw solid #border start",
    },
    ResultLink: {
      $: ".pagefind-ui__result-link",
      color: "#text",
      preset: "strong",
    },
    Message: {
      $: ".pagefind-ui__message",
      color: "#text-soft",
      preset: "small",
    },
    List: {
      $: ".pagefind-ui__results",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Title: {
      $: ".pagefind-ui__result-title",
      margin: "0",
      preset: "body / strong",
    },
    Excerpt: {
      $: ".pagefind-ui__result-excerpt",
      margin: "1x top",
      color: "#text-soft",
      preset: "small",
    },
    NestedResult: {
      $: ".pagefind-ui__result-nested",
      margin: "2x top",
      inlinePadding: "2x start",
      inlineBorder: "1bw solid #border start",
    },
    Match: {
      $: "mark",
      color: "#accent-surface-text",
      fill: "#accent-surface",
      preset: "strong",
      radius: "0.2em",
    },
    More: {
      $: ".pagefind-ui__button",
      display: { "": null, "!@md": "block" },
      inlineSize: { "": null, "!@md": "max-content" },
      inlineMargin: { "": null, "!@md": "auto start" },
      padding: "1x 2x",
      border: true,
      radius: "1r",
      color: "#text",
      fill: "#surface-2",
      preset: "navigation",
    },
    HoverMore: {
      $: ".pagefind-ui__button",
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    SearchIcon: {
      $: "Field::before",
      content: '""',
      position: "absolute",
      zIndex: "1",
      blockInset: "1rem start",
      inlineInset: "1rem start",
      display: "block",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#text-soft",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
      pointerEvents: "none",
    },
    ClearIcon: {
      $: "Clear::before",
      content: '""',
      display: "block",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(closeIcon)}") center / 1rem no-repeat`,
    },
    SuppressedClear: {
      $: "[data-element=Clear]",
      hide: { "": null, "@own([hidden])": true },
    },
  },
});
