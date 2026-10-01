import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const SkipLinkRoot = customizeComponent(
  "SkipLink",
  tasty({
    as: "a",
    "data-tasty-anatomy": "SkipLink",
    styles: {
      position: "fixed",
      inset: "($gap * 1.5) auto auto ($gap * 1.5)",
      inlineSize: "1px",
      blockSize: "1px",
      padding: "0",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      Focus: {
        $: "&:focus",
        zIndex: "20",
        inlineSize: "auto",
        blockSize: "auto",
        padding: "$gap ($gap * 2)",
        overflow: "visible",
        color: "#accent-surface-text",
        fill: "#accent-surface",
        clip: "auto",
        radius: "$radius",
        shadow: "0 1rem 3rem #shadow",
        textDecoration: "none",
      },
    },
  }),
);
