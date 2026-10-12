import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TableOfContentsLayoutRoot = defineComponent(
  "TableOfContentsLayout",
  {
    as: "aside",
    "data-element": "TableOfContentsLayout",
    styles: {
      display: { "": "", ":has(cookbook-mobile-toc)": "block" },
      hide: {
        "": false,
        "!@lg": true,
        ":has(cookbook-mobile-toc)": false,
      },
      order: { "": "2", "!@lg": "0" },
      position: "relative",
      inlineSize: {
        "": "max($sidebar-width, calc($sidebar-width + (100% - $content-width - $sidebar-width) / 2))",
        "!@lg": "100%",
      },
      Content: {
        $: "Content",
        position: { "": "sticky", "!@lg": "static" },
        blockInset: "$docs-nav-height start",
        inlineSize: "100%",
        blockSize: {
          "": "(100vh - $docs-nav-height)",
          "!@lg": "auto",
        },
        overflowY: { "": "auto", "!@lg": "visible" },
        scrollbar: "none",
      },
    },
  },
);
