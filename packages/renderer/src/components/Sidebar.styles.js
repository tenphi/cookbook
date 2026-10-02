import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SidebarRoot = defineComponent("Sidebar", {
  as: "cookbook-sidebar-pane",
  "data-tasty-anatomy": "Sidebar",
  styles: {
    "$sidebar-transition": "120ms",
    display: { "@desktop": "block" },
    visibility: { "": "visible", "@mobile": "hidden" },
    position: "fixed",
    zIndex: { "": "8", "@mobile": "12" },
    blockInset: { "": "$docs-nav-height start, 0 end", "@mobile": "0" },
    inlineInset: {
      "": "0 start, auto end",
      "@desktop": "max(0px, calc((100% - $layout-width) / 2)) start, auto end",
    },
    inlineSize: {
      "": "$sidebar-width",
      "@mobile": "min(22rem, calc(100% - 2rem))",
    },
    blockSize: "auto",
    margin: "0",
    padding: "0",
    border: "0",
    color: "#text",
    overflowY: "auto",
    scrollbar: "auto stable",
    fill: "#surface",
    overscrollBehavior: "contain",
    shadow: { "": "none", "@mobile": "0.25rem 0 1rem #shadow" },
    translate: { "": "0", "@mobile": "-100% 0" },
    transition: {
      "": "none",
      "@mobile & !@reduced-motion":
        "translate $sidebar-transition ease-out, visibility $sidebar-transition, display $sidebar-transition allow-discrete, overlay $sidebar-transition allow-discrete",
    },
    Backdrop: {
      $: "&::backdrop",
      fill: "#overlay",
      opacity: "0",
      transition: {
        "": "none",
        "@mobile & !@reduced-motion":
          "opacity $sidebar-transition ease-out, display $sidebar-transition allow-discrete, overlay $sidebar-transition allow-discrete",
      },
    },
    OpenBackdrop: {
      $: "&::backdrop",
      opacity: { "": null, "@popover-open & [data-open]": "1" },
    },
    MobileHeading: {
      $: ".td-sidebar-heading",
      display: "flex",
      hide: { "": true, "@mobile": false },
      alignItems: "center",
      justifyContent: "space-between",
      gap: "$gap",
    },
    HomeLink: {
      $: ".td-sidebar-heading__home",
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      inlineSize: "min 0",
      padding: "0",
      gap: "$gap",
      color: "#text",
      preset: "h4",
    },
    HomeLogo: {
      $: ".td-sidebar-heading__home > *",
      inlineSize: {
        "": null,
        '@own(:is(.td-sidebar-heading__home > [data-tasty-anatomy="Logo"]))':
          "2rem",
      },
      blockSize: {
        "": null,
        '@own(:is(.td-sidebar-heading__home > [data-tasty-anatomy="Logo"]))':
          "2rem",
      },
    },
    HomeLabel: {
      $: ".td-sidebar-heading__home > *",
      overflow: {
        "": null,
        "@own(:is(.td-sidebar-heading__home > [data-site-title]))": "hidden",
      },
      textOverflow: {
        "": null,
        "@own(:is(.td-sidebar-heading__home > [data-site-title]))": "ellipsis",
      },
      whiteSpace: {
        "": null,
        "@own(:is(.td-sidebar-heading__home > [data-site-title]))": "nowrap",
      },
    },
    Close: {
      $: ".td-sidebar-heading > button",
      display: "grid",
      placeItems: "center",
      flexShrink: "0",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
      padding: "0",
      border: "0",
      color: "#text-soft",
      fill: "#clear",
      radius: "$header-control-radius",
    },
    HoverClose: {
      $: ".td-sidebar-heading > button",
      color: {
        "": null,
        "@own(:is(.td-sidebar-heading > button:hover))": "#text",
      },
      fill: {
        "": null,
        "@own(:is(.td-sidebar-heading > button:hover))": "#surface-2-hover",
      },
    },
    CloseIcon: {
      $: ".td-sidebar-heading > button > svg",
      inlineSize: "1.25rem",
      blockSize: "1.25rem",
    },
    CurrentLink: {
      $: "cookbook-sidebar a",
      color: {
        "": null,
        '@own([aria-current="page"])': "#accent-text",
      },
      fill: {
        "": null,
        '@own([aria-current="page"])': "#accent-surface-subtle",
      },
      preset: {
        "": null,
        '@own([aria-current="page"])': "navigation / strong",
      },
    },
    OpenPane: {
      $: "&:where(*)",
      visibility: { "": null, "@popover-open & @mobile": "visible" },
    },
    EnteredPane: {
      $: "&:where(*)",
      translate: { "": null, "@popover-open & [data-open] & @mobile": "0" },
    },
    Content: {
      $: ".sidebar-content",
      display: "flex",
      flow: "column",
      blockSize: "min 100%",
      inlinePadding: "$docs-sidebar-pad-x",
      gap: "($gap * 2)",
      blockPadding: {
        "": "($gap * 3) start, ($gap * 6) end",
        "@mobile": "($gap * 2) start, ($gap * 6) end",
      },
    },
    Tree: { $: "cookbook-sidebar", display: "block" },
    List: {
      $: "cookbook-sidebar ul",
      display: "grid",
      gridColumns: "minmax(0, 1fr)",
      gap: "1bw",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    Item: { $: "cookbook-sidebar li", overflowWrap: "anywhere" },
    TopLevelSpacing: { $: ".top-level > li + li", blockMargin: "0 start" },
    GroupSpacing: {
      $: ".top-level > li + li",
      blockMargin: {
        "": null,
        "@own(:is(.top-level > li + li:has(> .sidebar-section-label)))":
          "($gap * 2.5) start",
      },
    },
    NestedItem: {
      $: "cookbook-sidebar details > ul > li",
      inlineMargin: "($gap * 1.5) start",
    },
    SectionHeading: {
      $: ".sidebar-section-label",
      margin: "0 0 1bw",
      padding: "($gap * 0.75) ($gap * 1.25)",
      color: "#text",
      preset: "small / strong",
    },
    Control: {
      $: "cookbook-sidebar summary, cookbook-sidebar a",
      blockSize: "min 2.25rem",
      padding: "($gap * 0.75) ($gap * 1.25)",
      color: "#sidebar-text",
      preset: "navigation",
      radius: "$radius",
      textDecoration: "none",
    },
    Summary: {
      $: "cookbook-sidebar summary",
      blockMargin: "1bw end",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1x",
      cursor: "pointer",
      userSelect: "none",
    },
    GroupLabel: {
      $: ".group-label",
      display: "flex",
      alignItems: "center",
      inlineSize: "min 0",
      gap: "0.25em",
    },
    GroupLabelText: {
      $: ".group-label > span",
      inlineSize: {
        "": null,
        "@own(:is(.group-label > span:first-child))": "min 0",
      },
      overflow: {
        "": null,
        "@own(:is(.group-label > span:first-child))": "hidden",
      },
      textOverflow: {
        "": null,
        "@own(:is(.group-label > span:first-child))": "ellipsis",
      },
      whiteSpace: {
        "": null,
        "@own(:is(.group-label > span:first-child))": "nowrap",
      },
    },
    Link: {
      $: "cookbook-sidebar a",
      inlineSize: "0 100% initial",
      display: "flex",
      alignItems: "center",
      gap: "0.25em",
      fill: "#surface",
      preset: "navigation",
    },
    LinkLabel: {
      $: "a > span",
      inlineSize: { "": null, "@own(:is(a > span:first-child))": "min 0" },
      overflow: { "": null, "@own(:is(a > span:first-child))": "hidden" },
      textOverflow: { "": null, "@own(:is(a > span:first-child))": "ellipsis" },
      whiteSpace: { "": null, "@own(:is(a > span:first-child))": "nowrap" },
    },
    InteractiveControl: {
      $: "cookbook-sidebar a, cookbook-sidebar summary",
      color: {
        "": null,
        '@own((:hover | :focus-visible) & ![aria-current="page"])': "#text",
      },
      fill: {
        "": null,
        '@own((:hover | :focus-visible) & ![aria-current="page"])':
          "#surface-2-hover",
      },
    },
    SummaryMarker: {
      $: "cookbook-sidebar summary::marker, summary::-webkit-details-marker",
      hide: true,
    },
    Caret: {
      $: ".sidebar-caret",
      flexShrink: "0",
      inlineSize: "1rem",
      blockSize: "1rem",
      // Tasty and browsers support :dir(); the lint rule's pseudo list omits it.
      // eslint-disable-next-line tasty/valid-state-key
      transform: { "": "none", ":dir(rtl)": "rotate(180deg)" },
    },
    ExpandedCaret: {
      $: "details > summary > .sidebar-caret, details > summary > a > .sidebar-caret",
      transform: {
        "": null,
        "@own(:is(details[open] > summary > .sidebar-caret)) | @own(:is(details[open] > summary > a > .sidebar-caret))":
          "rotate(90deg)",
      },
    },
    LinkedSummary: {
      $: "summary",
      padding: { "": null, "@own(:has(> a))": "0" },
    },
    GroupLink: { $: "summary > a", justifyContent: "space-between" },
    LinkedSectionHeading: {
      $: ".sidebar-section-label",
      padding: { "": null, "@own(:has(> a))": "0" },
    },
    SectionLink: {
      $: ".sidebar-section-label > a",
      color: {
        "": null,
        '@own(:is(.sidebar-section-label > a:not([aria-current="page"])))':
          "#text",
      },
      preset: {
        "": null,
        '@own(:is(.sidebar-section-label > a:not([aria-current="page"])))':
          "small / strong",
      },
    },
    Badge: {
      $: ".sidebar-badge",
      flexShrink: "0",
      padding: "0.125rem 0.375rem",
      color: "#text-soft",
      fill: "#surface-3",
      border: "$border-width solid #border",
      radius: "$radius",
      preset: "small",
    },
    TopLevelLink: {
      $: "a.large",
      color: { "": null, '@own(:not([aria-current="page"]))': "#sidebar-text" },
      preset: { "": null, '@own(:not([aria-current="page"]))': "navigation" },
    },
  },
});
