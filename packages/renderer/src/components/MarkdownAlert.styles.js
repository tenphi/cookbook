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
        ".cookbook-alert--note": "#blue-text",
        ".cookbook-alert--tip": "#green-text",
        ".cookbook-alert--caution": "#warning-text",
        ".cookbook-alert--danger": "#red-text",
      },
      border: {
        "": true,
        ".cookbook-alert--note": "#blue",
        ".cookbook-alert--tip": "#green",
        ".cookbook-alert--caution": "#warning",
        ".cookbook-alert--danger": "#red",
      },
      radius: "$card-radius",
      fill: {
        "": "#surface-2",
        ".cookbook-alert--note": "#blue-surface",
        ".cookbook-alert--tip": "#green-surface",
        ".cookbook-alert--caution": "#warning-surface",
        ".cookbook-alert--danger": "#red-surface",
      },
      Title: {
        $: ".cookbook-alert__title",
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
        $: ".cookbook-alert__content > *",
        blockMargin: {
          "": null,
          "@own(:is(.cookbook-alert__content > :first-child))":
            "$margin-block-start $margin-block-end",
        },
        "$margin-block-start": {
          "": null,
          "@own(:is(.cookbook-alert__content > :first-child))": "0",
        },
      },
    }),
  );
  return null;
}
