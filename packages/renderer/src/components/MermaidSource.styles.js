import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MermaidSourceStyles() {
  useGlobalStyles(
    '.cookbook-markdown-content pre[data-language="mermaid"]:not(.not-content *)',
    resolveComponentStyles("MermaidSource", {
      padding: "0.875rem 1rem",
      overflowX: "auto",
      color: "#syntax-text",
      border: true,
      fill: "#syntax-bg",
      radius: "$card-radius",
      tabSize: "2",
    }),
  );
  return null;
}
