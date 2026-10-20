import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TopNavigationRoot = defineComponent("TopNavigation", {
  as: "nav",
  "data-element": "TopNavigation",
  styles: {
    display: "flex",
    hide: { "": false, "!@md": true },
    alignItems: "stretch",
    gap: "clamp(1.25rem, 2.5vw, 2.5rem)",
    inlineSize: "100%",
    blockSize: "min 2.75rem",
    blockBorder: "1bw solid #border start",
    overflowX: "auto",
    scrollbar: "none",

    Scrollbar: { $: "&::-webkit-scrollbar", hide: true },
    Link: {
      $: "a",
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      blockPadding: "1.25x start, 1x end",
      color: "#text-soft",
      preset: "navigation",
      textDecoration: "none",
      whiteSpace: "nowrap",
    },
    HoverLink: { $: "a", color: { "": null, "@own(:hover)": "#text" } },
    CurrentLink: {
      $: "a",
      color: { "": null, '@own([aria-current="page"])': "#accent-text" },
    },
    ActiveIndicator: {
      $: 'a[aria-current="page"]::after',
      "$indicator-height": "2px",
      content: '""',
      position: "absolute",
      inset: "auto 0 0",
      blockSize: "$indicator-height",
      radius: "round",
      fill: "#accent-surface",
    },
  },
});
