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
      hide: { "": true, "!@lg": false },
      padding: "1x $docs-sidebar-pad-x",
      blockBorder: "1bw solid #border end",
      fill: "#surface",
      Summary: {
        $: "summary",
        padding: "1x",
        color: "#text",
        preset: "small / strong",
        cursor: "pointer",
        radius: "1r",
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
      NestedList: { $: "ul ul", inlinePadding: "2x start" },
      Item: { $: "li", listStyle: "none", margin: "0", padding: "0" },
      Link: {
        $: "a",
        display: "block",
        padding: "1x",
        color: "#text-soft",
        preset: "small",
        radius: "1r",
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
          "@own(:focus-visible)":
            "$outline-width solid #focus / $outline-offset",
        },
      },
    },
  },
);
