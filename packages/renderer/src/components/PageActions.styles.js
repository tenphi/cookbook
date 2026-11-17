import checkIcon from "../icons/check.svg?raw";
import copyIcon from "../icons/copy.svg?raw";
import downloadIcon from "../icons/download.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PageActionsRoot = defineComponent("PageActions", {
  as: "cookbook-page-actions",
  "data-element": "PageActions",
  styles: {
    display: "flex",
    flow: "row wrap",
    alignItems: "center",
    gap: "1x",
    preset: "small",
    Control: {
      $: "button, a",
      display: "inline-flex",
      alignItems: "center",
      gap: "1x",
      padding: "1x 1.5x",
      border: true,
      radius: "1r",
      color: "#text",
      fill: "#surface-2",
      preset: "small",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color, fill, border",
    },
    Hover: {
      $: "button, a",
      // Recolor only; Control owns the border width and style, including theme overrides.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: { "": null, "@own(:hover)": "#border-strong" },
      fill: {
        "": null,
        "@own(:hover)": "#surface-2-hover",
      },
    },
    Active: {
      $: "button, a",
      fill: { "": null, "@own(:active)": "#surface-2-pressed" },
    },
    Focus: {
      $: "button, a",
      outline: {
        "": null,
        "@own(:focus-visible)": "$outline-width solid #focus / $outline-offset",
      },
    },
    Pending: {
      $: "button",
      cursor: { "": null, '@own([aria-disabled="true"])': "wait" },
    },
    Status: {
      $: "*",
      color: { "": null, "@own([role=status])": "#text-soft" },
    },
    Icon: {
      $: "button::before, a::before",
      content: '""',
      display: "block",
      flexShrink: "0",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
    },
    CopyIcon: {
      $: "button::before",
      fill: { "": null, "copy-state=copied": "#green-text" },
      // The imported SVGs are encoded at build time and never evaluated in the browser.
      mask: {
        "": `url("${svgIconUrl(copyIcon)}") center / contain no-repeat`,
        "copy-state=copied": `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
    },
    DownloadIcon: {
      $: "a::before",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      mask: `url("${svgIconUrl(downloadIcon)}") center / contain no-repeat`,
    },
  },
});
