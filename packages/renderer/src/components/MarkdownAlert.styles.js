import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownAlertStyles() {
  useGlobalStyles(
    ".cookbook-alert",
    resolveComponentStyles("MarkdownAlert", {
      padding: "($gap * 2) ($gap * 2.5)",
      color: "#text-soft",
      border: true,
      radius: "$card-radius",
      fill: "#surface-2",
      Note: {
        $: "&.cookbook-alert--note",
        fill: "#blue-surface",
        color: "#blue-text",
        border: "#blue",
      },
      Tip: {
        $: "&.cookbook-alert--tip",
        fill: "#green-surface",
        color: "#green-text",
        border: "#green",
      },
      Caution: {
        $: "&.cookbook-alert--caution",
        fill: "#warning-surface",
        color: "#warning-text",
        border: "#warning",
      },
      Danger: {
        $: "&.cookbook-alert--danger",
        fill: "#red-surface",
        color: "#red-text",
        border: "#red",
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
