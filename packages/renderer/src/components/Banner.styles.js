import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const BannerRoot = defineComponent("Banner", {
  as: "div",
  "data-tasty-anatomy": "Banner",
  styles: {
    padding: "($gap * 1.5) $docs-nav-pad-x",
    color: "#accent-surface-text",
    fill: "#accent-surface",
    preset: "body / strong",
    textAlign: "center",
    textWrap: "balance",
    shadow: "none",
    Link: { $: "a", color: "#accent-surface-text" },
  },
});
