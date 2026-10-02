import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TabRoot = defineComponent("Tab", {
  as: "section",
  "data-tasty-anatomy": "Tab",
  styles: {
    margin: "0",
    padding: "2x",
    Heading: { margin: "0 0 1x", preset: "h3" },
    Hidden: { $: "&[hidden]", hide: true },
    HiddenHeading: { $: "> [data-tab-heading][hidden]", hide: true },
  },
  elements: { Heading: "h3" },
});
