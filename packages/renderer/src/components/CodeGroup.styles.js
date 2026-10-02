import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CodeGroupRoot = defineComponent("CodeGroup", {
  as: "div",
  "data-tasty-anatomy": "CodeGroup",
  styles: {
    Caption: { preset: "small", color: "#text-soft", margin: "0 0 1x" },
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
