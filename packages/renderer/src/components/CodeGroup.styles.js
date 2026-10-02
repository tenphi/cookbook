import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CodeGroupRoot = defineComponent("CodeGroup", {
  as: "div",
  "data-element": "CodeGroup",
  styles: {
    Caption: {
      preset: "small",
      color: "#text-soft",
      "$margin-block-start": "0",
      "$margin-block-end": "1x",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
    Pre: { $: "pre" },
    Code: {
      $: "pre code",
      preset: "code",
      color: "#syntax-text",
      whiteSpace: "pre",
    },
  },
  elements: { Caption: "p", Pre: "pre", Code: "code" },
});
