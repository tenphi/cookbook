import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SidebarRoot = defineComponent("Sidebar", {
  as: "cookbook-sidebar-pane",
  "data-element": "Sidebar",
  styles: {
    "$sidebar-transition": "120ms",
    display: { "": null, "@md": "block" },
    visibility: {
      "": "visible",
      "!@md": "hidden",
      ":popover-open & !@md": "visible",
    },
    position: "fixed",
    zIndex: { "": "8", "!@md": "12" },
    blockInset: { "": "$docs-nav-height start, 0 end", "!@md": "0" },
    inlineInset: {
      "": "0 start, auto end",
      "@md": "max(0px, ((100% - $layout-width) / 2)) start, auto end",
    },
    inlineSize: {
      "": "$sidebar-width",
      "!@md": "min(22rem, (100% - 2rem))",
    },
    blockSize: "auto",
    margin: "0",
    padding: "0",
    border: "0",
    color: "#text",
    overflowY: "auto",
    scrollbar: { "": "auto stable", "!@md": "auto" },
    fill: "#surface",
    overscrollBehavior: "contain",
    shadow: { "": "none", "!@md": "0.25rem 0 1rem #shadow" },
    translate: {
      "": "0",
      "!@md": "-100% 0",
      ":popover-open & [data-open] & !@md": "0",
    },
    transition: {
      "": "none",
      "!@md & !@reduced-motion":
        "translate $sidebar-transition ease-out, visibility $sidebar-transition, display $sidebar-transition allow-discrete, overlay $sidebar-transition allow-discrete",
    },
    Backdrop: {
      $: "&::backdrop",
      fill: "#overlay",
      opacity: "0",
      transition: {
        "": "none",
        "!@md & !@reduced-motion":
          "opacity $sidebar-transition ease-out, display $sidebar-transition allow-discrete, overlay $sidebar-transition allow-discrete",
      },
    },
    OpenBackdrop: {
      $: "&::backdrop",
      opacity: { "": null, ":popover-open & [data-open]": "1" },
    },
    MobileHeader: {
      display: "grid",
      hide: { "": true, "!@md": false },
      flexShrink: "0",
      gap: "2x",
      padding: "2x $docs-sidebar-pad-x",
      blockBorder: "1bw solid #border end",
    },
    MobileHeading: {
      $: "MobileHeading",
      display: "flex",
      hide: { "": true, "!@md": false },
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1x",
    },
    HomeLink: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      inlineSize: "min 0",
      padding: "0",
      gap: "1x",
      color: "#text",
      preset: "h4",
    },
    HomeLogo: {
      $: 'HomeLink > [data-element="Logo"]',
      inlineSize: "2rem",
      blockSize: "2rem",
    },
    HomeLabel: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    Close: {
      $: "MobileHeading > button",
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
      $: "MobileHeading > button",
      color: {
        "": null,
        "@own(:hover)": "#text",
      },
      fill: {
        "": null,
        "@own(:hover)": "#surface-2-hover",
      },
    },
    CloseIcon: {
      $: "MobileHeading > button > svg",
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
    Content: {
      $: "Content",
      display: "flex",
      flow: "column",
      blockSize: { "": "min 100%", "!@md": "100%" },
      inlinePadding: { "": "$docs-sidebar-pad-x", "!@md": "0" },
      gap: { "": "2x", "!@md": "0" },
      blockPadding: {
        "": "3x start, 6x end",
        "!@md": "0",
      },
    },
    Tree: {
      $: "cookbook-sidebar",
      display: "block",
      flexGrow: { "": null, "!@md": "1" },
      flexBasis: { "": null, "!@md": "0" },
      blockSize: { "": null, "!@md": "min 0" },
      padding: { "": null, "!@md": "2x $docs-sidebar-pad-x" },
      overflowY: { "": null, "!@md": "auto" },
      scrollbar: { "": null, "!@md": "auto stable" },
      overscrollBehavior: { "": null, "!@md": "contain" },
    },
    MobileFooter: {
      hide: { "": true, "!@md": false },
      flexShrink: "0",
    },
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
    TopLevelSpacing: {
      $: "ul > li + li",
      blockMargin: {
        "": null,
        // States add no specificity, so leave sections to GroupSpacing rather
        // than depending on the order of the two rules.
        "@own(top-level & !section)": "0 start",
      },
    },
    GroupSpacing: {
      $: "ul > li + li",
      blockMargin: {
        "": null,
        "@own(top-level & section)": "2.5x start",
      },
    },
    NestedItem: {
      $: "cookbook-sidebar details > ul > li",
      inlineMargin: "1.5x start",
    },
    SectionHeading: {
      $: "SectionHeading",
      margin: "1bw bottom",
      padding: "0.75x 1.25x",
      color: "#text",
      preset: "small / strong",
    },
    Control: {
      $: "cookbook-sidebar summary, cookbook-sidebar a",
      blockSize: "min 2.25rem",
      padding: "0.75x 1.25x",
      color: "#sidebar-text",
      preset: "navigation",
      radius: "1r",
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
      $: "GroupLabel, [data-element=SectionHeading]",
      display: "flex",
      alignItems: "center",
      inlineSize: "min 0",
      flexGrow: "1",
      gap: "0.25em",
    },
    GroupLabelText: {
      $: "GroupLabel > span, SectionHeading > span",
      inlineSize: {
        "": null,
        "@own(:first-child)": "min 0",
      },
      overflow: {
        "": null,
        "@own(:first-child)": "hidden",
      },
      textOverflow: {
        "": null,
        "@own(:first-child)": "ellipsis",
      },
      whiteSpace: {
        "": null,
        "@own(:first-child)": "nowrap",
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
      inlineSize: { "": null, "@own(:first-child)": "min 0" },
      overflow: { "": null, "@own(:first-child)": "hidden" },
      textOverflow: { "": null, "@own(:first-child)": "ellipsis" },
      whiteSpace: { "": null, "@own(:first-child)": "nowrap" },
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
      // Lift the focus ring above the next item's fill.
      position: { "": null, "@own(:focus-visible)": "relative" },
      zIndex: { "": null, "@own(:focus-visible)": "1" },
    },
    SummaryMarker: {
      $: "cookbook-sidebar summary::marker, summary::-webkit-details-marker",
      hide: true,
    },
    Caret: {
      $: "Caret",
      flexShrink: "0",
      inlineSize: "1rem",
      blockSize: "1rem",
      transform: { "": "none", ":dir(rtl)": "rotate(180deg)" },
    },
    ExpandedCaret: {
      $: "details > summary > [data-element=Caret], details > summary > a > [data-element=Caret]",
      transform: {
        "": null,
        "@own(:is(details[open] > summary > *, details[open] > summary > a > *))":
          "rotate(90deg)",
      },
    },
    LinkedSummary: {
      $: "summary",
      padding: { "": null, "@own(:has(> a))": "0" },
    },
    GroupLink: { $: "summary > a", justifyContent: "space-between" },
    LinkedSectionHeading: {
      $: "[data-element=SectionHeading]",
      padding: { "": null, "@own(:has(> a))": "0" },
    },
    SectionLink: {
      $: "SectionHeading > a",
      color: {
        "": null,
        '@own(![aria-current="page"])': "#text",
      },
      preset: {
        "": null,
        '@own(![aria-current="page"])': "small / strong",
      },
    },
    Badge: {
      $: "cookbook-sidebar Badge",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      inlineMargin: "auto start",
      padding: "0.125em 0.625em",
      color: "#accent-text",
      fill: "#accent-surface-subtle",
      radius: "round",
      preset: "small / strong / tight",
      whiteSpace: "nowrap",
    },
    TopLevelLink: {
      $: "a",
      color: {
        "": null,
        '@own(top-level & ![aria-current="page"])': "#sidebar-text",
      },
      preset: {
        "": null,
        '@own(top-level & ![aria-current="page"])': "navigation",
      },
    },
  },
});
