import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CalloutRoot = defineComponent("Callout", {
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
      $: "&:where(*)",
      "#callout-border": { "": null, '[data-kind="tip"]': "#success" },
      "#callout-text": { "": null, '[data-kind="tip"]': "#success-text" },
      "#callout-surface": { "": null, '[data-kind="tip"]': "#success-surface" },
    },
    Caution: {
      $: "&:where(*)",
      "#callout-border": { "": null, '[data-kind="caution"]': "#warning" },
      "#callout-text": { "": null, '[data-kind="caution"]': "#warning-text" },
      "#callout-surface": {
        "": null,
        '[data-kind="caution"]': "#warning-surface",
      },
    },
    Danger: {
      $: "&:where(*)",
      "#callout-border": { "": null, '[data-kind="danger"]': "#danger" },
      "#callout-text": { "": null, '[data-kind="danger"]': "#danger-text" },
      "#callout-surface": {
        "": null,
        '[data-kind="danger"]': "#danger-surface",
      },
    },
  },
  elements: { Title: "p", Body: "div" },
});
