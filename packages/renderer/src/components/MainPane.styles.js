import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const MainPaneRoot = customizeComponent(
  "MainPane",
  tasty({
    as: "div",
    "data-tasty-anatomy": "MainPane",
    styles: {
      isolation: "isolate",
      inlineSize: "100%",
      minInlineSize: "0",
      WithSidebars: {
        $: "&:is([data-has-sidebar][data-has-toc] .main-pane)",
        order: "1",
        inlineSize: {
          "": "min(calc(100% - $sidebar-width), calc($content-width + (100% - $content-width - $sidebar-width) / 2))",
          "@narrow-layout": "100%",
        },
      },
    },
  }),
);
