import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const HeaderRoot = defineComponent("Header", {
  as: "div",
  "data-element": "Header",
  styles: {
    display: "flex",
    flow: "column",
    inlineSize: "0 100% ($layout-width - ($docs-sidebar-pad-x * 2))",
    blockSize: "100%",
    inlineMargin: "auto",

    Primary: {
      display: "flex",
      alignItems: "center",
      gap: { "": "clamp(0.5rem, 1.5vw, 1.5rem)", "@mobile": "0.5rem" },
      blockSize: { "": "4.5rem", "@mobile": "3.5rem" },
      flexShrink: "0",
    },
    Title: {
      display: "flex",
      alignItems: "center",
      flow: "row",
      gap: "$gap",
      overflow: "hidden",
      flexShrink: "1",
      inlineSize: "min 0",
      inlineMargin: { "": "0 end", "@mobile": "auto end" },
    },
    LogoLink: {
      display: "inline-grid",
      flexShrink: "0",
      placeItems: "center",
      color: "#text",
      textDecoration: "none",
    },
    Logo: {
      inlineSize: { "": "2rem", "@mobile": "1.75rem" },
      blockSize: { "": "2rem", "@mobile": "1.75rem" },
    },
    SiteTitle: {
      inlineSize: "min 0",
      overflow: "hidden",
      color: "#text",
      preset: { "": "h4", "@mobile": "h5" },
      textDecoration: "none",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    Search: {
      $: '[data-element="Primary"] > [data-element="Search"]',
      display: "flex",
      alignItems: "center",
      flexGrow: { "": "1", "@mobile": "0" },
      flexShrink: { "": "1", "@mobile": "0" },
      inlineSize: { "": "min 0", "@mobile": "$docs-menu-button-size" },
      inlineMargin: { "": "auto", "@mobile": "0" },
    },
    SearchElement: {
      $: '[data-element="Search"] site-search',
      inlineSize: "0 100% 28rem",
      inlineMargin: "auto",
    },
    Tools: {
      display: "flex",
      hide: { "": false, "@mobile": true },
      flow: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "($gap * 0.5)",
    },
    Social: {
      display: "flex",
      alignItems: "center",
    },
    MobileTheme: {
      display: "grid",
      hide: { "": true, "@mobile": false },
      flexShrink: "0",
      order: "1",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
    },
    MobileLanguage: {
      display: "grid",
      hide: { "": true, "@mobile": false },
      flexShrink: "0",
      order: "1",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
    },
  },
});
