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
        radius: "1cr",
      },
      Cell: {
        $: "th, td",
        padding: "1.5x 2x",
        verticalAlign: "top",
        textAlign: {
          "": null,
          "@own(align=left)": "left",
          "@own(align=center)": "center",
          "@own(align=right)": "right",
        },
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: "#border",
      },
      LastBodyRowCell: {
        $: "tbody td",
        // Clear only the last row's end border; the theme may configure its start border.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderBlockEnd: { "": null, "@own(:is(tr:last-child >))": "0" },
      },
      HeaderCell: {
        $: "th",
        color: "#text",
        fill: "#surface-2",
        textAlign: { "": "start", "@own(align)": null },
        // Round only the top corners so the header row matches in either direction.
        radius: {
          "": null,
          "@own(:is(thead:first-child tr:first-child >))": "(1cr - 1bw) top",
        },
      },
      Scroll: {
        $: "Scroll",
        inlineSize: "initial 100% 100%",
        overflow: "auto",
        scrollbar: "thin",
      },
    }),
  );
  return null;
}
