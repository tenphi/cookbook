import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export const CardRoot = customizeComponent(
  "Card",
  tasty({
    as: "article",
    styles: {
      display: "grid",
      gap: "1.5x",
      padding: "2.5x",
      color: "#text",
      textDecoration: "none",
      border: true,
      radius: "1cr",
      fill: "#surface-2",
      shadow: "0 1px 2px #shadow",
      transition: "fill 120ms ease, shadow 120ms ease, translate 120ms ease",

      Heading2: {
        $: "h2",
        margin: "0",
      },
      Heading3: {
        $: "h3",
        margin: "0",
      },
      Paragraph: {
        $: "p",
        margin: "0",
      },
    },
  }),
);

export const CardLink = tasty(CardRoot, {
  as: "a",
  styles: {
    fill: {
      "": "#surface-2",
      ":hover": "#surface-2-hover",
      ":active": "#surface-2-pressed",
    },
    shadow: {
      "": "0 1px 2px #shadow",
      ":hover": "0 .75x 2x #shadow",
    },
    translate: {
      "": "0",
      ":hover": "0 -1px",
      ":active": "0",
    },
  },
});

const previewElements = {
  Caption: "figcaption",
  Stage: "div",
  Frame: "iframe",
  Code: "details",
  Summary: "summary",
  Pre: "pre",
};

export const PreviewRoot = customizeComponent(
  "Preview",
  tasty({
    as: "figure",
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
        padding: "3x",
        fill: "#surface",
      },
      Frame: {
        display: "block",
        width: "100%",
        height: "min 18rem",
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
      },
      Pre: {
        margin: "0",
        radius: "0",
      },
    },
    elements: previewElements,
  }),
);

export const StepsRoot = customizeComponent(
  "Steps",
  tasty({
    as: "ol",
    styles: {
      display: "grid",
      gap: "2x",
      padding: "4x left",
      border: "1bw left #border",

      Item: {
        $: "> li",
        padding: "1x left",
      },
      Marker: {
        $: "> li::marker",
        color: "#accent-text",
        preset: "bold",
      },
    },
  }),
);

export const TabsRoot = customizeComponent(
  "Tabs",
  tasty({
    as: "div",
    styles: {
      display: "flex",
      flow: "row wrap",
      gap: "1x",
      padding: "1x",
      border: true,
      radius: "1cr",
      fill: "#surface-2",
    },
  }),
);
