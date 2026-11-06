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
    MarkdownCodeBlock: {
      // The sibling selector outranks prose block spacing, so the caption's
      // own end margin separates it from the code, including when hidden.
      $: "Caption + MarkdownCodeBlock",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
    },
    Pre: { $: "pre", preset: "code" },
    Code: {
      $: "pre code",
      color: "#syntax-text",
      whiteSpace: "pre",
    },
  },
  elements: { Caption: "p", Pre: "pre", Code: "code" },
});
