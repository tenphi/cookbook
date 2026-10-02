import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MobileMenuFooterRoot = defineComponent("MobileMenuFooter", {
  as: "div",
  "data-element": "MobileMenuFooter",
  styles: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flow: "row wrap",
    gap: "($gap * 2)",
    blockPadding: "$gap",
    blockBorder: "$border-width solid #border start",
    Social: {
      $: ".td-mobile-preferences__social",
      display: "flex",
      hide: { "": false, ":empty": true },
      alignItems: "center",
      gap: "($gap * 2)",
      inlineMargin: "auto end",
      blockPadding: "($gap * 2)",
    },
  },
});
