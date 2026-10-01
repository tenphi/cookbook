import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const CalloutRoot = customizeComponent(
  "Callout",
  tasty({
    as: "aside",
    "data-tasty-anatomy": "Callout",
    styles: {
      "#callout-border": "#info",
      "#callout-text": "#info-text",
      "#callout-surface": "#info-surface",
      margin: "2x 0",
      padding: "2x 3x",
      border: "1bw #callout-border",
      radius: "1cr",
      fill: "#callout-surface",
      color: "#text",
      Title: {
        preset: "body / strong",
        color: "#callout-text",
        margin: "0 0 1x",
      },
      Body: { color: "#text", margin: "0" },
      Tip: {
        $: '&[data-kind="tip"]',
        "#callout-border": "#success",
        "#callout-text": "#success-text",
        "#callout-surface": "#success-surface",
      },
      Caution: {
        $: '&[data-kind="caution"]',
        "#callout-border": "#warning",
        "#callout-text": "#warning-text",
        "#callout-surface": "#warning-surface",
      },
      Danger: {
        $: '&[data-kind="danger"]',
        "#callout-border": "#danger",
        "#callout-text": "#danger-text",
        "#callout-surface": "#danger-surface",
      },
    },
    elements: { Title: "p", Body: "div" },
  }),
);
