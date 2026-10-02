import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const HeaderFrameRoot = defineComponent("HeaderFrame", {
  as: "header",
  "data-element": "HeaderFrame",
  styles: {
    position: "fixed",
    zIndex: "10",
    inset: "0 0 auto",
    inlineSize: "100%",
    blockSize: "$docs-nav-height",
    padding: "0 $docs-nav-pad-x",
    blockBorder: "$border-width solid #border end",
    fill: "#header",
    backdropFilter: "blur(16px)",
  },
});
