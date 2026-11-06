import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CardGridRoot = defineComponent("CardGrid", {
  as: "div",
  "data-element": "CardGrid",
  styles: {
    display: "grid",
    gridColumns: {
      "": "minmax(0, 1fr)",
      "@sm": "repeat(2, minmax(0, 1fr))",
    },
    gap: "2x",
    Card: {
      // The sibling selector outranks prose block spacing, so the grid gap
      // alone separates cards and cards in a row keep the same height.
      $: "> Card + Card",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
    },
  },
});
