import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownAlertStyles() {
  useGlobalStyles(
    ".cookbook-alert",
    resolveComponentStyles("MarkdownAlert", {
      padding: "2x 2.5x",
      color: {
        "": "#text-soft",
        "[data-note]": "#info-text",
        "[data-tip]": "#success-text",
        "[data-caution]": "#warning-text",
        "[data-danger]": "#danger-text",
      },
      border: {
        "": true,
        "[data-note]": "#info",
        "[data-tip]": "#success",
        "[data-caution]": "#warning",
        "[data-danger]": "#danger",
      },
      radius: "1cr",
      fill: {
        "": "#surface-2",
        "[data-note]": "#info-surface",
        "[data-tip]": "#success-surface",
        "[data-caution]": "#warning-surface",
        "[data-danger]": "#danger-surface",
      },
      Title: {
        $: "Title",
        display: "flex",
        alignItems: "center",
        gap: "1x",
        "$margin-block-start": "0",
        "$margin-block-end": "1x",
        blockMargin: "$margin-block-start $margin-block-end",
        inlineMargin: "0",
        color: "inherit",
        preset: "strong",
      },
      FirstContent: {
        $: "Content > *",
        blockMargin: {
          "": null,
          "@own(:first-child)": "$margin-block-start $margin-block-end",
        },
        "$margin-block-start": {
          "": null,
          "@own(:first-child)": "0",
        },
      },
    }),
  );
  return null;
}
