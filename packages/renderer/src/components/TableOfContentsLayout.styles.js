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
        "@narrow-layout": true,
        ":has(cookbook-mobile-toc)": false,
      },
      order: { "": "2", "@narrow-layout": "0" },
      position: "relative",
      inlineSize: {
        "": "max($sidebar-width, calc($sidebar-width + (100% - $content-width - $sidebar-width) / 2))",
        "@narrow-layout": "100%",
      },
      Content: {
        $: ".right-sidebar",
        position: { "": "sticky", "@narrow-layout": "static" },
        blockInset: "$docs-nav-height start",
        inlineSize: "100%",
        blockSize: {
          "": "(100vh - $docs-nav-height)",
          "@narrow-layout": "auto",
        },
        overflowY: { "": "auto", "@narrow-layout": "visible" },
        scrollbar: "none",
      },
    },
  },
);
