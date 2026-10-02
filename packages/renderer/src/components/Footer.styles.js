import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const FooterRoot = defineComponent("Footer", {
  as: "footer",
  "data-element": "Footer",
  styles: {
    display: "flex",
    flow: "column",
    gap: "($gap * 3)",
    Meta: {
      display: "flex",
      flow: "row wrap",
      justifyContent: "space-between",
      gap: "($gap * 1.5) ($gap * 6)",
      blockMargin: "($gap * 6) start",
      color: "#text-muted",
      preset: "small",
    },
    MetaLink: {
      display: "flex",
      alignItems: "center",
      gap: "$gap",
      inlineMargin: { "": "0", "@own(:only-child)": "auto start" },
      color: { "": "#text-muted", "@own(:hover)": "#text" },
      textDecoration: "none",
    },
    MetaUpdated: {
      inlineMargin: { "": "0", "@own(:only-child)": "auto start" },
    },
    Credit: {
      margin: "($gap * 3) auto",
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
