import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PageActionsRoot = defineComponent("PageActions", {
  as: "cookbook-page-actions",
  "data-tasty-anatomy": "PageActions",
  styles: {
    display: "flex",
    flow: "row wrap",
    alignItems: "center",
    gap: "$gap",
    preset: "small",
    Control: {
      $: "button, a",
      display: "inline-flex",
      alignItems: "center",
      padding: "$gap ($gap * 1.5)",
      border: true,
      radius: "$radius",
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
        "@own(:focus-visible)": "2px solid #focus / 2px",
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
