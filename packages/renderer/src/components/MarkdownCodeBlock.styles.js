import { useGlobalStyles } from "@tenphi/tasty";
import checkIcon from "../icons/check.svg?raw";
import copyIcon from "../icons/copy.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownCodeBlockStyles() {
  useGlobalStyles(
    ':is(.cookbook-markdown-content .td-code-block, .td-code-block[data-element="MarkdownCodeBlock"])',
    resolveComponentStyles("MarkdownCodeBlock", {
      "$copy-button-size": "2rem",
      display: "block",
      position: "relative",
      inlineSize: "min 0",
      Pre: {
        $: "> pre",
        "$margin-block-start": "0",
        "$margin-block-end": "0",
        blockMargin: "$margin-block-start $margin-block-end",
        inlineMargin: "0",
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
        $: '> [data-element="CopyButton"]',
        position: "absolute",
        zIndex: "1",
        blockInset: "$gap start",
        inlineInset: "$gap end",
        "$margin-block-start": "0",
        "$margin-block-end": "0",
        blockMargin: "$margin-block-start $margin-block-end",
        inlineMargin: "0",
        display: "grid",
        placeItems: "center",
        inlineSize: "$copy-button-size $copy-button-size initial",
        blockSize: "$copy-button-size $copy-button-size initial",
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
        $: '> [data-element="CopyButton"]',
        color: { "": null, "@own(:hover)": "#text" },
        fill: {
          "": null,
          "@own(:hover)": "#surface-2-hover",
        },
      },
      CopiedButton: {
        $: '> [data-element="CopyButton"]',
        color: {
          "": null,
          '@own([data-copy-state="copied"])': "#green-text",
        },
        // Recolor only; CopyButton owns the border width and style, including theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: {
          "": null,
          '@own([data-copy-state="copied"])': "#green",
        },
      },
      CopyIcon: {
        $: '> [data-element="CopyButton"] > [data-element="CopyIcon"]',
        display: "block",
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#current",
        // The imported SVG is encoded at build time and never evaluated in the browser.
        // eslint-disable-next-line tasty/no-runtime-styles-mutation
        mask: `url("${svgIconUrl(copyIcon)}") center / contain no-repeat`,
      },
      CopiedIcon: {
        $: '> [data-element="CopyButton"] > [data-element="CopyIcon"]',
        mask: {
          "": null,
          // SVG encoding runs only during the server build.
          // eslint-disable-next-line tasty/no-runtime-styles-mutation
          '@own(:is([data-element="CopyButton"][data-copy-state="copied"] > [data-element="CopyIcon"]))': `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
        },
      },
      Code: { $: "pre code", padding: "0", color: "inherit", fill: "#clear" },
      Diff: { $: "pre.td-diff", inlinePadding: "0" },
      DiffCode: {
        $: "pre.td-diff code",
        display: "block",
        inlineSize: "100% max-content initial",
        // Zero line height removes gaps between block diff lines; the tight modifier would not.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        lineHeight: "0",
      },
      DiffLine: {
        $: "pre.td-diff > code > :is(.line)",
        display: "block",
        inlinePadding: "1rem",
        preset: "code",
      },
      EmptyDiffLine: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
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
