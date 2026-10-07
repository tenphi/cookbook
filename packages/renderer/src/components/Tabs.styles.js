import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TabsRoot = defineComponent("Tabs", {
  as: "div",
  "data-element": "Tabs",
  styles: {
    "$margin-block-start": "2x",
    "$margin-block-end": "2x",
    blockMargin: "$margin-block-start $margin-block-end",
    inlineMargin: "0",
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
      $: "> List > button",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
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
      $: "> List > button",
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
      $: "> List > button",
      outline: {
        "": null,
        "@own(:focus-visible)":
          "$outline-width #focus / ($outline-offset * -1)",
      },
    },
  },
  elements: { List: "div" },
});
