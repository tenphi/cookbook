import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TableOfContentsRoot = defineComponent("TableOfContents", {
  as: "cookbook-table-of-contents",
  "data-tasty-anatomy": "TableOfContents",
  styles: {
    display: "block",
    hide: { "": false, "@narrow-layout": true },
    blockPadding: "($gap * 4) start",
    inlinePadding: "$docs-sidebar-pad-x",
    Heading: {
      $: "h2",
      margin: "0 0 $gap",
      color: "#text",
      preset: "small / strong",
    },
    List: {
      $: "ul",
      display: "grid",
      gridColumns: "minmax(0, 1fr)",
      inlineSize: "min 0",
      gap: "1px",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Item: {
      $: "li",
      inlineSize: "min 0",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Link: {
      $: "a",
      display: "block",
      inlineSize: "0 auto 100%",
      blockPadding: "($gap * 0.5)",
      color: "#text-muted",
      preset: "small",
      textDecoration: "none",
      overflowWrap: "anywhere",
    },
    LinkLabel: {
      $: "a > span",
      display: "block",
      inlineSize: "min 0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    HoverLink: { $: "a", color: { "": null, "@own(:hover)": "#text" } },
    CurrentLink: {
      $: "a",
      color: { "": null, '@own([aria-current="location"])': "#accent-text" },
      preset: { "": null, '@own([aria-current="location"])': "small / strong" },
    },
  },
});
