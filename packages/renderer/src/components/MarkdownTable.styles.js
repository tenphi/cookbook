import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownTableStyles() {
  useGlobalStyles(
    ".cookbook-markdown-content:where(*)",
    resolveComponentStyles("MarkdownTable", {
      Table: {
        $: "table",
        inlineSize: "100%",
        borderCollapse: "separate",
        borderSpacing: "0",
        color: "#text-soft",
        preset: "small",
        border: true,
        borderColor: "#border",
        radius: "$card-radius",
      },
      Cell: {
        $: "th, td",
        padding: "($gap * 1.5) ($gap * 2)",
        verticalAlign: "top",
        borderColor: "#border",
      },
      LastBodyRowCell: {
        $: "tbody td",
        borderBlockEnd: {
          "@own(:is(tbody tr:last-child > td))": "0",
        },
      },
      HeaderCell: {
        $: "th",
        color: "#text",
        fill: "#surface-2",
        textAlign: "start",
        radius: {
          "@own(:is(thead:first-child tr:first-child > th) & :first-child & !:last-child)":
            "($card-radius - $border-width) top-left",
          "@own(:is(thead:first-child tr:first-child > th) & !:first-child & :last-child)":
            "($card-radius - $border-width) top-right",
          "@own(:is(thead:first-child tr:first-child > th) & :first-child & :last-child)":
            "($card-radius - $border-width) top",
        },
      },
      Scroll: {
        $: ".td-table-scroll",
        inlineSize: "100%",
        maxInlineSize: "100%",
        overflow: "auto",
        scrollbarWidth: "thin",
      },
    }),
  );
  return null;
}
