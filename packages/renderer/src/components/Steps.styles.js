import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const StepsRoot = defineComponent("Steps", {
  as: "ol",
  "data-tasty-anatomy": "Steps",
  styles: {
    display: "grid",
    gap: "2x",
    padding: "4x left",
    border: "1bw left #border",

    Item: {
      $: "> li",
      padding: "1x left",
    },
    Marker: {
      $: "> li::marker",
      color: "#accent-text",
      preset: "strong",
    },
  },
});
