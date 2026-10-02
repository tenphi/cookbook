import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CalloutRoot = defineComponent("Callout", {
  as: "aside",
  "data-element": "Callout",
  styles: {
    "#callout-border": {
      "": "#info",
      '[data-kind="tip"]': "#success",
      '[data-kind="caution"]': "#warning",
      '[data-kind="danger"]': "#danger",
    },
    "#callout-text": {
      "": "#info-text",
      '[data-kind="tip"]': "#success-text",
      '[data-kind="caution"]': "#warning-text",
      '[data-kind="danger"]': "#danger-text",
    },
    "#callout-surface": {
      "": "#info-surface",
      '[data-kind="tip"]': "#success-surface",
      '[data-kind="caution"]': "#warning-surface",
      '[data-kind="danger"]': "#danger-surface",
    },
    "$margin-block-start": "2x",
    "$margin-block-end": "2x",
    blockMargin: "$margin-block-start $margin-block-end",
    inlineMargin: "0",
    padding: "2x 3x",
    border: "1bw #callout-border",
    radius: "1cr",
    fill: "#callout-surface",
    color: "#text",
    Title: {
      preset: "body / strong",
      color: "#callout-text",
      "$margin-block-start": "0",
      "$margin-block-end": "1x",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
    Body: {
      color: "#text",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
  },
  elements: { Title: "p", Body: "div" },
});
