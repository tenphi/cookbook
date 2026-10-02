import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const CardRoot = defineComponent("Card", {
  as: "article",
  "data-tasty-anatomy": "Card",
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
});

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
