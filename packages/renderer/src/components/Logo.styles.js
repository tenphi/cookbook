import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const LogoRoot = defineComponent("Logo", {
  as: "span",
  "data-tasty-anatomy": "Logo",
  styles: {
    display: "inline-grid",
    flexGrow: "0",
    flexShrink: "0",
    flexBasis: "auto",
    inlineSize: "4rem",
    blockSize: "4rem",
    color: "#logo-surface",
    Svg: {
      $: "> svg",
      display: "block",
      inlineSize: "100%",
      blockSize: "100%",
    },
    Mark: {
      $: "> svg > .td-logo__mark",
      color: "#logo-mark",
    },
  },
});
