import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const FooterRoot = defineComponent("Footer", {
  as: "footer",
  "data-tasty-anatomy": "Footer",
  styles: {
    display: "flex",
    flow: "column",
    gap: "($gap * 3)",
    Meta: {
      $: ".td-footer__meta",
      display: "flex",
      flow: "row wrap",
      justifyContent: "space-between",
      gap: "($gap * 1.5) ($gap * 6)",
      blockMargin: "($gap * 6) start",
      color: "#text-muted",
      preset: "small",
    },
    LoneMetaItem: {
      $: ".td-footer__meta > :only-child",
      inlineMargin: "auto start",
    },
    MetaLink: {
      $: ".td-footer__meta a",
      display: "flex",
      alignItems: "center",
      gap: "$gap",
      color: "#text-muted",
      textDecoration: "none",
    },
    HoverMetaLink: {
      $: ".td-footer__meta a:hover",
      color: "#text",
    },
    Credit: {
      $: ".td-footer__credit",
      margin: "($gap * 3) auto",
      color: "#text",
      preset: "small",
      textAlign: "center",
    },
    CreditLink: {
      $: ".td-footer__credit a",
      color: "#accent-text",
      preset: "small / strong",
      textDecoration: "none",
    },
    HoverCreditLink: {
      $: ".td-footer__credit a:hover",
      color: "#text",
    },
  },
});
