import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const BannerRoot = customizeComponent(
  "Banner",
  tasty({
    as: "div",
    "data-tasty-anatomy": "Banner",
    styles: {
      padding: "($gap * 1.5) $docs-nav-pad-x",
      color: "#accent-surface-text",
      fill: "#accent-surface",
      preset: "body / strong",
      textAlign: "center",
      textWrap: "balance",
      boxShadow: "none",
      Link: { $: "a", color: "#accent-surface-text" },
    },
  }),
);
