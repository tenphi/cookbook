import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownAlertStyles() {
  useGlobalStyles(
    ".cookbook-alert",
    resolveComponentStyles("MarkdownAlert", {
      padding: "($gap * 2) ($gap * 2.5)",
      color: {
        "": "#text-soft",
        "[data-note]": "#blue-text",
        "[data-tip]": "#green-text",
        "[data-caution]": "#warning-text",
        "[data-danger]": "#red-text",
      },
      border: {
        "": true,
        "[data-note]": "#blue",
        "[data-tip]": "#green",
        "[data-caution]": "#warning",
        "[data-danger]": "#red",
      },
      radius: "$card-radius",
      fill: {
        "": "#surface-2",
        "[data-note]": "#blue-surface",
        "[data-tip]": "#green-surface",
        "[data-caution]": "#warning-surface",
        "[data-danger]": "#red-surface",
      },
      Title: {
        $: "Title",
        display: "flex",
        alignItems: "center",
        gap: "$gap",
        "$margin-block-start": "0",
        "$margin-block-end": "$gap",
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
