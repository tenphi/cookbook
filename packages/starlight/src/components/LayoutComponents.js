import { tasty } from "@tenphi/tasty";
import chevronDownIcon from "../icons/chevron-down.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import contrastIcon from "../icons/contrast.svg?raw";
import deviceIcon from "../icons/device-desktop.svg?raw";
import moonIcon from "../icons/moon.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import sunIcon from "../icons/sun.svg?raw";
import { customizeComponent } from "./customize-component.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export const LogoRoot = customizeComponent(
  "Logo",
  { as: "span" },
  tasty({
    as: "span",
    styles: {
      display: "inline-grid",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      inlineSize: "4rem",
      blockSize: "4rem",
      color: "#accent-surface",
      Svg: {
        $: "> svg",
        display: "block",
        inlineSize: "100%",
        blockSize: "100%",
      },
    },
  }),
);

export const PackageVersionRoot = customizeComponent(
  "PackageVersion",
  { as: "span" },
  tasty({
    as: "span",
    styles: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      minBlockSize: "1.5rem",
      paddingInlineStart: "($gap * 0.75)",
      paddingInlineEnd: "($gap * 0.75)",
      color: "#text-soft",
      fill: "#surface-2",
      border: true,
      radius: "999px",
      preset: "small",
      whiteSpace: "nowrap",
    },
  }),
);

export const TopNavigationRoot = customizeComponent(
  "TopNavigation",
  { as: "nav" },
  tasty({
    as: "nav",
    styles: {
      display: "flex",
      hide: { "": false, "@mobile": true },
      alignItems: "stretch",
      gap: "clamp(1.25rem, 2.5vw, 2.5rem)",
      inlineSize: "100%",
      minBlockSize: "2.5rem",
      overflowX: "auto",
      scrollbar: "none",

      Scrollbar: { $: "&::-webkit-scrollbar", hide: true },
      Link: {
        $: "a",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        flexGrow: "0",
        flexShrink: "0",
        flexBasis: "auto",
        paddingBlockStart: "($gap * 0.75)",
        paddingBlockEnd: "$gap",
        color: "#text-soft",
        preset: "navigation",
        textDecoration: "none",
        whiteSpace: "nowrap",
      },
      HoverLink: { $: "a:hover", color: "#text" },
      CurrentLink: { $: 'a[aria-current="page"]', color: "#accent-text" },
      ActiveIndicator: {
        $: 'a[aria-current="page"]::after',
        content: '""',
        position: "absolute",
        inset: "auto 0 0",
        blockSize: "2px",
        radius: "999px",
        fill: "#accent-surface",
      },
    },
  }),
);

export const StarlightHeaderRoot = customizeComponent(
  "StarlightHeader",
  { as: "div" },
  tasty({
    as: "div",
    styles: {
      display: "flex",
      flow: "column",
      inlineSize: "100%",
      maxInlineSize: "($layout-width - ($sl-sidebar-pad-x * 2))",
      blockSize: "100%",
      minInlineSize: "0",
      marginInlineStart: "auto",
      marginInlineEnd: "auto",

      Primary: {
        $: ".td-header__primary",
        display: {
          "": "grid",
          "@mobile": "flex",
        },
        gridColumns:
          "minmax(9rem, $sidebar-width) minmax(12rem, 28rem) minmax(5rem, 1fr)",
        placeItems: "center stretch",
        justifyContent: {
          "": "normal",
          "@mobile": "space-between",
        },
        flexGrow: "1",
        flexShrink: "1",
        flexBasis: "0%",
        gap: {
          "": "clamp(1rem, 2.5vw, 2.5rem)",
          "@mobile": "$gap",
        },
        minBlockSize: "0",
      },
      TitleAndSearch: {
        $: ".td-header__title, .td-header__search",
        display: "flex",
        alignItems: "center",
        minInlineSize: "0",
      },
      Title: {
        $: ".td-header__title",
        gap: "$gap",
        overflow: "hidden",
        maxInlineSize: {
          "": "none",
          "@mobile": "(100% - (($sl-menu-button-size + $sl-nav-gap) * 3))",
        },
      },
      SiteTitle: {
        $: ".site-title",
        color: "#text",
        preset: { "": "h4 / strong", "@mobile": "h5 / strong" },
      },
      Search: {
        $: ".td-header__search",
        position: { "": "static", "@mobile": "fixed" },
        zIndex: { "": "auto", "@mobile": "10" },
        inset: {
          "": "auto top",
          "@mobile": "(($sl-nav-height - $sl-menu-button-size) / 2) top",
        },
        insetInlineEnd: {
          "": "auto",
          "@mobile":
            "($sl-nav-pad-x + (($sl-menu-button-size + $sl-nav-gap) * 2))",
        },
        placeItems: { "": "normal", "@mobile": "center" },
        inlineSize: { "": "auto", "@mobile": "$sl-menu-button-size" },
        blockSize: { "": "auto", "@mobile": "$sl-menu-button-size" },
        marginInlineStart: "0",
      },
      SearchElement: {
        $: ".td-header__search site-search",
        inlineSize: "100%",
        blockSize: { "": "auto", "@mobile": "$sl-menu-button-size" },
      },
      Tools: {
        $: ".td-header__tools",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "($gap * 1.5)",
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
        position: { "": "static", "@mobile": "fixed" },
        zIndex: { "": "auto", "@mobile": "10" },
        inset: {
          "": "auto top",
          "@mobile": "(($sl-nav-height - $sl-menu-button-size) / 2) top",
        },
        insetInlineEnd: {
          "": "auto",
          "@mobile": "($sl-nav-pad-x + $sl-menu-button-size + $sl-nav-gap)",
        },
        placeItems: { "": "normal", "@mobile": "center" },
        inlineSize: { "": "auto", "@mobile": "$sl-menu-button-size" },
        blockSize: { "": "auto", "@mobile": "$sl-menu-button-size" },
      },
    },
  }),
);

export const ThemeSelectRoot = customizeComponent(
  "ThemeSelect",
  { as: "starlight-theme-select" },
  tasty({
    as: "starlight-theme-select",
    styles: {
      display: "grid",
      placeItems: "center",
      inlineSize: {
        "": "$control-height",
        "@mobile": "$sl-menu-button-size",
      },
      blockSize: {
        "": "$control-height",
        "@mobile": "$sl-menu-button-size",
      },

      Label: {
        $: "label",
        boxSizing: "border-box",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        inlineSize: "100%",
        blockSize: "100%",
        padding: "0",
        border: "0",
        fill: "#clear",
      },
      Icon: {
        $: ".label-icon",
        position: "absolute",
        zIndex: "1",
        insetInlineStart: "50%",
        inlineSize: "1rem",
        blockSize: "1rem",
        color: "#text-soft",
        translate: "-50% 0",
        pointerEvents: "none",
      },
      Select: {
        $: "select",
        appearance: "base-select",
        position: "static",
        inlineSize: "100%",
        minInlineSize: "0",
        blockSize: "100%",
        minBlockSize: "0",
        padding: "0",
        margin: "0",
        color: "#clear",
        preset: "small / strong",
        border: true,
        radius: "$radius",
        fill: {
          "": "#surface-3",
          ":hover": "#surface-3-hover",
          ":active": "#surface-3-pressed",
        },
        shadow: "none",
        cursor: "pointer",
        transition: "color 120ms ease, fill 120ms ease",
      },
      PickerIcon: { $: "select::picker-icon", hide: true },
      Picker: {
        $: "select::picker(select)",
        appearance: "base-select",
        gap: "1px",
        minInlineSize: "8rem",
        marginBlockStart: "0.5rem",
        padding: "4px",
        color: "#text",
        border: true,
        radius: "$card-radius",
        fill: "#surface-2",
        shadow: "0 0.75rem 2rem #shadow",
      },
      OpenPicker: {
        $: "select::picker(select):popover-open",
        display: "grid",
      },
      Option: {
        $: "option",
        padding: "0.625rem 0.75rem",
        color: "#text",
        preset: "small",
        radius: "$radius",
        fill: "#surface-2",
      },
      HoverOption: {
        $: "option:hover, option:focus",
        fill: "#surface-2-hover",
      },
      CheckedOption: {
        $: "option:checked",
        color: "#accent-text",
        fill: "color-mix(in oklab, #accent-surface 12%, #surface-2)",
      },
      Checkmark: {
        $: "option::checkmark",
        order: "1",
        marginInlineStart: "auto",
      },
    },
  }),
);

export const MobileNavigationTabsRoot = customizeComponent(
  "MobileNavigationTabs",
  { as: "nav" },
  tasty({
    as: "nav",
    styles: {
      display: "grid",
      hide: { "": false, "@desktop": true },
      gap: "$gap",
      marginBlockEnd: "($gap * 2)",
      paddingBlockEnd: "($gap * 2)",
      borderBlockEnd: "$border-width solid #border",
      Label: {
        $: ".td-mobile-tabs__label",
        paddingInline: "($gap * 1.25)",
        color: "#text",
        preset: "navigation",
      },
      List: {
        $: "ul",
        display: "grid",
        gridColumns: "repeat(2, minmax(0, 1fr))",
        gap: "$gap",
        padding: "0",
        margin: "0",
        listStyle: "none",
      },
      Item: { $: "li", margin: "0" },
      Link: {
        $: "a",
        display: "flex",
        alignItems: "center",
        minBlockSize: "2.25rem",
        padding: "($gap * 0.75) ($gap * 1.25)",
        color: "#text-soft",
        preset: "navigation",
        textDecoration: "none",
        radius: "$radius",
      },
      HoverLink: {
        $: "a:hover",
        color: "#text",
        fill: "#surface-2-hover",
      },
      CurrentLink: {
        $: 'a[aria-current="page"]',
        color: "#accent-text",
        fill: "color-mix(in oklab, #accent-surface 12%, #surface)",
      },
    },
  }),
);

export const MobileMenuFooterRoot = customizeComponent(
  "MobileMenuFooter",
  { as: "div" },
  tasty({
    as: "div",
    styles: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flow: "row wrap",
      gap: "($gap * 2)",
      paddingBlock: "$gap",
      borderBlockStart: "$border-width solid #border",
      Social: {
        $: ".td-mobile-preferences__social",
        display: "flex",
        hide: { "": false, ":empty": true },
        alignItems: "center",
        gap: "($gap * 2)",
        marginInlineEnd: "auto",
        paddingBlock: "($gap * 2)",
      },
    },
  }),
);

export const NavigationTreeRoot = customizeComponent(
  "NavigationTree",
  { as: "ul" },
  tasty({
    as: "ul",
    styles: {
      margin: "0",
      padding: "0",
      listStyle: "none",
      NestedList: {
        $: "ul",
        margin: "0",
        padding: "0 0 0 ($gap * 1.5)",
        listStyle: "none",
      },
      Summary: {
        $: "details > summary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "($gap * 0.9) ($gap * 1.25)",
        color: "#text",
        preset: "body / strong",
        cursor: "pointer",
        listStyle: "none",
      },
      Marker: { $: "details > summary::-webkit-details-marker", hide: true },
      SummaryIcon: {
        $: "details > summary::after",
        content: '""',
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#text-soft",
        mask: `url("${svgIconUrl(chevronDownIcon)}") center / contain no-repeat`,
      },
      ClosedSummaryIcon: {
        $: "details:not([open]) > summary::after",
        rotate: "-90deg",
      },
      Link: {
        $: "a",
        display: "block",
        padding: "($gap * 0.9) ($gap * 1.25)",
        color: "#text-soft",
        radius: "$radius",
        textDecoration: "none",
      },
      HoverLink: { $: "a:hover", color: "#text", fill: "#surface-2" },
      CurrentLink: {
        $: 'a[aria-current="page"]',
        color: "#accent-text",
        preset: "body / strong",
        fill: "color-mix(in oklab, #accent-surface 12%, #surface)",
      },
    },
  }),
);

export const StandaloneHeaderRoot = customizeComponent(
  "StandaloneHeader",
  { as: "header" },
  tasty({
    as: "header",
    styles: {
      position: "sticky",
      inset: "0 top",
      zIndex: "2",
      display: "flex",
      flow: "column",
      paddingInline: {
        "": "clamp(1.25rem, 3vw, 2rem)",
        "@shell-mobile": "1rem",
      },
      fill: "color-mix(in oklab, #surface 96%, #clear)",
      backdropFilter: "blur(12px)",
      border: { "": "0", "@desktop": "1bw bottom" },
      Primary: {
        $: ".td-shell__header-primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "($gap * 3)",
        inlineSize: "100%",
        maxInlineSize: "($layout-width - ($gap * 6))",
        minBlockSize: "4.5rem",
        marginInlineStart: "auto",
        marginInlineEnd: "auto",
      },
      Brand: {
        $: ".td-shell__brand",
        display: "flex",
        alignItems: "center",
        gap: "$gap",
        minInlineSize: "0",
      },
      BrandLink: {
        $: ".td-shell__brand > a",
        color: "#text",
        preset: "heading",
        textDecoration: "none",
      },
      Actions: {
        $: ".td-shell__actions",
        display: "flex",
        alignItems: { "": "center", "@shell-mobile": "stretch" },
        flow: { "": "row nowrap", "@shell-mobile": "row wrap" },
        gap: "$gap",
      },
      TopNavigation: {
        $: "> .td-top-tabs",
        maxInlineSize: "($layout-width - ($gap * 6))",
        marginInlineStart: "auto",
        marginInlineEnd: "auto",
      },
    },
  }),
);

export const AppearanceControlRoot = customizeComponent(
  "AppearanceControl",
  { as: "label" },
  tasty({
    as: "label",
    styles: {
      position: "relative",
      display: "grid",
      placeItems: "center",
      inlineSize: "$control-height",
      blockSize: "$control-height",
      radius: "$radius",
      fill: { "": "#surface-2", ":hover": "#surface-2-hover" },
      Select: {
        $: "select",
        position: "absolute",
        inset: "0",
        inlineSize: "100%",
        blockSize: "100%",
        padding: "0",
        border: "0",
        opacity: "0",
        cursor: "pointer",
      },
      Icon: {
        $: "&::before",
        content: '""',
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#text-soft",
        mask: {
          "": `url("${svgIconUrl(deviceIcon)}") center / contain no-repeat`,
          ':has([data-docs-theme] option[value="light"]:checked)': `url("${svgIconUrl(sunIcon)}") center / contain no-repeat`,
          ':has([data-docs-theme] option[value="dark"]:checked)': `url("${svgIconUrl(moonIcon)}") center / contain no-repeat`,
          ".td-appearance-control--contrast": `url("${svgIconUrl(contrastIcon)}") center / contain no-repeat`,
        },
        pointerEvents: "none",
      },
    },
  }),
);

export const SearchTriggerRoot = customizeComponent(
  "SearchTrigger",
  { as: "button" },
  tasty({
    as: "button",
    styles: {
      display: "inline-flex",
      alignItems: "center",
      gap: "$gap",
      paddingInline: "($gap * 1.5)",
      color: "#text",
      border: true,
      radius: "$radius",
      fill: {
        "": "#surface-2",
        ":hover": "#surface-2-hover",
        ":active": "#surface-2-pressed",
      },
      transition: "fill 120ms ease",
      Icon: {
        $: "&::before",
        content: '""',
        inlineSize: "1rem",
        blockSize: "1rem",
        flexGrow: "0",
        flexShrink: "0",
        flexBasis: "auto",
        fill: "#current",
        mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
      },
      Shortcut: {
        $: "> kbd",
        display: "flex",
        gap: "0.125rem",
        marginInlineStart: "($gap * 1.5)",
        color: "#text-soft",
        preset: "small",
        font: "$body-font-family",
      },
      Key: { $: "kbd", font: "$body-font-family" },
    },
  }),
);

export const DocsLayoutRoot = customizeComponent(
  "DocsLayout",
  { as: "div" },
  tasty({
    as: "div",
    styles: {
      display: "grid",
      gridColumns: {
        "": "minmax(13rem, $sidebar-width) minmax(0, 1fr)",
        "@shell-mobile": "1fr",
      },
      inlineSize: "min(100%, $layout-width)",
      minBlockSize: "100vh",
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
    },
  }),
);

export const DocsSidebarRoot = customizeComponent(
  "DocsSidebar",
  { as: "nav" },
  tasty({
    as: "nav",
    styles: {
      padding: {
        "": "($gap * 5) ($gap * 3)",
        "@shell-mobile": "($gap * 2) ($gap * 3)",
      },
    },
  }),
);

export const DocsArticleRoot = customizeComponent(
  "DocsArticle",
  { as: "main" },
  tasty({
    as: "main",
    styles: {
      inlineSize: "min(100%, $content-width)",
      padding: "($gap * 3) clamp(1.5rem, 5vw, 4rem) ($gap * 10)",
    },
  }),
);

export const SearchDialogRoot = customizeComponent(
  "SearchDialog",
  { as: "dialog" },
  tasty({
    as: "dialog",
    styles: {
      inlineSize: "min(42rem, calc(100% - 2rem))",
      padding: "($gap * 2.5)",
      color: "#text",
      fill: "#surface",
      border: "$border-width solid #border-strong",
      radius: "$card-radius",
      shadow: "$sl-shadow-lg",
      Backdrop: { $: "&::backdrop", fill: "#overlay" },
      Form: { $: "form", float: "inline-end" },
      LabelAndInput: {
        $: "label, input",
        display: "block",
        inlineSize: "100%",
      },
      Input: {
        $: "input",
        marginBlock: "$gap ($gap * 2)",
        paddingInline: "($gap * 1.5)",
        color: "#text",
        border: true,
        radius: "$radius",
        fill: "#surface",
      },
      Close: {
        $: 'button[aria-label="Close search"]',
        display: "grid",
        placeItems: "center",
        inlineSize: "$control-height",
        padding: "0",
        overflow: "hidden",
        color: "#clear",
        border: true,
        radius: "$radius",
        fill: {
          "": "#surface-2",
          ":hover": "#surface-2-hover",
          ":active": "#surface-2-pressed",
        },
      },
      CloseIcon: {
        $: 'button[aria-label="Close search"]::before',
        content: '""',
        inlineSize: "1rem",
        blockSize: "1rem",
        color: "#text",
        fill: "#current",
        mask: `url("${svgIconUrl(closeIcon)}") center / contain no-repeat`,
      },
    },
  }),
);

export const SkipLinkRoot = customizeComponent(
  "SkipLink",
  { as: "a" },
  tasty({
    as: "a",
    styles: {
      position: "fixed",
      inset: "$gap auto auto $gap",
      zIndex: "4",
      translate: { "": "0 -150%", ":focus": "0" },
      padding: "$gap ($gap * 1.5)",
      color: "#accent-surface-text",
      radius: "$radius",
      fill: "#accent-surface",
    },
  }),
);

export const VisuallyHiddenRoot = tasty({
  as: "span",
  styles: {
    position: "absolute",
    inlineSize: "1px",
    blockSize: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  },
});
