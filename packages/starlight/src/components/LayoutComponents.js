import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export const LogoRoot = customizeComponent(
  "Logo",
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
      Mark: {
        $: "> svg > .td-logo__mark",
        color: "#accent-surface-text",
      },
    },
  }),
);

export const PackageVersionRoot = customizeComponent(
  "PackageVersion",
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
  tasty({
    as: "div",
    styles: {
      display: "flex",
      flow: "column",
      inlineSize: "100%",
      maxInlineSize: "($layout-width - ($docs-sidebar-pad-x * 2))",
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
        display: "flex",
        flow: "row",
        gap: "$gap",
        overflow: "hidden",
        maxInlineSize: {
          "": "none",
          "@mobile": "(100% - (($docs-menu-button-size + $docs-nav-gap) * 3))",
        },
      },
      Logo: {
        $: ".td-header__logo",
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
        color: "#text",
        preset: { "": "h4 / strong", "@mobile": "h5 / strong" },
        textDecoration: "none",
        whiteSpace: "nowrap",
      },
      Search: {
        $: ".td-header__search",
        position: { "": "static", "@mobile": "fixed" },
        zIndex: { "": "auto", "@mobile": "10" },
        inset: {
          "": "auto top",
          "@mobile": "(($docs-nav-height - $docs-menu-button-size) / 2) top",
        },
        insetInlineEnd: {
          "": "auto",
          "@mobile":
            "($docs-nav-pad-x + (($docs-menu-button-size + $docs-nav-gap) * 2))",
        },
        placeItems: { "": "normal", "@mobile": "center" },
        inlineSize: { "": "auto", "@mobile": "$docs-menu-button-size" },
        blockSize: { "": "auto", "@mobile": "$docs-menu-button-size" },
        marginInlineStart: "0",
      },
      SearchElement: {
        $: ".td-header__search site-search",
        inlineSize: "100%",
        blockSize: { "": "auto", "@mobile": "$docs-menu-button-size" },
      },
      Tools: {
        $: ".td-header__tools",
        display: "flex",
        hide: { "": false, "@mobile": true },
        flow: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "($gap * 1.5)",
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
        position: { "": "static", "@mobile": "fixed" },
        zIndex: { "": "auto", "@mobile": "10" },
        inset: {
          "": "auto top",
          "@mobile": "(($docs-nav-height - $docs-menu-button-size) / 2) top",
        },
        insetInlineEnd: {
          "": "auto",
          "@mobile":
            "($docs-nav-pad-x + $docs-menu-button-size + $docs-nav-gap)",
        },
        placeItems: { "": "normal", "@mobile": "center" },
        inlineSize: { "": "auto", "@mobile": "$docs-menu-button-size" },
        blockSize: { "": "auto", "@mobile": "$docs-menu-button-size" },
      },
    },
  }),
);

const appearanceSelectStyles = {
  display: "grid",
  flexShrink: "0",
  placeItems: "center",
  margin: "0",
  inlineSize: {
    "": "$control-height",
    "@mobile": "$docs-menu-button-size",
  },
  blockSize: {
    "": "$control-height",
    "@mobile": "$docs-menu-button-size",
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
  IconSvg: {
    $: ".label-icon > svg",
    display: "block",
    inlineSize: "100%",
    blockSize: "100%",
  },
  Select: {
    $: "select",
    appearance: { "": "base-select", "@mobile": "none" },
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
    fill: "#accent-surface-2-subtle",
  },
  Checkmark: {
    $: "option::checkmark",
    order: "1",
    marginInlineStart: "auto",
  },
};

export const ThemeSelectRoot = customizeComponent(
  "ThemeSelect",
  tasty({
    as: "starlight-theme-select",
    styles: appearanceSelectStyles,
  }),
);

export const ContrastSelectRoot = customizeComponent(
  "ContrastSelect",
  tasty({
    as: "cookbook-contrast-select",
    styles: appearanceSelectStyles,
  }),
);

export const MobileNavigationTabsRoot = customizeComponent(
  "MobileNavigationTabs",
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
        fill: "#accent-surface-subtle",
      },
    },
  }),
);

export const MobileMenuFooterRoot = customizeComponent(
  "MobileMenuFooter",
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

export const FooterRoot = customizeComponent(
  "Footer",
  tasty({
    as: "footer",
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
        marginBlockStart: "($gap * 6)",
        color: "#text-muted",
        preset: "small",
      },
      LoneMetaItem: {
        $: ".td-footer__meta > :only-child",
        marginInlineStart: "auto",
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
  }),
);
