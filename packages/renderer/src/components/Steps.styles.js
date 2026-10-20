import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const StepsRoot = defineComponent("Steps", {
  as: "ol",
  "data-element": "Steps",
  styles: {
    display: "grid",
    gap: "2x",
    inlinePadding: "4x start",
    inlineBorder: "1bw solid #border start",

    Item: {
      $: "> li",
      inlinePadding: "1x start",
    },
    Marker: {
      $: "> li::marker",
      color: "#accent-text",
      preset: "strong",
    },
  },
});
