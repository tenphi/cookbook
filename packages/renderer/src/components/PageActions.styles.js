import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const PageActionsRoot = customizeComponent(
  "PageActions",
  tasty({
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
      Hover: { $: "button:hover, a:hover", fill: "#surface-2" },
      Focus: {
        $: "button:focus-visible, a:focus-visible",
        outline: "2px solid #focus / 2px",
      },
      Pending: { $: 'button[aria-disabled="true"]', cursor: "wait" },
      Status: { $: "[role=status]", color: "#text-soft" },
    },
  }),
);
