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
    gap: "2x",
    padding: "1x $docs-sidebar-pad-x",
    blockBorder: "1bw solid #border start",
    Social: {
      $: "Social",
      display: "flex",
      hide: { "": false, ":empty": true },
      alignItems: "center",
      gap: "2x",
      inlineMargin: "auto end",
      blockPadding: "2x",
    },
  },
});
