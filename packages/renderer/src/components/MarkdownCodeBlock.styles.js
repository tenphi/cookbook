import { useGlobalStyles } from "@tenphi/tasty";
import checkIcon from "../icons/check.svg?raw";
import copyIcon from "../icons/copy.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownCodeBlockStyles() {
  useGlobalStyles(
    ':is(.cookbook-markdown-content .td-code-block, .td-code-block[data-tasty-anatomy="MarkdownCodeBlock"])',
    resolveComponentStyles("MarkdownCodeBlock", {
      "$copy-button-size": "2rem",
      display: "block",
      position: "relative",
      minInlineSize: "0",
      Pre: {
        $: "> pre",
        margin: "0",
        padding: "0 3.75rem 0 1rem",
        // Balance a single code line around the copy control, including the border.
        blockPadding:
          "max(0px, ($copy-button-size - 1lh) / 2 + $gap - $border-width)",
        overflowX: "auto",
        color: "#syntax-text",
        border: true,
        fill: "#syntax-bg",
        radius: "$card-radius",
        tabSize: "2",
      },
      CopyButton: {
        $: "> [data-copy-code]",
        position: "absolute",
        zIndex: "1",
        insetBlockStart: "$gap",
        insetInlineEnd: "$gap",
        margin: "0",
        display: "grid",
        placeItems: "center",
        inlineSize: "$copy-button-size",
        minInlineSize: "$copy-button-size",
        blockSize: "$copy-button-size",
        minBlockSize: "$copy-button-size",
        padding: "0",
        color: "#text-soft",
        border: true,
        fill: "#surface-2",
        radius: "$radius",
        preset: "small / strong",
        cursor: "pointer",
        transition: "color $transition, fill $transition",
      },
      HoverCopyButton: {
        $: "> [data-copy-code]:hover",
        color: "#text",
        fill: "#surface-2-hover",
      },
      CopiedButton: {
        $: '> [data-copy-code][data-copy-state="copied"]',
        color: "#green-text",
        borderColor: "#green",
      },
      CopyIcon: {
        $: "> [data-copy-code] > [data-copy-icon]",
        display: "block",
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#current",
        mask: `url("${svgIconUrl(copyIcon)}") center / contain no-repeat`,
      },
      CopiedIcon: {
        $: '> [data-copy-code][data-copy-state="copied"] > [data-copy-icon]',
        mask: `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
      Code: { $: "pre code", padding: "0", color: "inherit", fill: "#clear" },
      Diff: { $: "pre.td-diff", inlinePadding: "0" },
      DiffCode: {
        $: "pre.td-diff code",
        display: "block",
        inlineSize: "max-content",
        minInlineSize: "100%",
        lineHeight: "0",
      },
      DiffLine: {
        $: "pre.td-diff > code > .line",
        display: "block",
        inlinePadding: "1rem",
        preset: "code",
      },
      EmptyDiffLine: {
        $: "pre.td-diff > code > .line:empty::before",
        content: '"\\200b"',
      },
      InsertedLine: {
        $: "pre.td-diff > code > .td-diff-line--inserted",
        fill: "#green-surface",
      },
      DeletedLine: {
        $: "pre.td-diff > code > .td-diff-line--deleted",
        fill: "#red-surface",
      },
    }),
  );
  return null;
}
