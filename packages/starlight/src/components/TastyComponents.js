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
      transition: "fill $transition, shadow $transition, translate $transition",

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
        preset: "strong",
      },
    },
  }),
);

export const TabsRoot = customizeComponent(
  "Tabs",
  tasty({
    as: "div",
    styles: {
      margin: "2x 0",
      border: true,
      radius: "1cr",
      overflow: "clip",
      fill: "#surface",
      List: {
        padding: "1x",
        display: "flex",
        gap: "1x",
        overflow: "auto",
        fill: "#surface-2",
      },
      Button: {
        $: "> [data-tabs-list] > button",
        margin: "0",
        preset: "navigation",
        padding: "1x 2x",
        border: "0",
        radius: "1r",
        color: "#text",
        fill: "#clear",
        cursor: "pointer",
        whiteSpace: "nowrap",
      },
      SelectedButton: {
        $: '> [data-tabs-list] > button[aria-selected="true"]',
        color: "#accent-surface-text",
        fill: "#accent-surface",
      },
      FocusedButton: {
        $: "> [data-tabs-list] > button:focus-visible",
        outline: "2px #focus / -2px",
      },
    },
    elements: { List: "div" },
  }),
);

export const TabRoot = customizeComponent(
  "Tab",
  tasty({
    as: "section",
    styles: {
      margin: "0",
      padding: "2x",
      Heading: { margin: "0 0 1x", preset: "h3" },
      Hidden: { $: "&[hidden]", hide: true },
      HiddenHeading: { $: "> [data-tab-heading][hidden]", hide: true },
    },
    elements: { Heading: "h3" },
  }),
);

export const CalloutRoot = customizeComponent(
  "Callout",
  tasty({
    as: "aside",
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

export const CodeGroupRoot = customizeComponent(
  "CodeGroup",
  tasty({
    as: "div",
    styles: {
      Caption: { preset: "small", color: "#text-soft", margin: "0 0 1x" },
      Pre: {
        margin: "0",
        padding: "2x",
        overflow: "auto",
        fill: "#surface-2",
        radius: "1r",
      },
      Code: { preset: "code", color: "#text", whiteSpace: "pre" },
    },
    elements: { Caption: "p", Pre: "pre", Code: "code" },
  }),
);
