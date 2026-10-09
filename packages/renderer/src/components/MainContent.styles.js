import { TASTY_SPACING_PROPERTIES } from "../theme/tasty-config.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MainContentRoot = defineComponent("MainContent", {
  as: "main",
  "data-element": "MainContent",
  styles: {
    "@property": TASTY_SPACING_PROPERTIES,
    padding: "0 0 5rem",
    // Layout spacing is a default; generated Markdown owns prose spacing.
    ContentSpacing: {
      $: ":where(.content-panel > .cookbook-container) > * + *",
      blockMargin: "$margin-block-start $margin-block-end",
      "$margin-block-start": "($gap * 3)",
    },
    Container: {
      $: ".content-panel > .cookbook-container",
      inlineMargin: "auto",
      inlineSize: "max $content-width",
    },
    Panel: {
      $: ".content-panel",
      "$padding-block-start": {
        "": "($gap * 3)",
        "@own(:nth-of-type(2))": "($gap * 2)",
      },
      "$padding-block-end": {
        "": "($gap * 3)",
        "@own(:first-of-type)": "($gap * 2)",
      },
      blockPadding: "$padding-block-start $padding-block-end",
      inlinePadding: "$docs-content-pad-x",
    },
  },
});
