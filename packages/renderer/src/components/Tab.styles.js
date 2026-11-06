import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TabRoot = defineComponent("Tab", {
  as: "section",
  "data-element": "Tab",
  styles: {
    hide: { "": null, "[hidden]": true },

    "$margin-block-start": "0",
    "$margin-block-end": "0",
    blockMargin: "$margin-block-start $margin-block-end",
    inlineMargin: "0",
    padding: "2x",
    Heading: {
      "$margin-block-start": "0",
      "$margin-block-end": "1x",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
      preset: "h3",
    },
    HiddenHeading: {
      $: "> *",
      hide: { "": null, "@own([data-tab-heading] & [hidden])": true },
    },
    Body: {
      // The sibling selector outranks prose block spacing, so content starts at
      // the panel padding while the fallback heading is hidden.
      $: "> Heading + Body",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
    },
  },
  elements: { Heading: "h3", Body: "div" },
});
