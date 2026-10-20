import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MainContentRoot = defineComponent("MainContent", {
  as: "main",
  "data-element": "MainContent",
  styles: {
    padding: "5rem bottom",
    // A focus target for the skip link and page swaps, not a control. Clicking
    // its text focuses it, so keyboard scrolling would otherwise show a ring.
    outline: "none",
    // Layout spacing is a default; generated Markdown owns prose spacing.
    ContentSpacing: {
      $: ":where(Panel > Container) > * + *",
      blockMargin: "$margin-block-start $margin-block-end",
      "$margin-block-start": "3x",
    },
    Container: {
      $: "Panel > Container",
      inlineMargin: "auto",
      inlineSize: "max $content-width",
    },
    Panel: {
      $: "Panel",
      "$padding-block-start": {
        "": "3x",
        "@own(:nth-of-type(2))": "2x",
      },
      "$padding-block-end": {
        "": "3x",
        "@own(:first-of-type)": "2x",
      },
      blockPadding: "$padding-block-start $padding-block-end",
      inlinePadding: "$docs-content-pad-x",
    },
  },
});
