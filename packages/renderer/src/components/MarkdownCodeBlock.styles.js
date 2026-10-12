import { useGlobalStyles } from "@tenphi/tasty";
import checkIcon from "../icons/check.svg?raw";
import copyIcon from "../icons/copy.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownCodeBlockStyles() {
  useGlobalStyles(
    ".td-code-block.td-code-block",
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
        $: "> CopyButton",
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
          "copy-state=copied": "#green-text",
        },
        // Recolor only; CopyButton owns the border width and style, including theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: {
          "": null,
          "copy-state=copied": "#green",
        },
      },
      CopyIcon: {
        $: "> CopyButton > CopyIcon",
        display: "block",
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#current",
        // The imported SVG is encoded at build time and never evaluated in the browser.
        // eslint-disable-next-line tasty/no-runtime-styles-mutation
        mask: `url("${svgIconUrl(copyIcon)}") center / contain no-repeat`,
      },
      CopiedIcon: {
        $: '> CopyButton > [data-element="CopyIcon"]',
        mask: {
          "": null,
          // SVG encoding runs only during the server build.
          // eslint-disable-next-line tasty/no-runtime-styles-mutation
          "copy-state=copied": `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
        },
      },
      Code: { $: "pre code", padding: "0", color: "inherit", fill: "#clear" },
      Diff: { $: "pre", inlinePadding: { "": null, diff: "0" } },
      DiffCode: {
        $: "pre code",
        display: { "": null, diff: "block" },
        inlineSize: {
          "": null,
          diff: "100% max-content initial",
        },
        // Zero line height removes gaps between block diff lines; the tight modifier would not.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        lineHeight: { "": null, diff: "0" },
      },
      DiffLine: {
        $: "pre > code > [data-element=Line]",
        display: { "": null, diff: "block" },
        inlinePadding: {
          "": null,
          diff: "1rem",
        },
        preset: { "": null, diff: "code" },
      },
      EmptyDiffLine: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
        $: "pre > code > Line:empty::before",
        content: { "": null, diff: '"\\200b"' },
      },
      InsertedLine: {
        $: "pre > code > [data-element=Line]",
        fill: {
          "": null,
          "diff & @own(inserted)": "#green-surface",
        },
      },
      DeletedLine: {
        $: "pre > code > [data-element=Line]",
        fill: {
          "": null,
          "diff & @own(deleted)": "#red-surface",
        },
      },
    }),
  );
  return null;
}
