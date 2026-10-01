import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const TabsRoot = customizeComponent(
  "Tabs",
  tasty({
    as: "div",
    "data-tasty-anatomy": "Tabs",
    styles: {
      margin: "2x 0",
      border: true,
      radius: "1cr",
      overflow: "clip",
      fill: "#surface",
      List: {
        padding: "1x",
        display: "flex",
        gap: "1x",
        overflow: "auto",
        fill: "#surface-2",
      },
      Button: {
        $: "> [data-tabs-list] > button",
        margin: "0",
        preset: "navigation",
        padding: "1x 2x",
        border: "0",
        radius: "1r",
        color: "#text",
        fill: "#clear",
        cursor: "pointer",
        whiteSpace: "nowrap",
      },
      SelectedButton: {
        $: '> [data-tabs-list] > button[aria-selected="true"]',
        color: "#accent-surface-text",
        fill: "#accent-surface",
      },
      FocusedButton: {
        $: "> [data-tabs-list] > button:focus-visible",
        outline: "2px #focus / -2px",
      },
    },
    elements: { List: "div" },
  }),
);
