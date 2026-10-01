import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const HeaderRoot = customizeComponent(
  "Header",
  tasty({
    as: "div",
    "data-tasty-anatomy": "Header",
    styles: {
      display: "flex",
      flow: "column",
      inlineSize: "0 100% ($layout-width - ($docs-sidebar-pad-x * 2))",
      blockSize: "100%",
      inlineMargin: "auto",

      Primary: {
        $: ".td-header__primary",
        display: "flex",
        alignItems: "center",
        gap: { "": "clamp(0.5rem, 1.5vw, 1.5rem)", "@mobile": "0.5rem" },
        blockSize: { "": "4.5rem", "@mobile": "3.5rem" },
        flexShrink: "0",
      },
      TitleAndSearch: {
        $: ".td-header__title, .td-header__search",
        display: "flex",
        alignItems: "center",
        inlineSize: "min 0",
      },
      Title: {
        $: ".td-header__title",
        display: "flex",
        flow: "row",
        gap: "$gap",
        overflow: "hidden",
        flexShrink: "1",
        inlineSize: "min 0",
        inlineMargin: { "": "0 end", "@mobile": "auto end" },
      },
      LogoLink: {
        $: ".td-header__logo-link",
        display: "inline-grid",
        flexShrink: "0",
        placeItems: "center",
        color: "#text",
        textDecoration: "none",
      },
      Logo: {
        $: '.td-header__logo[data-tasty-anatomy="Logo"]',
        inlineSize: {
          "": "2rem",
          "@mobile": "1.75rem",
        },
        blockSize: {
          "": "2rem",
          "@mobile": "1.75rem",
        },
      },
      SiteTitle: {
        $: ".site-title",
        inlineSize: "min 0",
        overflow: "hidden",
        color: "#text",
        preset: { "": "h4", "@mobile": "h5" },
        textDecoration: "none",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      },
      Search: {
        $: ".td-header__search",
        flexGrow: { "": "1", "@mobile": "0" },
        flexShrink: { "": "1", "@mobile": "0" },
        inlineSize: { "": "min 8rem", "@mobile": "$docs-menu-button-size" },
        inlineMargin: { "": "auto", "@mobile": "0" },
      },
      SearchElement: {
        $: ".td-header__search site-search",
        inlineSize: "0 100% 28rem",
        inlineMargin: "auto",
      },
      Tools: {
        $: ".td-header__tools",
        display: "flex",
        hide: { "": false, "@mobile": true },
        flow: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "($gap * 0.5)",
      },
      ToolItem: {
        $: ".td-header__tools > *",
        margin: "0",
      },
      Social: {
        $: ".td-header__social",
        display: "flex",
        alignItems: "center",
      },
      MobileTheme: {
        $: ".td-header__mobile-theme",
        display: "grid",
        hide: { "": true, "@mobile": false },
        flexShrink: "0",
        order: "1",
        inlineSize: "$docs-menu-button-size",
        blockSize: "$docs-menu-button-size",
      },
      MobileLanguage: {
        $: ".td-header__mobile-language",
        display: "grid",
        hide: { "": true, "@mobile": false },
        flexShrink: "0",
        order: "1",
        inlineSize: "$docs-menu-button-size",
        blockSize: "$docs-menu-button-size",
      },
    },
  }),
);
