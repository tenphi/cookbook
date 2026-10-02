import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TabsRoot = defineComponent("Tabs", {
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
      $: '> [data-element="List"] > button',
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
      $: '> [data-element="List"] > button',
      color: {
        "": null,
        '@own([aria-selected="true"])': "#accent-surface-text",
      },
      fill: {
        "": null,
        '@own([aria-selected="true"])': "#accent-surface",
      },
    },
    FocusedButton: {
      $: '> [data-element="List"] > button',
      outline: {
        "": null,
        "@own(:focus-visible)": "2px #focus / -2px",
      },
    },
  },
  elements: { List: "div" },
});
