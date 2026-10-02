import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PageFrameRoot = defineComponent("PageFrame", {
  as: "div",
  "data-tasty-anatomy": "PageFrame",
  styles: {
    display: "flex",
    flow: "column",
    blockSize: "min 100vh",
    MainFrame: {
      $: "> .main-frame",
      inlineSize: { "": "0 100%", "@desktop": "min(100%, $layout-width)" },
      inlineMargin: "auto",
      blockPadding: "$docs-nav-height start",
      inlinePadding: "0 start",
    },
    SidebarFrame: {
      $: "&[data-has-sidebar] > .main-frame",
      inlinePadding: { "": "$sidebar-width start", "@mobile": "0 start" },
    },
    Columns: {
      $: "> .main-frame > div",
      display: { "": "flex", "@narrow-layout": "block" },
      inlineSize: "min 0",
    },
  },
});
