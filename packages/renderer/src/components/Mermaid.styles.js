import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MermaidStyles() {
  useGlobalStyles(
    ".cookbook-markdown-content .td-mermaid",
    resolveComponentStyles("Mermaid", {
      display: "grid",
      placeItems: "center",
      minInlineSize: "0",
      padding: "($gap * 2)",
      overflowX: "auto",
      border: true,
      fill: "#surface-2",
      radius: "$card-radius",
      Diagram: {
        $: "> svg",
        $bg: "#surface-2",
        $fg: "#text",
        $line: "#text-soft",
        $accent: "#accent-text",
        $muted: "#text-soft",
        $surface: "#surface",
        $border: "#border-strong",
        $_text: "#text",
        "$_text-sec": "#text-soft",
        "$_text-muted": "#text-soft",
        "$_text-faint": "#text-muted",
        $_line: "#text-soft",
        $_arrow: "#accent-text",
        "$_node-fill": "#surface",
        "$_node-stroke": "#border-strong",
        "$_group-fill": "#surface-2",
        "$_group-hdr": "#surface",
        "$_inner-stroke": "#border",
        "$_key-badge": "#surface",
        display: "block",
        maxInlineSize: "100%",
        blockSize: "auto",
        margin: "auto",
      },
      Text: { $: "text", fontFamily: "$body-font-family" },
      MonoText: { $: "[class~='mono']", fontFamily: "$code-font-family" },
    }),
  );
  return null;
}
