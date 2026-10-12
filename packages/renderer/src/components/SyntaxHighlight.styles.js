import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function SyntaxHighlightStyles() {
  useGlobalStyles(
    // State conditions add no specificity; preserve the former root category weight.
    "[data-syntax][data-syntax]",
    resolveComponentStyles("SyntaxHighlight", {
      color: {
        "": null,
        "[data-syntax-comment]": "#syntax-comment",
        "[data-syntax-punctuation]": "#syntax-punctuation",
        "[data-syntax-keyword]": "#syntax-keyword",
        "[data-syntax-string]": "#syntax-string",
        "[data-syntax-token]": "#syntax-token",
        "[data-syntax-property]": "#syntax-property",
        "[data-syntax-number]": "#syntax-number",
        "[data-syntax-function]": "#syntax-function",
        "[data-syntax-value]": "#syntax-value",
        "[data-syntax-operator]": "#syntax-operator",
        "[data-syntax-text]": "#syntax-text",
        "[data-green-text]": "#green-text",
        "[data-red-text]": "#red-text",
      },
      fill: { "": null, "[data-syntax-bg]": "#syntax-bg" },
      overflowX: { "": null, "[data-syntax-scroll]": "auto" },
      whiteSpace: { "": null, "[data-syntax-wrap]": "pre-wrap" },
      overflowWrap: { "": null, "[data-syntax-wrap]": "break-word" },
      // Descendant identities stay neutral so these rules retain their original weight.
      Marker: {
        $: ":where(span)",
        userSelect: { "": null, "@own(syntax-marker)": "none" },
      },
      Comment: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-comment)": "#syntax-comment" },
      },
      Punctuation: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-punctuation)": "#syntax-punctuation" },
      },
      Keyword: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-keyword)": "#syntax-keyword" },
      },
      String: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-string)": "#syntax-string" },
      },
      Token: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-token)": "#syntax-token" },
      },
      Property: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-property)": "#syntax-property" },
      },
      Number: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-number)": "#syntax-number" },
      },
      Function: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-function)": "#syntax-function" },
      },
      Value: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-value)": "#syntax-value" },
      },
      Operator: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-operator)": "#syntax-operator" },
      },
      Text: {
        $: ":where(span)",
        color: { "": null, "@own(syntax-text)": "#syntax-text" },
      },
      Bg: {
        $: ":where(span)",
        fill: { "": null, "@own(syntax-bg)": "#syntax-bg" },
      },
      Inserted: {
        $: ":where(span)",
        color: { "": null, "@own(green-text)": "#green-text" },
      },
      Deleted: {
        $: ":where(span)",
        color: { "": null, "@own(red-text)": "#red-text" },
      },
      Italic: {
        $: ":where(span)",
        preset: { "": null, "@own(syntax-italic)": "italic" },
      },
      Strong: {
        $: ":where(span)",
        preset: { "": null, "@own(syntax-strong)": "strong" },
      },
      Underline: {
        $: ":where(span)",
        textDecoration: { "": null, "@own(syntax-underline)": "underline" },
      },
    }),
  );
  return null;
}
