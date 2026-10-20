import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PageActionsRoot = defineComponent("PageActions", {
  as: "cookbook-page-actions",
  "data-element": "PageActions",
  styles: {
    display: "flex",
    flow: "row wrap",
    alignItems: "center",
    gap: "1x",
    preset: "small",
    Control: {
      $: "button, a",
      display: "inline-flex",
      alignItems: "center",
      padding: "1x 1.5x",
      border: true,
      radius: "1r",
      color: "#text",
      fill: "#surface",
      preset: "small",
      textDecoration: "none",
      cursor: "pointer",
    },
    Hover: {
      $: "button, a",
      fill: {
        "": null,
        "@own(:hover)": "#surface-2",
      },
    },
    Focus: {
      $: "button, a",
      outline: {
        "": null,
        "@own(:focus-visible)": "$outline-width solid #focus / $outline-offset",
      },
    },
    Pending: {
      $: "button",
      cursor: { "": null, '@own([aria-disabled="true"])': "wait" },
    },
    Status: {
      $: "*",
      color: { "": null, "@own([role=status])": "#text-soft" },
    },
  },
});
