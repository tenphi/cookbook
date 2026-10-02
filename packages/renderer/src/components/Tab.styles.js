import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TabRoot = defineComponent("Tab", {
  as: "section",
  "data-element": "Tab",
  styles: {
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
    Hidden: { $: "&:where(*)", hide: { "": null, "[hidden]": true } },
    HiddenHeading: {
      $: "> *",
      hide: { "": null, "@own([data-tab-heading] & [hidden])": true },
    },
  },
  elements: { Heading: "h3" },
});
