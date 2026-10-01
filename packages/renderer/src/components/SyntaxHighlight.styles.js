import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function SyntaxHighlightStyles() {
  useGlobalStyles(
    ".tasty-code",
    resolveComponentStyles("SyntaxHighlight", {
      Scroll: { $: "&.td-syntax-scroll", overflowX: "auto" },
      Wrap: {
        $: "&.td-syntax-wrap",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      },
      Marker: { $: ".td-syntax-marker", userSelect: "none" },
      Comment: {
        $: "&.td-syntax-comment, .td-syntax-comment",
        color: "#syntax-comment",
      },
      Punctuation: {
        $: "&.td-syntax-punctuation, .td-syntax-punctuation",
        color: "#syntax-punctuation",
      },
      Keyword: {
        $: "&.td-syntax-keyword, .td-syntax-keyword",
        color: "#syntax-keyword",
      },
      String: {
        $: "&.td-syntax-string, .td-syntax-string",
        color: "#syntax-string",
      },
      Token: {
        $: "&.td-syntax-token, .td-syntax-token",
        color: "#syntax-token",
      },
      Property: {
        $: "&.td-syntax-property, .td-syntax-property",
        color: "#syntax-property",
      },
      Number: {
        $: "&.td-syntax-number, .td-syntax-number",
        color: "#syntax-number",
      },
      Function: {
        $: "&.td-syntax-function, .td-syntax-function",
        color: "#syntax-function",
      },
      Value: {
        $: "&.td-syntax-value, .td-syntax-value",
        color: "#syntax-value",
      },
      Operator: {
        $: "&.td-syntax-operator, .td-syntax-operator",
        color: "#syntax-operator",
      },
      Text: { $: "&.td-syntax-text, .td-syntax-text", color: "#syntax-text" },
      Bg: { $: "&.td-syntax-bg, .td-syntax-bg", fill: "#syntax-bg" },
      Inserted: { $: "&.td-green-text, .td-green-text", color: "#green-text" },
      Deleted: { $: "&.td-red-text, .td-red-text", color: "#red-text" },
      Italic: { $: ".td-syntax-italic", fontStyle: "italic" },
      Strong: { $: ".td-syntax-strong", preset: "strong" },
      Underline: { $: ".td-syntax-underline", textDecoration: "underline" },
    }),
  );
  return null;
}
