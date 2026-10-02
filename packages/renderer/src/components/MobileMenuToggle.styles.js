import { configureCookbookStates } from "./tasty-states.js";
import { extendComponent } from "../define-component.js";
import { Button } from "./Button.styles.js";

configureCookbookStates();

export const MobileMenuToggleRoot = extendComponent(
  "MobileMenuToggle",
  Button,
  {
    "data-element": "MobileMenuToggle",
    styles: {
      color: { ":hover": "#text", ":active": "#accent-text" },
      display: { "": "none", "@mobile": "flex" },
      inlineSize: "(100% + ($docs-nav-pad-x * 2))",
      inlineMargin: "(-1 * $docs-nav-pad-x)",
      blockSize: "0 3rem initial",
      flexShrink: "0",
      padding: "0 $docs-nav-pad-x",
      border: "0",
      blockBorder: "$border-width solid #border start",
      radius: "0",
      fill: "#clear",
      preset: "navigation",
      textAlign: "start",
      Icon: {
        $: "> svg",
        flexShrink: "0",
        inlineSize: "1.125rem",
        blockSize: "1.125rem",
      },
      Section: {
        $: ".td-menu-button__section",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        inlineSize: "max 40%",
      },
      Page: {
        $: ".td-menu-button__page",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: "#text",
        preset: "navigation / strong",
      },
    },
  },
);
