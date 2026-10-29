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
      gap: { "": "clamp(0.5rem, 1.5vw, 1.5rem)", "!@md": "0.5rem" },
      blockSize: { "": "4.5rem", "!@md": "3.5rem" },
      flexShrink: "0",
    },
    Title: {
      display: "flex",
      alignItems: "center",
      flow: "row",
      gap: "1x",
      overflow: "hidden",
      flexShrink: "1",
      inlineSize: "min 0",
      inlineMargin: { "": "0 end", "!@md": "auto end" },
    },
    LogoLink: {
      display: "inline-grid",
      flexShrink: "0",
      placeItems: "center",
      color: "#text",
      textDecoration: "none",
    },
    Logo: {
      inlineSize: { "": "2rem", "!@md": "1.75rem" },
      blockSize: { "": "2rem", "!@md": "1.75rem" },
    },
    SiteTitle: {
      inlineSize: "min 0",
      overflow: "hidden",
      color: "#text",
      preset: { "": "h4", "!@md": "h5" },
      textDecoration: "none",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    Search: {
      $: "Primary > Search",
      display: "flex",
      alignItems: "center",
      flexGrow: { "": "1", "!@md": "0" },
      flexShrink: { "": "1", "!@md": "0" },
      inlineSize: { "": "min 0", "!@md": "$docs-menu-button-size" },
      inlineMargin: { "": "auto", "!@md": "0" },
    },
    SearchElement: {
      $: "Search cookbook-search",
      inlineSize: "0 100% 28rem",
      inlineMargin: "auto",
    },
    Tools: {
      display: "flex",
      hide: { "": false, "!@md": true },
      flow: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "0.5x",
    },
    Social: {
      display: "flex",
      alignItems: "center",
    },
    MobileTheme: {
      display: "grid",
      hide: { "": true, "!@md": false },
      flexShrink: "0",
      order: "1",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
    },
    MobileLanguage: {
      display: "grid",
      hide: { "": true, "!@md": false },
      flexShrink: "0",
      order: "1",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
    },
  },
});
