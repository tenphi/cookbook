import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const HeaderFrameRoot = customizeComponent(
  "HeaderFrame",
  tasty({
    as: "header",
    "data-tasty-anatomy": "HeaderFrame",
    styles: {
      position: "fixed",
      zIndex: "10",
      inset: "0 0 auto",
      inlineSize: "100%",
      blockSize: "$docs-nav-height",
      padding: "0 $docs-nav-pad-x",
      borderBlockEnd: "$border-width solid #border",
      fill: "#header",
      backdropFilter: "blur(16px)",
    },
  }),
);
