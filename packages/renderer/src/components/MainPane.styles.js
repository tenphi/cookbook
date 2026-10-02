import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MainPaneRoot = defineComponent("MainPane", {
  as: "div",
  "data-tasty-anatomy": "MainPane",
  styles: {
    isolation: "isolate",
    inlineSize: "0 100% initial",
    WithSidebars: {
      $: "&:is([data-has-sidebar][data-has-toc] .main-pane)",
      order: "1",
      inlineSize: {
        "": "min(calc(100% - $sidebar-width), calc($content-width + (100% - $content-width - $sidebar-width) / 2))",
        "@narrow-layout": "100%",
      },
    },
  },
});
