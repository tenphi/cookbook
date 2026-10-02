import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const LogoRoot = defineComponent("Logo", {
  as: "span",
  "data-element": "Logo",
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
      color: "#logo-mark",
    },
  },
});
