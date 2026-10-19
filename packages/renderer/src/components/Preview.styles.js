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
  "data-element": "Preview",
  styles: {
    margin: "0",
    overflow: "clip",
    color: "#text",
    border: true,
    radius: "1cr",
    fill: "#surface",
    "$resting-shadow-offset": "1px",
    "$resting-shadow-blur": "2px",
    shadow: "0 $resting-shadow-offset $resting-shadow-blur #shadow",

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
      // A scripted preview grows to fit its content (client/preview-height.ts)
      // between its minimum height and the window's height. The cap also stops
      // content sized by the frame itself, such as `100vh`, growing forever.
      height: "10rem 100vh",
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
        "@own(:hover)": "#surface-2-hover",
      },
    },
    ActiveSummary: {
      $: "> details > summary",
      fill: {
        "": null,
        "@own(:active)": "#surface-2-pressed",
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

/**
 * Render-time styles for one preview's `height` prop, a validated CSS length.
 * It replaces the minimum height and keeps the window-height cap.
 */
export function previewHeightStyles(height) {
  return { Frame: { height: `${height} 100vh` } };
}
