import { tasty } from "@tenphi/tasty";
import chevronDownIcon from "../icons/chevron-down.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import contrastIcon from "../icons/contrast.svg?raw";
import deviceIcon from "../icons/device-desktop.svg?raw";
import moonIcon from "../icons/moon.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import sunIcon from "../icons/sun.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";

export const LogoRoot = tasty({
  as: "span",
  styles: resolveComponentStyles("Logo", {
    display: "inline-grid",
    flex: "0 0 auto",
    inlineSize: "4rem",
    blockSize: "4rem",
    color: "#accent-surface",
    lineHeight: "0",
    Svg: {
      $: "> svg",
      display: "block",
      inlineSize: "100%",
      blockSize: "100%",
    },
  }),
});

export const PackageVersionRoot = tasty({
  as: "span",
  styles: resolveComponentStyles("PackageVersion", {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: "0",
    minBlockSize: "1.5rem",
    paddingInlineStart: "($gap * 0.75)",
    paddingInlineEnd: "($gap * 0.75)",
    color: "#text-soft",
    fill: "#surface-2",
    border: "$border-width solid #border",
    radius: "999px",
    preset: "small",
    whiteSpace: "nowrap",
  }),
});

export const TopNavigationRoot = tasty({
  as: "nav",
  styles: resolveComponentStyles("TopNavigation", {
    display: {
      "": "flex",
      "@media(max-width: 49.99rem)": "none",
    },
    alignItems: "stretch",
    rowGap: "clamp(1.25rem, 2.5vw, 2.5rem)",
    columnGap: "clamp(1.25rem, 2.5vw, 2.5rem)",
    inlineSize: "100%",
    minBlockSize: "2.5rem",
    overflowX: "auto",
    scrollbarWidth: "none",

    Scrollbar: { $: "&::-webkit-scrollbar", hide: true },
    Link: {
      $: "a",
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      flex: "0 0 auto",
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
  }),
});

export const StarlightHeaderRoot = tasty({
  as: "div",
  styles: resolveComponentStyles("StarlightHeader", {
    display: "flex",
    flexDirection: "column",
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
        "@media(max-width: 49.99rem)": "flex",
      },
      gridTemplateColumns:
        "minmax(9rem, $sidebar-width) minmax(12rem, 28rem) minmax(5rem, 1fr)",
      placeItems: "center stretch",
      justifyContent: {
        "@media(max-width: 49.99rem)": "space-between",
      },
      flex: "1 1 0%",
      rowGap: {
        "": "clamp(1rem, 2.5vw, 2.5rem)",
        "@media(max-width: 49.99rem)": "$gap",
      },
      columnGap: {
        "": "clamp(1rem, 2.5vw, 2.5rem)",
        "@media(max-width: 49.99rem)": "$gap",
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
      columnGap: "$gap",
      overflow: "hidden",
      maxInlineSize: {
        "@media(max-width: 49.99rem)":
          "(100% - (($sl-menu-button-size + $sl-nav-gap) * 3))",
      },
    },
    SiteTitle: {
      $: ".site-title",
      color: "#text",
      fontWeight: "$heading-bold-font-weight",
      letterSpacing: "$heading-letter-spacing",
      fontSize: { "@media(max-width: 49.99rem)": "1.125rem" },
      lineHeight: { "@media(max-width: 49.99rem)": "1.5rem" },
    },
    Search: {
      $: ".td-header__search",
      position: { "@media(max-width: 49.99rem)": "fixed" },
      zIndex: { "@media(max-width: 49.99rem)": "10" },
      top: {
        "@media(max-width: 49.99rem)":
          "(($sl-nav-height - $sl-menu-button-size) / 2)",
      },
      insetInlineEnd: {
        "@media(max-width: 49.99rem)":
          "($sl-nav-pad-x + (($sl-menu-button-size + $sl-nav-gap) * 2))",
      },
      placeItems: { "@media(max-width: 49.99rem)": "center" },
      inlineSize: { "@media(max-width: 49.99rem)": "$sl-menu-button-size" },
      blockSize: { "@media(max-width: 49.99rem)": "$sl-menu-button-size" },
      marginInlineStart: { "@media(max-width: 49.99rem)": "0" },
    },
    SearchElement: {
      $: ".td-header__search site-search",
      inlineSize: "100%",
      blockSize: { "@media(max-width: 49.99rem)": "$sl-menu-button-size" },
    },
    Tools: {
      $: ".td-header__tools",
      alignItems: "center",
      justifyContent: "flex-end",
      rowGap: "($gap * 1.5)",
      columnGap: "($gap * 1.5)",
    },
    Social: {
      $: ".td-header__social",
      display: "flex",
      alignItems: "center",
    },
    MobileTheme: {
      $: ".td-header__mobile-theme",
      display: { "@media(max-width: 49.99rem)": "grid" },
      position: { "@media(max-width: 49.99rem)": "fixed" },
      zIndex: { "@media(max-width: 49.99rem)": "10" },
      top: {
        "@media(max-width: 49.99rem)":
          "(($sl-nav-height - $sl-menu-button-size) / 2)",
      },
      insetInlineEnd: {
        "@media(max-width: 49.99rem)":
          "($sl-nav-pad-x + $sl-menu-button-size + $sl-nav-gap)",
      },
      placeItems: { "@media(max-width: 49.99rem)": "center" },
      inlineSize: { "@media(max-width: 49.99rem)": "$sl-menu-button-size" },
      blockSize: { "@media(max-width: 49.99rem)": "$sl-menu-button-size" },
    },
  }),
});

export const ThemeSelectRoot = tasty({
  as: "starlight-theme-select",
  styles: resolveComponentStyles("ThemeSelect", {
    display: "grid",
    placeItems: "center",
    inlineSize: {
      "": "$control-height",
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    blockSize: {
      "": "$control-height",
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    lineHeight: "0",

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
      fontSize: "0",
      fontWeight: "$body-bold-font-weight",
      border: "$border-width solid #border",
      radius: "$radius",
      fill: {
        "": "#surface-3",
        ":hover": "#surface-3-hover",
        ":active": "#surface-3-pressed",
      },
      boxShadow: "none",
      cursor: "pointer",
      transition: "color 120ms ease, background-color 120ms ease",
    },
    PickerIcon: { $: "select::picker-icon", hide: true },
    Picker: {
      $: "select::picker(select)",
      appearance: "base-select",
      rowGap: "1px",
      minInlineSize: "8rem",
      marginBlockStart: "0.5rem",
      padding: "4px",
      color: "#text",
      border: "$border-width solid #border",
      radius: "$card-radius",
      fill: "#surface-2",
      boxShadow: "0 0.75rem 2rem #shadow",
    },
    OpenPicker: {
      $: "select::picker(select):popover-open",
      display: "grid",
    },
    Option: {
      $: "option",
      padding: "0.625rem 0.75rem",
      color: "#text",
      fontSize: "$small-font-size",
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
  }),
});

export const MobileNavigationTabsRoot = tasty({
  as: "nav",
  styles: resolveComponentStyles("MobileNavigationTabs", {
    display: {
      "": "grid",
      "@media(min-width: 50rem)": "none",
    },
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
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
  }),
});

export const MobileMenuFooterRoot = tasty({
  as: "div",
  styles: resolveComponentStyles("MobileMenuFooter", {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "($gap * 2)",
    paddingBlock: "$gap",
    borderBlockStart: "$border-width solid #border",
    Social: {
      $: ".td-mobile-preferences__social",
      display: { "": "flex", ":empty": "none" },
      alignItems: "center",
      gap: "($gap * 2)",
      marginInlineEnd: "auto",
      paddingBlock: "($gap * 2)",
    },
  }),
});

export const NavigationTreeRoot = tasty({
  as: "ul",
  styles: resolveComponentStyles("NavigationTree", {
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
      fontWeight: "$body-bold-font-weight",
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
      fontWeight: "$body-bold-font-weight",
      fill: "color-mix(in oklab, #accent-surface 12%, #surface)",
    },
  }),
});

export const StandaloneHeaderRoot = tasty({
  as: "header",
  styles: resolveComponentStyles("StandaloneHeader", {
    position: "sticky",
    top: "0",
    zIndex: "2",
    display: "flex",
    flexDirection: "column",
    paddingInline: {
      "": "clamp(1.25rem, 3vw, 2rem)",
      "@media(max-width: 48rem)": "1rem",
    },
    fill: "color-mix(in oklab, #surface 96%, #clear)",
    backdropFilter: "blur(12px)",
    borderBottom: { "@media(min-width: 50rem)": "$border-width solid #border" },
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
      columnGap: "$gap",
      minInlineSize: "0",
    },
    BrandLink: {
      $: ".td-shell__brand > a",
      color: "#text",
      fontFamily: "$heading-font-family",
      fontWeight: "$heading-font-weight",
      textDecoration: "none",
    },
    Actions: {
      $: ".td-shell__actions",
      display: "flex",
      alignItems: { "": "center", "@media(max-width: 48rem)": "stretch" },
      flexWrap: { "@media(max-width: 48rem)": "wrap" },
      gap: "$gap",
    },
    TopNavigation: {
      $: "> .td-top-tabs",
      maxInlineSize: "($layout-width - ($gap * 6))",
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
    },
  }),
});

export const AppearanceControlRoot = tasty({
  as: "label",
  styles: resolveComponentStyles("AppearanceControl", {
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
  }),
});

export const SearchTriggerRoot = tasty({
  as: "button",
  styles: resolveComponentStyles("SearchTrigger", {
    display: "inline-flex",
    alignItems: "center",
    gap: "$gap",
    paddingInline: "($gap * 1.5)",
    color: "#text",
    border: "$border-width solid #border",
    radius: "$radius",
    fill: {
      "": "#surface-2",
      ":hover": "#surface-2-hover",
      ":active": "#surface-2-pressed",
    },
    transition: "background-color 120ms ease",
    Icon: {
      $: "&::before",
      content: '""',
      inlineSize: "1rem",
      blockSize: "1rem",
      flex: "0 0 auto",
      fill: "currentColor",
      mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
    },
    Shortcut: {
      $: "> kbd",
      display: "flex",
      gap: "0.125rem",
      marginInlineStart: "($gap * 1.5)",
      color: "#text-soft",
      fontSize: "0.75rem",
      fontWeight: "500",
      fontFamily: "$body-font-family",
    },
    Key: { $: "kbd", fontFamily: "$body-font-family" },
  }),
});

export const DocsLayoutRoot = tasty({
  as: "div",
  styles: resolveComponentStyles("DocsLayout", {
    display: "grid",
    gridTemplateColumns: {
      "": "minmax(13rem, $sidebar-width) minmax(0, 1fr)",
      "@media(max-width: 48rem)": "1fr",
    },
    inlineSize: "min(100%, $layout-width)",
    minBlockSize: "100vh",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
  }),
});

export const DocsSidebarRoot = tasty({
  as: "nav",
  styles: resolveComponentStyles("DocsSidebar", {
    padding: {
      "": "($gap * 5) ($gap * 3)",
      "@media(max-width: 48rem)": "($gap * 2) ($gap * 3)",
    },
  }),
});

export const DocsArticleRoot = tasty({
  as: "main",
  styles: resolveComponentStyles("DocsArticle", {
    inlineSize: "min(100%, $content-width)",
    padding: "($gap * 3) clamp(1.5rem, 5vw, 4rem) ($gap * 10)",
  }),
});

export const SearchDialogRoot = tasty({
  as: "dialog",
  styles: resolveComponentStyles("SearchDialog", {
    inlineSize: "min(42rem, calc(100% - 2rem))",
    padding: "($gap * 2.5)",
    color: "#text",
    fill: "#surface",
    border: "$border-width solid #border-strong",
    radius: "$card-radius",
    boxShadow: "$sl-shadow-lg",
    Backdrop: { $: "&::backdrop", fill: "#overlay" },
    Form: { $: "form", float: "inline-end" },
    LabelAndInput: { $: "label, input", display: "block", inlineSize: "100%" },
    Input: {
      $: "input",
      marginBlock: "$gap ($gap * 2)",
      paddingInline: "($gap * 1.5)",
      color: "#text",
      border: "$border-width solid #border",
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
      border: "$border-width solid #border",
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
      fill: "currentColor",
      mask: `url("${svgIconUrl(closeIcon)}") center / contain no-repeat`,
    },
  }),
});

export const SkipLinkRoot = tasty({
  as: "a",
  styles: resolveComponentStyles("SkipLink", {
    position: "fixed",
    inset: "$gap auto auto $gap",
    zIndex: "4",
    translate: { "": "0 -150%", ":focus": "0" },
    padding: "$gap ($gap * 1.5)",
    color: "#accent-surface-text",
    radius: "$radius",
    fill: "#accent-surface",
  }),
});

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
