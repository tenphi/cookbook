import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

const previewElements = {
  Caption: "figcaption",
  Stage: "div",
  Frame: "iframe",
  Code: "details",
  Summary: "summary",
  Pre: "pre",
};

export const PreviewRoot = defineComponent("Preview", {
  as: "figure",
  "data-tasty-anatomy": "Preview",
  styles: {
    margin: "0",
    overflow: "clip",
    color: "#text",
    border: true,
    radius: "1cr",
    fill: "#surface",
    shadow: "0 1px 2px #shadow",

    Caption: {
      padding: "1.5x 2x",
      preset: "small",
      fill: "#surface-2",
    },
    Stage: {
      padding: "2x",
      fill: "#surface",
    },
    Frame: {
      display: "block",
      width: "100%",
      height: "min 10rem",
      border: "0",
      fill: "#surface",
    },
    Code: {
      border: "1bw top #border",
    },
    Summary: {
      padding: "1.5x 2x",
      preset: "small",
      fill: "#surface-2",
      cursor: "pointer",
      transition: "fill $transition",
    },
    HoverSummary: {
      $: "> details > summary",
      fill: {
        "": null,
        "@own(:is(details > summary:hover))": "#surface-2-hover",
      },
    },
    ActiveSummary: {
      $: "> details > summary",
      fill: {
        "": null,
        "@own(:is(details > summary:active))": "#surface-2-pressed",
      },
    },
    Pre: {
      margin: "0",
      padding: "2x",
      overflowX: "auto",
      color: "#syntax-text",
      fill: "#syntax-bg",
      preset: "code",
      radius: "0",
    },
  },
  elements: previewElements,
});
