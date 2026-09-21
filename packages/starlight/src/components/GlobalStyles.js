import { useFontFace, useGlobalStyles } from "@tenphi/tasty";
import jetBrainsMonoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import checkIcon from "../icons/check.svg?raw";
import chevronRightIcon from "../icons/chevron-right.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import copyIcon from "../icons/copy.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

// Starlight owns the document markup, while Tasty owns every emitted style and
// Glaze owns every color value. Cookbook-owned components use tasty() wrappers;
// every global style object remains visible to the Tasty linter.
export default function GlobalStyles() {
  useFontFace("Onest Variable", {
    src: `url("${onestLatin}") format("woff2-variations")`,
    fontWeight: "100 900",
    fontDisplay: "swap",
  });
  useFontFace("JetBrains Mono Variable", {
    src: `url("${jetBrainsMonoLatin}") format("woff2-variations")`,
    fontWeight: "100 800",
    fontDisplay: "swap",
  });

  useGlobalStyles(
    ":root",
    resolveComponentStyles("Layout", {
      colorScheme: "dark",
      "$docs-nav-height": {
        "": "4.5rem",
        ":has(.td-top-tabs)": "7rem",
        "@mobile": "3.5rem",
        "@mobile & [data-has-sidebar]": "6.5rem",
      },
      "$docs-nav-pad-x": {
        "": "clamp(1.25rem, 2.5vw, 2rem)",
        "@mobile": "1rem",
      },
      "$docs-nav-gap": { "": "0.75rem", "@mobile": "0.5rem" },
      "$docs-sidebar-pad-x": "1.5rem",
      "$docs-content-pad-x": {
        "": "clamp(1.5rem, 4vw, 4rem)",
        "@mobile": "1rem",
      },
      "$docs-menu-button-size": { "": "2.5rem", "@mobile": "2.25rem" },
      "$docs-mobile-toc-height": "0rem",
      LockedPage: {
        $: "&:has(#starlight__sidebar:popover-open)",
        overflow: { "@mobile": "hidden" },
      },
    }),
  );

  useGlobalStyles(':root[data-theme="light"]', {
    colorScheme: "light",
  });

  useGlobalStyles(":root:not([data-theme])", {
    colorScheme: {
      "@media(prefers-color-scheme: light)": "light",
    },
  });

  useGlobalStyles("*, *::before, *::after", {
    boxSizing: "border-box",
  });

  useGlobalStyles("html", {
    minBlockSize: "100%",
    scrollPaddingBlockStart:
      "(1.5rem + $docs-nav-height + $docs-mobile-toc-height)",
  });

  useGlobalStyles("body", {
    minInlineSize: "0",
    minBlockSize: "100%",
    margin: "0",
  });

  useGlobalStyles(":where(button, input, select, textarea)", {
    font: "inherit",
  });

  useGlobalStyles(":where(button, summary, select)", {
    cursor: "pointer",
  });

  useGlobalStyles(
    ":where(img:not([width]), picture, video:not([width]), canvas:not([width]), svg:not([width]), iframe:not([width]))",
    {
      maxInlineSize: "100%",
    },
  );

  useGlobalStyles(
    ":where(img:not([height]), picture, video:not([height]), canvas:not([height]), svg:not([height]))",
    {
      blockSize: "auto",
    },
  );

  useGlobalStyles(":where([hidden], .sl-hidden)", {
    hide: true,
  });

  useGlobalStyles(".md\\:sl-block", {
    display: { "": "block", "@mobile": "none" },
  });

  useGlobalStyles(".md\\:sl-flex", {
    display: { "": "flex", "@mobile": "none" },
  });

  useGlobalStyles(".sr-only", {
    position: "absolute",
    inlineSize: "1px",
    blockSize: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });

  useGlobalStyles("body", {
    color: "#text",
    fill: "#surface",
    preset: "body",
  });

  useGlobalStyles(":where(strong, b)", {
    preset: "strong",
  });

  useGlobalStyles("a", {
    color: "#accent-text",
  });

  useGlobalStyles(
    "body > .page > .header",
    resolveComponentStyles("HeaderFrame", {
      position: "fixed",
      zIndex: "10",
      inset: "0 0 auto",
      inlineSize: "100%",
      blockSize: "$docs-nav-height",
      padding: "0 $docs-nav-pad-x",
      borderBlockEnd: "$border-width solid #border",
      fill: "#header",
      backdropFilter: "blur(16px)",
    }),
  );

  useGlobalStyles(".main-pane", {
    isolation: "isolate",
    inlineSize: "100%",
    minInlineSize: "0",
  });

  useGlobalStyles("[data-has-sidebar][data-has-toc] .main-pane", {
    order: "1",
    inlineSize: {
      "": "min(calc(100% - $sidebar-width), calc($content-width + (100% - $content-width - $sidebar-width) / 2))",
      "@narrow-layout": "100%",
    },
  });

  useGlobalStyles(
    ".right-sidebar-container",
    resolveComponentStyles("TableOfContentsLayout", {
      Content: {
        $: ".right-sidebar",
        position: "sticky",
        insetBlockStart: "$docs-nav-height",
        inlineSize: "100%",
        blockSize: "calc(100vh - $docs-nav-height)",
        overflowY: { "": "auto", "@narrow-layout": "visible" },
        scrollbarWidth: "none",
      },
      hide: { "": false, "@narrow-layout": true },
      order: "2",
      position: "relative",
      inlineSize: {
        "": "max($sidebar-width, calc($sidebar-width + (100% - $content-width - $sidebar-width) / 2))",
        "@narrow-layout": "100%",
      },
    }),
  );

  useGlobalStyles(".lg\\:sl-hidden", {
    display: { "": "none", "@narrow-layout": "block" },
  });

  useGlobalStyles(".md\\:sl-hidden", {
    display: { "": "none", "@mobile": "block" },
  });

  useGlobalStyles("main", {
    padding: "0 0 5rem",
  });

  useGlobalStyles(".content-panel > .sl-container > * + *", {
    marginBlockStart: "($gap * 3)",
  });

  useGlobalStyles(".content-panel > .sl-container", {
    marginInlineStart: { "": "auto", "@narrow-layout": "0" },
    marginInlineEnd: { "": "auto", "@narrow-layout": "0" },
  });

  useGlobalStyles(".sl-banner", {
    padding: "($gap * 1.5) $docs-nav-pad-x",
    color: "#accent-surface-text",
    fill: "#accent-surface",
    preset: "body / strong",
    lineHeight: "$heading-line-height",
    textAlign: "center",
    textWrap: "balance",
    boxShadow: "none",
  });

  useGlobalStyles(".sl-banner a", {
    color: "#accent-surface-text",
  });

  useGlobalStyles(".sl-skip-link", {
    position: "fixed",
    inset: "($gap * 1.5) auto auto ($gap * 1.5)",
    inlineSize: "1px",
    blockSize: "1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
  });

  useGlobalStyles(".sl-skip-link:focus", {
    zIndex: "20",
    inlineSize: "auto",
    blockSize: "auto",
    padding: "$gap ($gap * 2)",
    overflow: "visible",
    color: "#accent-surface-text",
    fill: "#accent-surface",
    clip: "auto",
    radius: "$radius",
    shadow: "0 1rem 3rem #shadow",
    textDecoration: "none",
  });

  useGlobalStyles(":where(h1, h2, h3, h4, h5, h6), .site-title", {
    color: "#text",
    preset: "heading",
    textWrap: "balance",
  });

  useGlobalStyles("h1", {
    preset: "h1",
  });

  useGlobalStyles("h2", {
    preset: "h2",
  });

  useGlobalStyles("h3", {
    preset: "h3",
  });

  useGlobalStyles("h4", {
    preset: "h4",
  });

  useGlobalStyles("h5", {
    preset: "h5",
  });

  useGlobalStyles("h6", {
    preset: "h6",
  });

  useGlobalStyles(":where(code, kbd, samp, pre)", {
    preset: "code",
  });

  useGlobalStyles(
    ":where(a, button, input, select, textarea, summary):focus-visible",
    {
      outline: "$outline-width solid #focus",
      outlineOffset: "$outline-offset",
    },
  );

  useGlobalStyles(":where(button, input, select, textarea)", {
    minBlockSize: "$control-height",
    radius: "$radius",
    boxShadow: "none",
  });

  useGlobalStyles(
    'site-search dialog, .pagination-links a, a[aria-current="page"]',
    { radius: "$radius" },
  );

  useGlobalStyles(
    "#starlight__sidebar",
    resolveComponentStyles("Sidebar", {
      display: { "@desktop": "block" },
      visibility: { "": "visible", "@mobile": "hidden" },
      position: "fixed",
      zIndex: { "": "8", "@mobile": "12" },
      blockInset: { "": "$docs-nav-height start, 0 end", "@mobile": "0" },
      inlineInset: {
        "": "0 start, auto end",
        "@desktop":
          "max(0px, calc((100% - $layout-width) / 2)) start, auto end",
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
      scrollbarGutter: "stable",
      fill: "#surface",
      overscrollBehavior: "contain",
      shadow: { "": "none", "@mobile": "0.25rem 0 1rem #shadow" },
      translate: { "": "0", "@mobile": "-100% 0" },
      transition: {
        "": "none",
        "@mobile & !@reduced-motion":
          "translate 120ms ease-out, visibility 120ms, display 120ms allow-discrete, overlay 120ms allow-discrete",
      },
      Backdrop: {
        $: "&::backdrop",
        fill: "#overlay",
        opacity: "0",
        transition: {
          "": "none",
          "@mobile & !@reduced-motion":
            "opacity 120ms ease-out, display 120ms allow-discrete, overlay 120ms allow-discrete",
        },
      },
      OpenBackdrop: {
        $: "&:popover-open[data-open]::backdrop",
        opacity: "1",
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
        $: ".td-sidebar-heading__home > span:first-child",
        inlineSize: "2rem",
        blockSize: "2rem",
      },
      HomeLabel: {
        $: ".td-sidebar-heading__home > span:last-child",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
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
        radius: "$radius",
      },
      HoverClose: {
        $: ".td-sidebar-heading > button:hover",
        color: "#text",
        fill: "#surface-2-hover",
      },
      CloseIcon: {
        $: ".td-sidebar-heading > button > svg",
        inlineSize: "1.25rem",
        blockSize: "1.25rem",
      },
      CurrentLink: {
        $: [
          'cookbook-sidebar a[aria-current="page"]',
          'cookbook-sidebar a[aria-current="page"]:hover',
          'cookbook-sidebar a[aria-current="page"]:focus',
        ],
        color: "#accent-text",
        fill: "#accent-surface-subtle",
        preset: "navigation / strong",
      },
      OpenPane: {
        $: "&:popover-open[data-open]",
        visibility: { "@mobile": "visible" },
        translate: { "@mobile": "0" },
      },
      Content: {
        $: ".sidebar-content",
        display: "flex",
        flow: "column",
        minBlockSize: "100%",
        paddingInline: "$docs-sidebar-pad-x",
        gap: "($gap * 2)",
        paddingBlockStart: "($gap * 2)",
        paddingBlockEnd: "($gap * 6)",
      },
      Tree: {
        $: "cookbook-sidebar",
        display: "block",
      },
      List: {
        $: "cookbook-sidebar ul",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "1bw",
        margin: "0",
        padding: "0",
        listStyle: "none",
      },
      Item: {
        $: "cookbook-sidebar li",
        overflowWrap: "anywhere",
      },
      TopLevelSpacing: {
        $: ".top-level > li + li",
        marginBlockStart: "0",
      },
      GroupSpacing: {
        $: ".top-level > li + li:has(> .sidebar-section-label)",
        marginBlockStart: "($gap * 2.5)",
      },
      NestedItem: {
        $: "cookbook-sidebar details > ul > li",
        marginInlineStart: "($gap * 1.5)",
      },
      SectionHeading: {
        $: ".sidebar-section-label",
        margin: "0 0 1bw",
        padding: "($gap * 0.75) ($gap * 1.25)",
        color: "#text",
        preset: "small / strong",
      },
      Control: {
        $: ["cookbook-sidebar summary", "cookbook-sidebar a"],
        blockSize: "min 2.25rem",
        padding: "($gap * 0.75) ($gap * 1.25)",
        color: "#text-soft",
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
        minInlineSize: "0",
        gap: "0.25em",
      },
      GroupLabelText: {
        $: ".group-label > span:first-child",
        minInlineSize: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      Link: {
        $: "cookbook-sidebar a",
        inlineSize: "100%",
        display: "flex",
        alignItems: "center",
        minInlineSize: "0",
        gap: "0.25em",
        fill: "#surface",
        preset: "navigation",
      },
      LinkLabel: {
        $: "a > span:first-child",
        minInlineSize: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      InteractiveControl: {
        $: [
          "cookbook-sidebar a:hover",
          "cookbook-sidebar a:focus-visible",
          "cookbook-sidebar summary:hover",
          "cookbook-sidebar summary:focus-visible",
        ],
        color: "#text",
        fill: "#surface-2-hover",
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
        transform: { "": "none", ":dir(rtl)": "rotate(180deg)" },
      },
      ExpandedCaret: {
        $: [
          "details[open] > summary > .sidebar-caret",
          "details[open] > summary > a > .sidebar-caret",
        ],
        transform: "rotate(90deg)",
      },
      LinkedSummary: {
        $: "summary:has(> a)",
        padding: "0",
      },
      GroupLink: {
        $: "summary > a",
        justifyContent: "space-between",
      },
      LinkedSectionHeading: {
        $: ".sidebar-section-label:has(> a)",
        padding: "0",
      },
      SectionLink: {
        $: '.sidebar-section-label > a:not([aria-current="page"])',
        color: "#text",
        preset: "small / strong",
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
        $: 'a.large:not([aria-current="page"])',
        color: "#text",
        preset: "navigation",
      },
    }),
  );

  useGlobalStyles(
    ".right-sidebar-panel",
    resolveComponentStyles("TableOfContents", {
      display: "block",
      hide: { "": false, "@narrow-layout": true },
      paddingBlockStart: "($gap * 3)",
      paddingInlineStart: "$docs-sidebar-pad-x",
      paddingInlineEnd: "$docs-sidebar-pad-x",

      Heading: {
        $: "h2",
        margin: "0 0 $gap",
        color: "#text",
        preset: "small / strong",
      },
      List: {
        $: "ul",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        minInlineSize: "0",
        gap: "1px",
        margin: "0",
        padding: "0",
        listStyle: "none",
      },
      Item: {
        $: "li",
        minInlineSize: "0",
        margin: "0",
        padding: "0",
        listStyle: "none",
      },
      Link: {
        $: "a",
        display: "block",
        minInlineSize: "0",
        maxInlineSize: "100%",
        paddingBlockStart: "($gap * 0.5)",
        paddingBlockEnd: "($gap * 0.5)",
        color: "#text-muted",
        preset: "small",
        textDecoration: "none",
        overflowWrap: "anywhere",
      },
      LinkLabel: {
        $: "a > span",
        display: "block",
        minInlineSize: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      HoverLink: {
        $: "a:hover",
        color: "#text",
      },
      CurrentLink: {
        $: 'a[aria-current="true"]',
        color: "#accent-text",
      },
    }),
  );

  useGlobalStyles(".content-panel", {
    padding: "($gap * 3) $docs-content-pad-x",
  });

  useGlobalStyles(".content-panel > .sl-container", {
    maxInlineSize: "$content-width",
  });

  useGlobalStyles("main h1#_top", {
    marginBlockStart: "($gap * 2)",
    color: "#text",
    preset: "h1",
  });

  useGlobalStyles(
    ".hero",
    resolveComponentStyles("Hero", {
      display: "grid",
      gridTemplateColumns: {
        "": "minmax(0, 7fr) minmax(12rem, 4fr)",
        "@mobile": "minmax(0, 1fr)",
      },
      alignItems: "center",
      gap: "clamp(2rem, 5vw, 5rem)",
      paddingBlockStart: {
        "": "clamp(3rem, 8vw, 7rem)",
        "@mobile": "($gap * 4)",
      },
      paddingBlockEnd: "clamp(2rem, 6vw, 5rem)",
      Visual: {
        $: "> img, > .hero-html",
        order: { "": "2", "@mobile": "0" },
        display: "grid",
        placeItems: "center",
        inlineSize: "min(100%, 22rem)",
        marginInlineStart: "auto",
        marginInlineEnd: "auto",
        color: "#accent-surface",
      },
      Stack: {
        $: "> .stack",
        display: "flex",
        flow: "column",
        alignItems: { "": "flex-start", "@mobile": "center" },
        gap: "clamp(1.5rem, 3vw, 2rem)",
        textAlign: { "": "start", "@mobile": "center" },
      },
      Copy: {
        $: "> .stack > .copy",
        display: "flex",
        flow: "column",
        alignItems: "inherit",
        gap: "($gap * 2)",
      },
      Title: {
        $: "h1",
        maxInlineSize: "16ch",
        margin: "0",
        color: "#text",
        preset: "h1",
        fontSize: "clamp(2.75rem, 7vw, 4.75rem)",
        textWrap: "balance",
      },
      Tagline: {
        $: ".tagline",
        maxInlineSize: "48ch",
        color: "#text-soft",
        fontSize: "clamp(1.05rem, 2.5vw, 1.35rem)",
        lineHeight: "1.55",
        textWrap: "balance",
      },
      Actions: {
        $: ".actions",
        display: "flex",
        flow: "row wrap",
        justifyContent: { "": "flex-start", "@mobile": "center" },
        gap: "($gap * 1.5)",
      },
      Action: {
        $: ".sl-link-button",
        display: "inline-flex",
        alignItems: "center",
        minBlockSize: "$control-height",
        padding: "($gap * 1.25) ($gap * 2.5)",
        gap: "$gap",
        color: "#text",
        border: true,
        radius: "999px",
        fill: "#surface-2",
        preset: "navigation / strong",
        textDecoration: "none",
        transition: "fill $transition, translate $transition",
      },
      HoverAction: {
        $: ".sl-link-button:hover",
        fill: "#surface-2-hover",
        translate: "0 -1px",
      },
      PrimaryAction: {
        $: ".sl-link-button.primary",
        color: "#accent-surface-text",
        borderColor: "#accent-surface",
        fill: "#accent-surface",
      },
      SecondaryAction: {
        $: ".sl-link-button.secondary",
        color: "#accent-text",
        borderColor: "#border-strong",
      },
      MinimalAction: {
        $: ".sl-link-button.minimal",
        paddingInlineStart: "0",
        paddingInlineEnd: "0",
        color: "#accent-text",
        border: "0",
        fill: "#clear",
      },
      ActionIcon: {
        $: ".sl-link-button svg",
        flexShrink: "0",
      },
    }),
  );

  useGlobalStyles("main > .content-panel:first-of-type", {
    paddingBlockStart: "($gap * 3)",
    paddingBlockEnd: "($gap * 2)",
  });

  useGlobalStyles("main > .content-panel:nth-of-type(2)", {
    paddingBlockStart: "($gap * 2)",
  });

  useGlobalStyles(".sl-markdown-content", {
    fontSize: "1.025rem",
  });

  useGlobalStyles(
    ".sl-markdown-content :where(p, ul, ol, dl, blockquote, pre, table, hr, details):not(:where(.not-content *))",
    {
      marginBlockStart: "0",
      marginBlockEnd: "0",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content :not(a, strong, em, del, span, input, code, br) + :not(a, strong, em, del, span, input, code, br, li, dt, dd, :where(.not-content *))",
    {
      marginBlockStart: "($gap * 3)",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content :not(h1, h2, h3, h4, h5, h6, .sl-heading-wrapper) + :where(h1, h2, h3, h4, h5, h6, .sl-heading-wrapper):not(:where(.not-content *))",
    {
      marginBlockStart: "1.5em",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content :where(ul, ol):not(:where(.not-content *))",
    {
      paddingInlineStart: "1.5rem",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content :where(li + li, dt + dt, dt + dd, dd + dd):not(:where(.not-content *))",
    {
      marginBlockStart: "($gap * 0.5)",
    },
  );

  useGlobalStyles(".sl-markdown-content li:not(:where(.not-content *))", {
    overflowWrap: "anywhere",
  });

  useGlobalStyles(".sl-markdown-content dt:not(:where(.not-content *))", {
    preset: "strong",
  });

  useGlobalStyles(".sl-markdown-content dd:not(:where(.not-content *))", {
    paddingInlineStart: "($gap * 2)",
  });

  useGlobalStyles(".sl-markdown-content a:not(:where(.not-content *))", {
    color: "#accent-text",
    textUnderlineOffset: "0.15em",
  });

  useGlobalStyles(".sl-markdown-content a:hover:not(:where(.not-content *))", {
    color: "#text",
  });

  useGlobalStyles(
    ".sl-markdown-content code:not(:where(pre *, .not-content *))",
    resolveComponentStyles("MarkdownInlineCode", {
      padding: "0.125rem 0.375rem",
      color: "#text",
      fill: "#surface-2",
      preset: "code",
      fontSize: "0.875em",
      radius: "($radius * 0.65)",
    }),
  );

  useGlobalStyles(
    ".sl-markdown-content .td-code-block",
    resolveComponentStyles("MarkdownCodeBlock", {
      display: "block",
      position: "relative",
      minInlineSize: "0",
      Pre: {
        $: "> pre",
        margin: "0",
        padding: "0.875rem 3.75rem 0.875rem 1rem",
        overflowX: "auto",
        color: "#syntax-text",
        border: true,
        fill: "#syntax-bg",
        radius: "$card-radius",
        tabSize: "2",
      },
      CopyButton: {
        $: "> [data-copy-code]",
        position: "absolute",
        zIndex: "1",
        insetBlockStart: "$gap",
        insetInlineEnd: "$gap",
        margin: "0",
        display: "grid",
        placeItems: "center",
        inlineSize: "2rem",
        minInlineSize: "2rem",
        blockSize: "2rem",
        minBlockSize: "2rem",
        padding: "0",
        color: "#text-soft",
        border: true,
        fill: "#surface-2",
        radius: "$radius",
        preset: "small / strong",
        cursor: "pointer",
        transition: "color $transition, fill $transition",
      },
      HoverCopyButton: {
        $: "> [data-copy-code]:hover",
        color: "#text",
        fill: "#surface-2-hover",
      },
      CopiedButton: {
        $: '> [data-copy-code][data-copy-state="copied"]',
        color: "#green-text",
        borderColor: "#green",
      },
      CopyIcon: {
        $: "> [data-copy-code] > [data-copy-icon]",
        display: "block",
        inlineSize: "1rem",
        blockSize: "1rem",
        fill: "#current",
        mask: `url("${svgIconUrl(copyIcon)}") center / contain no-repeat`,
      },
      CopiedIcon: {
        $: '> [data-copy-code][data-copy-state="copied"] > [data-copy-icon]',
        mask: `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
    }),
  );

  useGlobalStyles(
    '.sl-markdown-content pre[data-language="mermaid"]:not(:where(.not-content *))',
    {
      padding: "0.875rem 1rem",
      overflowX: "auto",
      color: "#syntax-text",
      border: true,
      fill: "#syntax-bg",
      radius: "$card-radius",
      tabSize: "2",
    },
  );

  useGlobalStyles(".sl-markdown-content pre code", {
    padding: "0",
    color: "inherit",
    fill: "#clear",
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff", {
    paddingInline: "0",
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff code", {
    display: "block",
    inlineSize: "max-content",
    minInlineSize: "100%",
    lineHeight: "0",
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff .line", {
    display: "block",
    paddingInline: "1rem",
    lineHeight: "$code-line-height",
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff .line:empty::before", {
    content: '"\\200b"',
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff .td-diff-line--inserted", {
    fill: "#green-surface",
  });

  useGlobalStyles(".sl-markdown-content pre.td-diff .td-diff-line--deleted", {
    fill: "#red-surface",
  });

  useGlobalStyles(
    ".sl-markdown-content .td-mermaid",
    resolveComponentStyles("Mermaid", {
      display: "grid",
      placeItems: "center",
      minInlineSize: "0",
      padding: "($gap * 2)",
      overflowX: "auto",
      border: true,
      fill: "#surface-2",
      radius: "$card-radius",
      Diagram: {
        $: "> svg",
        $_text: "#text",
        "$_text-sec": "#text-soft",
        "$_text-muted": "#text-soft",
        "$_text-faint": "#text-muted",
        $_line: "#text-soft",
        $_arrow: "#accent-text",
        "$_node-fill": "#surface",
        "$_node-stroke": "#border-strong",
        "$_group-fill": "#surface-2",
        "$_group-hdr": "#surface",
        "$_inner-stroke": "#border",
        "$_key-badge": "#surface",
        display: "block",
        maxInlineSize: "100%",
        blockSize: "auto",
        margin: "auto",
      },
      Text: {
        $: "text",
        fontFamily: "$body-font-family",
      },
      MonoText: {
        $: ".mono",
        fontFamily: "$code-font-family",
      },
    }),
  );

  useGlobalStyles(
    ".sl-markdown-content blockquote:not(:where(.not-content *))",
    {
      paddingInlineStart: "($gap * 2)",
      color: "#text-soft",
      borderInlineStart: "$border-width solid #border-strong",
    },
  );

  useGlobalStyles(".sl-markdown-content hr:not(:where(.not-content *))", {
    border: "0",
    borderBlockEnd: "$border-width solid #border",
  });

  useGlobalStyles(".sl-markdown-content details:not(:where(.not-content *))", {
    paddingInlineStart: "($gap * 2)",
    borderInlineStart: "2px solid #border",
  });

  useGlobalStyles(
    ".sl-markdown-content details:not([open]):hover:not(:where(.not-content *)), .sl-markdown-content details:has(> summary:hover):not(:where(.not-content *))",
    {
      borderColor: "#accent-text",
    },
  );

  useGlobalStyles(".sl-markdown-content summary:not(:where(.not-content *))", {
    display: "block",
    marginInlineStart: "-0.5rem",
    paddingInlineStart: "0.5rem",
    color: "#text",
    preset: "strong",
  });

  useGlobalStyles(
    ".sl-markdown-content details[open] > summary:not(:where(.not-content *))",
    {
      marginBlockEnd: "($gap * 2)",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content summary:not(:where(.not-content *))::marker, .sl-markdown-content summary:not(:where(.not-content *))::-webkit-details-marker",
    {
      hide: true,
    },
  );

  useGlobalStyles(
    ".sl-markdown-content summary:not(:where(.not-content *))::before",
    {
      content: '""',
      display: "inline-block",
      inlineSize: "1.25rem",
      blockSize: "1.25rem",
      marginInlineEnd: "($gap * 0.5)",
      verticalAlign: "middle",
      fill: "#current",
      mask: `url("${svgIconUrl(chevronRightIcon)}") center / contain no-repeat`,
      transition: "rotate $transition",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content details[open] > summary:not(:where(.not-content *))::before",
    {
      rotate: "90deg",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content .sl-heading-wrapper",
    resolveComponentStyles("MarkdownHeading", {
      position: "relative",
      preset: "heading",
      Heading: {
        $: "> :first-child",
        display: "inline",
        paddingInlineEnd: { "": "0", "@mobile": "1.75rem" },
      },
      Heading1: { $: "&.level-h1", preset: "h1" },
      Heading2: { $: "&.level-h2", preset: "h2" },
      Heading3: { $: "&.level-h3", preset: "h3" },
      Heading4: { $: "&.level-h4", preset: "h4" },
      Heading5: { $: "&.level-h5", preset: "h5" },
      Heading6: { $: "&.level-h6", preset: "h6" },
      Link: {
        $: "> .sl-anchor-link",
        position: { "": "absolute", "@mobile": "relative" },
        insetBlockStart: {
          "": "calc((1lh - 1.75rem) / 2)",
          "@mobile": "auto",
        },
        insetInlineStart: { "": "-2rem", "@mobile": "auto" },
        display: "inline-grid",
        placeItems: "center",
        inlineSize: { "": "1.75rem", "@mobile": "1.5rem" },
        blockSize: { "": "1.75rem", "@mobile": "1.5rem" },
        marginInlineStart: { "": "0", "@mobile": "-1.5rem" },
        verticalAlign: { "": "baseline", "@mobile": "middle" },
        color: "#text-muted",
        opacity: {
          "": "1",
          "@media(hover: hover)": "0",
          "@mobile": "1",
        },
        radius: "$radius",
        userSelect: "none",
        textDecoration: "none",
        transition: "color $transition, fill $transition, opacity $transition",
      },
      RevealedLink: {
        $: "&:hover > .sl-anchor-link, > .sl-anchor-link:focus-visible",
        opacity: "1",
      },
      HoverLink: {
        $: "> .sl-anchor-link:hover, > .sl-anchor-link:focus-visible",
        color: "#accent-text",
        fill: "#surface-2-hover",
      },
      LinkIcon: {
        $: "> .sl-anchor-link .sl-anchor-icon, > .sl-anchor-link svg",
        display: "block",
        inlineSize: "clamp(1rem, 0.65em, 1.5rem)",
        blockSize: "clamp(1rem, 0.65em, 1.5rem)",
      },
      CopiedLink: {
        $: '> .sl-anchor-link[data-copy-state="copied"]',
        color: "#green-text",
        opacity: "1",
      },
      CopiedLinkIcon: {
        $: '> .sl-anchor-link[data-copy-state="copied"] > .sl-anchor-icon',
        visibility: "hidden",
      },
      CopiedIcon: {
        $: '> .sl-anchor-link[data-copy-state="copied"]::after',
        content: '""',
        position: "absolute",
        inlineSize: "clamp(1rem, 0.65em, 1.5rem)",
        blockSize: "clamp(1rem, 0.65em, 1.5rem)",
        fill: "#current",
        mask: `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
    }),
  );

  useGlobalStyles(".starlight-aside", {
    padding: "($gap * 2) ($gap * 2.5)",
    color: "#text-soft",
    border: true,
    radius: "$card-radius",
    fill: "#surface-2",
  });

  useGlobalStyles(".starlight-aside__title", {
    display: "flex",
    alignItems: "center",
    gap: "$gap",
    margin: "0 0 $gap",
    color: "#text",
    preset: "strong",
  });

  useGlobalStyles(".starlight-aside__icon", {
    flexShrink: "0",
    color: "#accent-text",
  });

  useGlobalStyles(".starlight-aside__content > :first-child", {
    marginBlockStart: "0",
  });

  useGlobalStyles(".card", {
    display: "flex",
    flow: "column",
    gap: "clamp(0.5rem, calc(0.125rem + 1vw), 1rem)",
    padding: "clamp(1rem, calc(0.125rem + 3vw), 2.5rem)",
    border: true,
    radius: "$card-radius",
    fill: "#surface-2",
  });

  useGlobalStyles(".card > .title", {
    display: "flex",
    alignItems: "center",
    gap: "($gap * 2)",
    margin: "0",
    color: "#text",
    preset: "h4 / strong",
  });

  useGlobalStyles(".sl-link-card", {
    position: "relative",
    display: "grid",
    gridColumns: "1fr auto",
    gap: "$gap",
    padding: "($gap * 2)",
    border: true,
    radius: "$card-radius",
    fill: "#surface-2",
  });

  useGlobalStyles(".sl-link-card:hover", {
    fill: "#surface-2-hover",
  });

  useGlobalStyles(".sl-link-card .stack", {
    display: "flex",
    flow: "column",
    gap: "$gap",
  });

  useGlobalStyles(".sl-link-card a", {
    color: "#text",
    preset: "strong",
    textDecoration: "none",
  });

  useGlobalStyles(".sl-link-card a::before", {
    content: '""',
    position: "absolute",
    inset: "0",
  });

  useGlobalStyles(".sl-link-card .description, .sl-link-card .icon", {
    color: "#text-muted",
  });

  useGlobalStyles(".sl-badge", {
    display: "inline-block",
    padding: "0.175rem 0.35rem",
    color: "#text-soft",
    border: true,
    radius: "$radius",
    fill: "#surface-3",
    preset: "code",
    fontSize: "$small-font-size",
    lineHeight: "1",
    overflowWrap: "anywhere",
  });

  useGlobalStyles(".sl-steps", {
    listStyle: "none",
    counterReset: "steps-counter",
    paddingInlineStart: "0",
  });

  useGlobalStyles(".sl-steps > li", {
    counterIncrement: "steps-counter",
    position: "relative",
    minBlockSize: "2rem",
    paddingInlineStart: "3rem",
    paddingBlockEnd: "1px",
  });

  useGlobalStyles(".sl-steps > li::before", {
    content: "counter(steps-counter)",
    position: "absolute",
    insetBlockStart: "0",
    insetInlineStart: "0",
    display: "grid",
    placeItems: "center",
    inlineSize: "2rem",
    blockSize: "2rem",
    color: "#text",
    border: true,
    radius: "999px",
    fill: "#surface-3",
    preset: "small / strong",
  });

  useGlobalStyles(".sl-steps > li::after", {
    content: '""',
    position: "absolute",
    insetBlock: "2.5rem $gap",
    insetInlineStart: "(1rem - ($border-width / 2))",
    inlineSize: "$border-width",
    fill: "#border",
  });

  useGlobalStyles("site-search", { display: "contents" });

  useGlobalStyles(
    "site-search button[data-open-modal]",
    resolveComponentStyles("SearchButton", {
      display: "flex",
      alignItems: "center",
      justifyContent: { "": "flex-start", "@mobile": "center" },
      gap: "$gap",
      inlineSize: { "": "100%", "@mobile": "$docs-menu-button-size" },
      maxInlineSize: "22rem",
      blockSize: { "": "$control-height", "@mobile": "$docs-menu-button-size" },
      minBlockSize: "0",
      padding: { "": "0 $gap 0 ($gap * 1.5)", "@mobile": "0" },
      color: "#text-soft",
      border: { "": true, "@mobile": "0" },
      radius: "$radius",
      fill: { "": "#surface", "@mobile": "#clear" },
      preset: "small",
      shadow: "none",
      cursor: "pointer",
      transition: "color $transition, fill $transition",
      Label: { $: "> span", hide: { "": false, "@mobile": true } },
      Shortcut: {
        $: "> kbd",
        display: "flex",
        hide: { "": false, "@narrow-layout": true },
        gap: "0.25em",
        inlineMargin: "auto start",
        inlinePadding: "0.375rem",
        fill: "#surface-3",
        preset: "small",
        radius: "($radius * 0.75)",
      },
      Hover: { $: "&:hover", color: "#text", fill: "#surface-2-hover" },
      Active: { $: "&:active", color: "#text", fill: "#surface-2-pressed" },
      NativeIcon: { $: "> svg", hide: true },
      Icon: {
        $: "&::before",
        content: '""',
        display: "block",
        flexShrink: "0",
        inlineSize: { "": "1rem", "@mobile": "1.25rem" },
        blockSize: { "": "1rem", "@mobile": "1.25rem" },
        fill: "#current",
        mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
      },
    }),
  );

  useGlobalStyles(".pagination-links a", {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "$gap",
    inlineSize: "100%",
    padding: "($gap * 2)",
    border: "$border-width solid #border",
    color: "#text-soft",
    fill: "#surface-2",
    boxShadow: "none",
    transition: "color $transition, background-color $transition",
    textDecoration: "none",
    overflowWrap: "anywhere",
  });

  useGlobalStyles('.pagination-links a[rel="next"]', {
    justifyContent: "flex-start",
    textAlign: "end",
  });

  useGlobalStyles('.pagination-links a[rel="next"]::before', {
    order: "1",
  });

  useGlobalStyles('.pagination-links a[rel="next"] > span', {
    marginInlineStart: "auto",
    textAlign: "end",
  });

  useGlobalStyles(".pagination-links a:hover", {
    borderColor: "#border",
    fill: "#surface-2-hover",
  });

  useGlobalStyles(".pagination-links a:active", {
    fill: "#surface-2-pressed",
  });

  useGlobalStyles(".pagination-links .link-title", {
    color: "#text",
    preset: "h5 / strong",
  });

  useGlobalStyles(
    "starlight-lang-select",
    resolveComponentStyles("LanguageSelect", {
      display: "block",
      Label: {
        $: "label",
        position: "relative",
        display: "flex",
        alignItems: "center",
        color: "#text-soft",
      },
      HoverLabel: { $: "label:hover", color: "#text" },
      LabelIcon: {
        $: ".label-icon",
        position: "absolute",
        zIndex: "1",
        insetInlineStart: "$gap",
        pointerEvents: "none",
      },
      Select: {
        $: "select",
        appearance: "none",
        inlineSize: "8rem",
        minBlockSize: "$control-height",
        paddingInlineStart: "($gap * 3.5)",
        paddingInlineEnd: "($gap * 3.5)",
        color: "#text-soft",
        border: "0",
        fill: "#clear",
        preset: "small",
        cursor: "pointer",
        textOverflow: "ellipsis",
      },
      Caret: {
        $: ".caret",
        position: "absolute",
        insetInlineEnd: "$gap",
        pointerEvents: "none",
      },
      Option: {
        $: "option",
        color: "#text",
        fill: "#surface-2",
      },
    }),
  );

  useGlobalStyles(".td-header__social a, .td-mobile-preferences__social a", {
    color: "#accent-text",
  });

  useGlobalStyles(
    ".td-header__social a:hover, .td-mobile-preferences__social a:hover",
    {
      color: "#text",
    },
  );

  useGlobalStyles("main .pagination-links", {
    display: "grid",
    gap: "($gap * 2)",
    gridTemplateColumns: {
      "": "repeat(2, minmax(0, 1fr))",
      "@small": "1fr",
    },
  });

  useGlobalStyles('main .pagination-links a[rel="next"]:first-child', {
    gridColumn: {
      "": "2",
      "@small": "1",
    },
  });

  useGlobalStyles(".pagination-links a > svg", {
    hide: true,
  });

  useGlobalStyles(
    "site-search button[data-close-modal]::before, .pagination-links a::before",
    {
      content: '""',
      display: "block",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
    },
  );

  useGlobalStyles("site-search button[data-close-modal]::before", {
    mask: `url("${svgIconUrl(closeIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles(".pagination-links a::before", {
    mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    inlineSize: "1.25rem",
    blockSize: "1.25rem",
  });

  useGlobalStyles('.pagination-links a[rel="next"]::before', {
    mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles('[dir="rtl"] .pagination-links a[rel="prev"]::before', {
    mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles('[dir="rtl"] .pagination-links a[rel="next"]::before', {
    mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles("site-search dialog", {
    inlineSize: { "": "90%", "@mobile": "100%" },
    maxInlineSize: { "": "40rem", "@mobile": "100%" },
    blockSize: { "": "max-content", "@mobile": "100%" },
    maxBlockSize: { "": "(100% - 8rem)", "@mobile": "100%" },
    minBlockSize: { "": "15rem", "@mobile": "100%" },
    margin: { "": "4rem auto auto", "@mobile": "0" },
    padding: "0",
    color: "#text",
    border: true,
    radius: { "": "$card-radius", "@mobile": "0" },
    fill: "#surface",
    shadow: "0 1rem 3rem #shadow",
  });

  useGlobalStyles("site-search dialog[open]", {
    display: "flex",
  });

  useGlobalStyles("site-search dialog::backdrop", {
    fill: "#overlay",
    backdropFilter: "blur(0.25rem)",
  });

  useGlobalStyles("site-search .dialog-frame", {
    position: "relative",
    display: "flex",
    flow: "column",
    flexGrow: "1",
    gap: "($gap * 2)",
    padding: { "": "($gap * 3)", "@mobile": "($gap * 2)" },
    overflow: "auto",
  });

  useGlobalStyles("site-search .search-container", {
    inlineSize: "100%",
    paddingBlockStart: { "": "0", "@mobile": "4rem" },
  });

  useGlobalStyles("site-search button[data-close-modal]", {
    position: "absolute",
    zIndex: "1",
    insetBlockStart: "($gap * 2)",
    insetInlineEnd: "($gap * 2)",
    display: { "": "none", "@mobile": "flex" },
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    blockSize: "3rem",
    minBlockSize: "3rem",
    paddingInlineStart: "0.625rem",
    paddingInlineEnd: "0.625rem",
    color: "#text-soft",
    border: true,
    borderColor: "#border",
    radius: "$radius",
    fill: "#surface-3",
    preset: "small / strong",
    boxShadow: "none",
    cursor: "pointer",
    transition: "color $transition, background-color $transition",
  });

  useGlobalStyles("site-search button[data-close-modal]:hover", {
    color: "#text",
    fill: "#surface-3-hover",
  });

  useGlobalStyles("site-search button[data-close-modal]:active", {
    color: "#text",
    fill: "#surface-3-pressed",
  });

  useGlobalStyles("#starlight__search", {
    "$pagefind-ui-primary": "#accent-text",
    "$pagefind-ui-text": "#text-soft",
    "$pagefind-ui-font": "$body-font-family",
    "$pagefind-ui-background": "#surface",
    "$pagefind-ui-border": "#border",
    "$pagefind-ui-border-width": "$border-width",
    "$pagefind-ui-tag": "#surface-3",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__form", {
    position: "relative",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-input", {
    inlineSize: "100%",
    minBlockSize: "3rem",
    paddingInlineStart: "2.75rem",
    paddingInlineEnd: "2.75rem",
    color: "#text",
    border: true,
    radius: "$radius",
    fill: "#surface",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-clear", {
    position: "absolute",
    insetBlockStart: "0",
    insetInlineEnd: "0",
    inlineSize: "3rem",
    blockSize: "3rem",
    padding: "0",
    color: "#text-soft",
    border: "0",
    fill: "#clear",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__results-area", {
    marginBlockStart: "($gap * 3)",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__result", {
    paddingBlockStart: "($gap * 2)",
    paddingBlockEnd: "($gap * 2)",
    borderBlockStart: "$border-width solid #border",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__result-link", {
    color: "#text",
    preset: "strong",
  });

  useGlobalStyles("[data-search-modal-open]", {
    overflow: "hidden",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-input", {
    borderColor: "#border",
    fill: "#surface",
    boxShadow: "none",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__form::before", {
    content: '""',
    position: "absolute",
    zIndex: "1",
    insetBlockStart: "1rem",
    insetInlineStart: "1rem",
    display: "block",
    inlineSize: "1rem",
    blockSize: "1rem",
    fill: "#text-soft",
    mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
    pointerEvents: "none",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-clear::before", {
    content: '""',
    display: "block",
    inlineSize: "1rem",
    blockSize: "1rem",
    fill: "#current",
    mask: `url("${svgIconUrl(closeIcon)}") center / 1rem no-repeat`,
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-clear", {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0",
    cursor: "pointer",
  });

  useGlobalStyles(
    "#starlight__search .pagefind-ui__search-clear.pagefind-ui__suppressed",
    {
      display: "none",
    },
  );

  useGlobalStyles(
    ".sl-menu-button",
    resolveComponentStyles("MobileMenuToggle", {
      display: { "": "none", "@mobile": "flex" },
      alignItems: "center",
      gap: "$gap",
      inlineSize: "100%",
      blockSize: "3rem",
      minBlockSize: "0",
      flexShrink: "0",
      padding: "0",
      border: "0",
      blockBorder: "$border-width solid #border start",
      radius: "0",
      color: "#text-soft",
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
    }),
  );

  useGlobalStyles(
    ".sl-markdown-content :where(code):not(:where(.not-content *))",
    {
      radius: "($radius * 0.65)",
    },
  );

  useGlobalStyles(".sl-markdown-content :where(blockquote, details)", {
    borderColor: "#border",
  });

  useGlobalStyles(
    ".sl-markdown-content",
    resolveComponentStyles("MarkdownTable", {
      Table: {
        $: "table",
        inlineSize: "100%",
        borderCollapse: "separate",
        borderSpacing: "0",
        color: "#text-soft",
        preset: "small",
        border: true,
        borderColor: "#border",
        radius: "$card-radius",
      },
      Cell: {
        $: "th, td",
        padding: "($gap * 1.5) ($gap * 2)",
        verticalAlign: "top",
        borderColor: "#border",
      },
      LastBodyRowCell: {
        $: "tbody td",
        borderBlockEnd: {
          "@own(:is(tbody tr:last-child > td))": "0",
        },
      },
      HeaderCell: {
        $: "th",
        color: "#text",
        fill: "#surface-2",
        textAlign: "start",
        radius: {
          "@own(:is(thead:first-child tr:first-child > th) & :first-child & !:last-child)":
            "($card-radius - $border-width) top-left",
          "@own(:is(thead:first-child tr:first-child > th) & !:first-child & :last-child)":
            "($card-radius - $border-width) top-right",
          "@own(:is(thead:first-child tr:first-child > th) & :first-child & :last-child)":
            "($card-radius - $border-width) top",
        },
      },
    }),
  );

  useGlobalStyles(".sl-markdown-content .td-table-scroll", {
    inlineSize: "100%",
    maxInlineSize: "100%",
    overflow: "auto",
    scrollbarWidth: "thin",
  });

  useGlobalStyles("*, *::before, *::after", {
    scrollBehavior: {
      "@reduced-motion": "auto",
    },
    transitionDuration: {
      "@reduced-motion": "0.01ms",
    },
  });

  return null;
}
