import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";
import { Button } from "./Button.styles.js";

configureCookbookStates();

export const MobileMenuToggleRoot = customizeComponent(
  "MobileMenuToggle",
  tasty(Button, {
    "data-tasty-anatomy": "MobileMenuToggle",
    styles: {
      display: { "": "none", "@mobile": "flex" },
      inlineSize: "(100% + ($docs-nav-pad-x * 2))",
      inlineMargin: "(-1 * $docs-nav-pad-x)",
      blockSize: "3rem",
      flexShrink: "0",
      padding: "0 $docs-nav-pad-x",
      border: "0",
      blockBorder: "$border-width solid #border start",
      radius: "0",
      fill: "#clear",
      preset: "navigation",
      textAlign: "start",
      Control: { $: "&.td-menu-button", cursor: "pointer" },
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
      HoverControl: { $: "&:hover", color: "#text" },
      ActiveControl: { $: "&:active", color: "#accent-text" },
    },
  }),
);
