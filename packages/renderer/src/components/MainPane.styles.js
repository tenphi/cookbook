import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MainPaneRoot = defineComponent("MainPane", {
  as: "div",
  "data-element": "MainPane",
  styles: {
    order: { "": null, "[data-has-sidebar] & [data-has-toc]": "1" },
    isolation: "isolate",
    inlineSize: {
      "": "0 100% initial",
      "[data-has-sidebar] & [data-has-toc]":
        "min(calc(100% - $sidebar-width), calc($content-width + (100% - $content-width - $sidebar-width) / 2))",
      "([data-has-sidebar] & [data-has-toc]) & (@narrow-layout)": "100%",
    },
  },
});
