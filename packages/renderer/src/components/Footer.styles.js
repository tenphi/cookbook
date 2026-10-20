import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const FooterRoot = defineComponent("Footer", {
  as: "footer",
  "data-element": "Footer",
  styles: {
    display: "flex",
    flow: "column",
    gap: "3x",
    Meta: {
      display: "flex",
      flow: "row wrap",
      justifyContent: "space-between",
      gap: "1.5x 6x",
      blockMargin: "6x start",
      color: "#text-muted",
      preset: "small",
    },
    MetaLink: {
      display: "flex",
      alignItems: "center",
      gap: "1x",
      inlineMargin: { "": "0", "@own(:only-child)": "auto start" },
      color: { "": "#text-muted", "@own(:hover)": "#text" },
      textDecoration: "none",
    },
    MetaUpdated: {
      inlineMargin: { "": "0", "@own(:only-child)": "auto start" },
    },
    Credit: {
      margin: "3x auto",
      color: "#text",
      preset: "small",
      textAlign: "center",
    },
    CreditLink: {
      color: { "": "#accent-text", "@own(:hover)": "#text" },
      preset: "small / strong",
      textDecoration: "none",
    },
  },
});
