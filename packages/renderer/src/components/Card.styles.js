import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CardRoot = defineComponent("Card", {
  as: "article",
  "data-element": "Card",
  "data-block": "",
  styles: {
    display: "grid",
    gap: "1.5x",
    padding: "2.5x",
    color: "#text",
    textDecoration: "none",
    border: true,
    radius: "1cr",
    fill: {
      "": "#surface-2",
      ":any-link & :hover": "#surface-2-hover",
      ":any-link & :active": "#surface-2-pressed",
    },
    "$resting-shadow-offset": "1px",
    "$resting-shadow-blur": "2px",
    shadow: {
      "": "0 $resting-shadow-offset $resting-shadow-blur #shadow",
      ":any-link & :hover": "0 .75x 2x #shadow",
    },
    "$hover-offset": "-1px",
    translate: {
      "": "0",
      ":any-link & :hover": "0 $hover-offset",
      ":any-link & :active": "0",
    },
    transition: "fill, shadow, translate",

    Heading2: {
      $: "h2",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
    Heading3: {
      $: "h3",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
    Paragraph: {
      $: "p",
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockMargin: "$margin-block-start $margin-block-end",
      inlineMargin: "0",
    },
  },
});
