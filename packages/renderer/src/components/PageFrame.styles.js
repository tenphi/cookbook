import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PageFrameRoot = defineComponent("PageFrame", {
  as: "div",
  "data-element": "PageFrame",
  styles: {
    display: "flex",
    flow: "column",
    blockSize: "min 100vh",
    MainFrame: {
      $: "> MainFrame",
      inlineSize: { "": "0 100%", "@md": "min(100%, $layout-width)" },
      inlineMargin: "auto",
      blockPadding: "$docs-nav-height start",
      inlinePadding: "0 start",
    },
    SidebarFrame: {
      $: "& > [data-element=MainFrame]",
      inlinePadding: {
        "": null,
        "[data-has-sidebar]": "$sidebar-width start",
        "[data-has-sidebar] & !@md": "0 start",
      },
    },
    Columns: {
      $: "> MainFrame > div",
      display: { "": "flex", "!@lg": "block" },
      inlineSize: "min 0",
    },
  },
});
