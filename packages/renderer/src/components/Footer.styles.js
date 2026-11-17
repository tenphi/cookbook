import pencilIcon from "../icons/pencil.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
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
      // Keep the edit link's focus ring around its text instead of the row's height.
      alignItems: "center",
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
      // No border; the radius rounds the shared focus ring like other controls.
      radius: "1r",
      color: { "": "#text-soft", "@own(:hover)": "#text" },
      textDecoration: "none",
      transition: "color",
    },
    MetaLinkIcon: {
      $: "MetaLink::before",
      content: '""',
      display: "block",
      flexShrink: "0",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      mask: `url("${svgIconUrl(pencilIcon)}") center / contain no-repeat`,
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
