import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function SyntaxHighlightStyles() {
  useGlobalStyles(
    // State conditions add no specificity; preserve the former root category weight.
    ".tasty-code.tasty-code",
    resolveComponentStyles("SyntaxHighlight", {
      color: {
        "": null,
        ".td-syntax-comment": "#syntax-comment",
        ".td-syntax-punctuation": "#syntax-punctuation",
        ".td-syntax-keyword": "#syntax-keyword",
        ".td-syntax-string": "#syntax-string",
        ".td-syntax-token": "#syntax-token",
        ".td-syntax-property": "#syntax-property",
        ".td-syntax-number": "#syntax-number",
        ".td-syntax-function": "#syntax-function",
        ".td-syntax-value": "#syntax-value",
        ".td-syntax-operator": "#syntax-operator",
        ".td-syntax-text": "#syntax-text",
        ".td-green-text": "#green-text",
        ".td-red-text": "#red-text",
      },
      fill: { "": null, ".td-syntax-bg": "#syntax-bg" },
      overflowX: { "": null, ".td-syntax-scroll": "auto" },
      whiteSpace: { "": null, ".td-syntax-wrap": "pre-wrap" },
      overflowWrap: { "": null, ".td-syntax-wrap": "break-word" },
      // Descendant identities stay neutral so these rules retain their original weight.
      Marker: { $: ":where(.td-syntax-marker)", userSelect: "none" },
      Comment: {
        $: ":where(.td-syntax-comment)",
        color: "#syntax-comment",
      },
      Punctuation: {
        $: ":where(.td-syntax-punctuation)",
        color: "#syntax-punctuation",
      },
      Keyword: {
        $: ":where(.td-syntax-keyword)",
        color: "#syntax-keyword",
      },
      String: {
        $: ":where(.td-syntax-string)",
        color: "#syntax-string",
      },
      Token: {
        $: ":where(.td-syntax-token)",
        color: "#syntax-token",
      },
      Property: {
        $: ":where(.td-syntax-property)",
        color: "#syntax-property",
      },
      Number: {
        $: ":where(.td-syntax-number)",
        color: "#syntax-number",
      },
      Function: {
        $: ":where(.td-syntax-function)",
        color: "#syntax-function",
      },
      Value: {
        $: ":where(.td-syntax-value)",
        color: "#syntax-value",
      },
      Operator: {
        $: ":where(.td-syntax-operator)",
        color: "#syntax-operator",
      },
      Text: { $: ":where(.td-syntax-text)", color: "#syntax-text" },
      Bg: { $: ":where(.td-syntax-bg)", fill: "#syntax-bg" },
      Inserted: { $: ":where(.td-green-text)", color: "#green-text" },
      Deleted: { $: ":where(.td-red-text)", color: "#red-text" },
      Italic: { $: ":where(.td-syntax-italic)", preset: "italic" },
      Strong: { $: ":where(.td-syntax-strong)", preset: "strong" },
      Underline: {
        $: ":where(.td-syntax-underline)",
        textDecoration: "underline",
      },
    }),
  );
  return null;
}
