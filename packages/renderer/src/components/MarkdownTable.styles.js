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
        border: "$border-width solid #border",
        radius: "$card-radius",
      },
      Cell: {
        $: "th, td",
        padding: "($gap * 1.5) ($gap * 2)",
        verticalAlign: "top",
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: "#border",
      },
      LastBodyRowCell: {
        $: "tbody td",
        // Clear only the last row's end border; the theme may configure its start border.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderBlockEnd: { "@own(:is(tbody tr:last-child > td))": "0" },
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
        inlineSize: "initial 100% 100%",
        overflow: "auto",
        scrollbar: "thin",
      },
    }),
  );
  return null;
}
