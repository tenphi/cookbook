import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownInlineCodeStyles() {
  useGlobalStyles(
    ".cookbook-markdown-content code:not(:where(pre *, .not-content *))",
    resolveComponentStyles("MarkdownInlineCode", {
      padding: "0.125rem 0.375rem",
      color: "#text-soft",
      fill: "#surface-3",
      preset: "inline-code",
      radius: "($radius * 0.65)",
    }),
  );
  return null;
}
