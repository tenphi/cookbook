import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const TableOfContentsRoot = defineComponent("TableOfContents", {
  as: "cookbook-table-of-contents",
  "data-tasty-anatomy": "TableOfContents",
  styles: {
    display: "block",
    hide: { "": false, "@narrow-layout": true },
    paddingBlockStart: "($gap * 4)",
    paddingInlineStart: "$docs-sidebar-pad-x",
    paddingInlineEnd: "$docs-sidebar-pad-x",
    Heading: {
      $: "h2",
      margin: "0 0 $gap",
      color: "#text",
      preset: "small / strong",
    },
    List: {
      $: "ul",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      minInlineSize: "0",
      gap: "1px",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Item: {
      $: "li",
      minInlineSize: "0",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Link: {
      $: "a",
      display: "block",
      minInlineSize: "0",
      maxInlineSize: "100%",
      paddingBlockStart: "($gap * 0.5)",
      paddingBlockEnd: "($gap * 0.5)",
      color: "#text-muted",
      preset: "small",
      textDecoration: "none",
      overflowWrap: "anywhere",
    },
    LinkLabel: {
      $: "a > span",
      display: "block",
      minInlineSize: "0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    HoverLink: { $: "a:hover", color: "#text" },
    CurrentLink: {
      $: 'a[aria-current="location"]',
      color: "#accent-text",
      preset: "small / strong",
    },
  },
});
