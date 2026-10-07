import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MobileTableOfContentsRoot = defineComponent(
  "MobileTableOfContents",
  {
    as: "cookbook-mobile-toc",
    "data-element": "MobileTableOfContents",
    styles: {
      display: "block",
      hide: { "": true, "@narrow-layout": false },
      padding: "$gap $docs-sidebar-pad-x",
      blockBorder: "$border-width solid #border end",
      fill: "#surface",
      Summary: {
        $: "summary",
        padding: "$gap",
        color: "#text",
        preset: "small / strong",
        cursor: "pointer",
        radius: "$radius",
      },
      List: {
        $: "ul",
        "$item-gap": "2px",
        listStyle: "none",
        padding: "0",
        margin: "0",
        display: "grid",
        gap: "$item-gap",
      },
      NestedList: { $: "ul ul", inlinePadding: "($gap * 2) start" },
      Item: { $: "li", listStyle: "none", margin: "0", padding: "0" },
      Link: {
        $: "a",
        display: "block",
        padding: "$gap",
        color: "#text-soft",
        preset: "small",
        radius: "$radius",
        textDecoration: "none",
      },
      HoverLink: {
        $: "a",
        fill: { "": null, "@own(:hover)": "#surface-2" },
        color: { "": null, "@own(:hover)": "#text" },
      },
      Focus: {
        $: "a, summary",
        outline: {
          "": null,
          "@own(:is(a:focus-visible)) | @own(:is(summary:focus-visible))":
            "$outline-width solid #focus / $outline-offset",
        },
      },
    },
  },
);
