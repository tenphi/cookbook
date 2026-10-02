import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TopNavigationRoot = defineComponent("TopNavigation", {
  as: "nav",
  "data-tasty-anatomy": "TopNavigation",
  styles: {
    display: "flex",
    hide: { "": false, "@mobile": true },
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
      blockPadding: "($gap * 1.25) start, $gap end",
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
      // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: 'a[aria-current="page"]::after',
      content: '""',
      position: "absolute",
      inset: "auto 0 0",
      blockSize: "2px",
      radius: "999px",
      fill: "#accent-surface",
    },
  },
});
