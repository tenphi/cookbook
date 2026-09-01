import { useFontFace, useGlobalStyles } from "@tenphi/tasty";
import jetBrainsMonoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import chevronRightIcon from "../icons/chevron-right.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import searchIcon from "../icons/search.svg?raw";
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

  useGlobalStyles(":root", {
    colorScheme: "dark",
    "$docs-nav-height": "4.5rem",
    "$docs-nav-pad-x": "clamp(1.25rem, 2.5vw, 2rem)",
    "$docs-nav-gap": "0.75rem",
    "$docs-sidebar-pad-x": "1.5rem",
    "$docs-content-pad-x": "clamp(1.5rem, 4vw, 4rem)",
    "$docs-menu-button-size": "2.5rem",
    "$docs-mobile-toc-height": "0rem",
  });

  useGlobalStyles(":root:has(.td-top-tabs)", {
    "$docs-nav-height": "7rem",
  });

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

  useGlobalStyles(":where(img, picture, video, canvas, svg, iframe)", {
    maxInlineSize: "100%",
  });

  useGlobalStyles(":where(img, picture, video, canvas, svg)", {
    blockSize: "auto",
  });

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

  useGlobalStyles("html, body, button, input, select, textarea", {
    fontFamily: "$body-font-family",
  });

  useGlobalStyles("body", {
    color: "#text",
    fill: "#surface",
    fontSize: "$body-font-size",
    fontWeight: "$body-font-weight",
    lineHeight: "$body-line-height",
    letterSpacing: "$body-letter-spacing",
  });

  useGlobalStyles("a", {
    color: "#accent-text",
  });

  useGlobalStyles(".page", {
    display: "flex",
    flow: "column",
    minBlockSize: "100vh",
  });

  useGlobalStyles("body > .page > .header", {
    position: "fixed",
    zIndex: "10",
    inset: "0 0 auto",
    inlineSize: "100%",
    blockSize: "$docs-nav-height",
    padding: "0 $docs-nav-pad-x",
    borderBlockEnd: "$border-width solid #border",
    fill: "#surface",
  });

  useGlobalStyles(".sidebar-pane", {
    visibility: { "": "visible", "@mobile": "hidden" },
    position: "fixed",
    zIndex: { "": "8", "@mobile": "12" },
    insetBlockStart: "$docs-nav-height",
    insetBlockEnd: "0",
    insetInlineStart: "0",
    inlineSize: { "": "$sidebar-width", "@mobile": "100%" },
    overflowY: "auto",
    scrollbarGutter: "stable",
    borderInlineEnd: {
      "": "$border-width solid #border",
      "@mobile": "0",
    },
    fill: "#surface",
  });

  useGlobalStyles(
    'starlight-menu-button[aria-expanded="true"] ~ .sidebar-pane',
    {
      visibility: { "@mobile": "visible" },
    },
  );

  useGlobalStyles(".sidebar-content", {
    display: "flex",
    flow: "column",
    gap: "($gap * 2)",
    minBlockSize: "100%",
    padding: "($gap * 2) $docs-sidebar-pad-x ($gap * 6)",
  });

  useGlobalStyles("starlight-menu-button", {
    display: { "": "none", "@mobile": "block" },
    position: { "@mobile": "fixed" },
    zIndex: { "@mobile": "11" },
    insetBlockStart: {
      "@mobile": "(($docs-nav-height - $docs-menu-button-size) / 2)",
    },
    insetInlineEnd: { "@mobile": "$docs-nav-pad-x" },
  });

  useGlobalStyles(".main-frame", {
    minInlineSize: "0",
    paddingBlockStart: "($docs-nav-height + $docs-mobile-toc-height)",
    paddingInlineStart: "0",
  });

  useGlobalStyles("[data-has-sidebar] .main-frame", {
    paddingInlineStart: { "": "$sidebar-width", "@mobile": "0" },
  });

  useGlobalStyles(".main-frame > .lg\\:sl-flex", {
    display: { "": "flex", "@narrow-layout": "block" },
    minInlineSize: "0",
  });

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

  useGlobalStyles(".right-sidebar-container", {
    order: "2",
    position: "relative",
    inlineSize: {
      "": "max($sidebar-width, calc($sidebar-width + (100% - $content-width - $sidebar-width) / 2))",
      "@narrow-layout": "100%",
    },
  });

  useGlobalStyles(".right-sidebar", {
    position: { "": "fixed", "@narrow-layout": "static" },
    insetBlockStart: { "": "0", "@narrow-layout": "auto" },
    inlineSize: { "": "inherit", "@narrow-layout": "100%" },
    blockSize: { "": "100vh", "@narrow-layout": "auto" },
    paddingBlockStart: {
      "": "$docs-nav-height",
      "@narrow-layout": "0",
    },
    overflowY: { "": "auto", "@narrow-layout": "visible" },
    borderInlineStart: {
      "": "$border-width solid #border",
      "@narrow-layout": "0",
    },
    scrollbarWidth: "none",
  });

  useGlobalStyles(".lg\\:sl-hidden", {
    display: { "": "none", "@narrow-layout": "block" },
  });

  useGlobalStyles(".right-sidebar-panel", {
    display: { "": "block", "@narrow-layout": "none" },
  });

  useGlobalStyles(".md\\:sl-hidden", {
    display: { "": "none", "@mobile": "block" },
  });

  useGlobalStyles("main", {
    padding: "0 0 5rem",
  });

  useGlobalStyles(".content-panel + .content-panel", {
    borderBlockStart: "$border-width solid #border",
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
    fontWeight: "$body-bold-font-weight",
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
    fontFamily: "$heading-font-family",
    fontWeight: "$heading-font-weight",
    letterSpacing: "$heading-letter-spacing",
    textWrap: "balance",
  });

  useGlobalStyles("h1", {
    fontSize: "$h1-font-size",
    lineHeight: "$h1-line-height",
    letterSpacing: "$h1-letter-spacing",
  });

  useGlobalStyles("h2", {
    fontSize: "$h2-font-size",
    lineHeight: "$h2-line-height",
    letterSpacing: "$h2-letter-spacing",
  });

  useGlobalStyles("h3", {
    fontSize: "$h3-font-size",
    lineHeight: "$h3-line-height",
    letterSpacing: "$h3-letter-spacing",
  });

  useGlobalStyles("h4", {
    fontSize: "$h4-font-size",
    lineHeight: "$h4-line-height",
    letterSpacing: "$h4-letter-spacing",
  });

  useGlobalStyles("h5", {
    fontSize: "$h5-font-size",
    lineHeight: "$h5-line-height",
    letterSpacing: "$h5-letter-spacing",
  });

  useGlobalStyles("h6", {
    fontSize: "$h6-font-size",
    lineHeight: "$h6-line-height",
    letterSpacing: "$h6-letter-spacing",
  });

  useGlobalStyles(":where(code, kbd, samp, pre)", {
    fontFamily: "$code-font-family",
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
    'site-search button[data-open-modal], site-search dialog, .pagination-links a, a[aria-current="page"]',
    { radius: "$radius" },
  );

  useGlobalStyles(
    '#starlight__sidebar a[aria-current="page"], #starlight__sidebar a[aria-current="page"]:hover, #starlight__sidebar a[aria-current="page"]:focus',
    {
      color: "#accent-text",
      fill: "#accent-surface-subtle",
    },
  );

  useGlobalStyles("body > .page > .header, .sidebar-pane", {
    fill: "#surface",
  });

  useGlobalStyles("#starlight__sidebar .sidebar-content", {
    gap: "($gap * 3)",
    paddingBlockStart: "($gap * 4)",
    paddingBlockEnd: "($gap * 6)",
  });

  useGlobalStyles("#starlight__sidebar ul", {
    padding: "0",
    listStyle: "none",
  });

  useGlobalStyles("#starlight__sidebar li", {
    overflowWrap: "anywhere",
  });

  useGlobalStyles("#starlight__sidebar .top-level > li + li", {
    marginBlockStart: "($gap * 3)",
  });

  useGlobalStyles("#starlight__sidebar ul ul li", {
    marginInlineStart: "($gap * 0.75)",
    paddingInlineStart: "($gap * 0.75)",
    borderInlineStart: "0",
  });

  useGlobalStyles("#starlight__sidebar :where(summary, a)", {
    padding: "($gap * 0.8) ($gap * 1.25)",
    color: "#text-soft",
    lineHeight: "1.45",
    radius: "$radius",
    textDecoration: "none",
  });

  useGlobalStyles("#starlight__sidebar summary", {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none",
  });

  useGlobalStyles("#starlight__sidebar a", {
    display: "block",
    fill: "#surface",
  });

  useGlobalStyles(
    "#starlight__sidebar a:hover, #starlight__sidebar a:focus-visible, #starlight__sidebar summary:hover",
    {
      color: "#text",
      fill: "#surface-2-hover",
    },
  );

  useGlobalStyles("#starlight__sidebar summary::marker", {
    hide: true,
  });

  useGlobalStyles("#starlight__sidebar a", {
    fontSize: "0.9375rem",
  });

  useGlobalStyles("#starlight__sidebar .large", {
    fontSize: "0.9375rem",
    fontWeight: "$body-bold-font-weight",
    color: "#text",
  });

  useGlobalStyles(".right-sidebar-panel", {
    paddingBlockStart: "($gap * 5)",
  });

  useGlobalStyles(".right-sidebar-panel h2", {
    marginBlockEnd: "$gap",
    color: "#text",
    fontSize: "0.9375rem",
    fontWeight: "$body-bold-font-weight",
    lineHeight: "$heading-line-height",
  });

  useGlobalStyles(".right-sidebar-panel a", {
    display: "block",
    paddingBlockStart: "($gap * 0.5)",
    paddingBlockEnd: "($gap * 0.5)",
    color: "#text-muted",
    fontSize: "$small-font-size",
    lineHeight: "1.45",
    textDecoration: "none",
    overflowWrap: "anywhere",
  });

  useGlobalStyles(".right-sidebar-panel a:hover", {
    color: "#text",
  });

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
    ".sl-markdown-content :not(a, strong, em, del, span, input, code, br) + :not(a, strong, em, del, span, input, code, br, :where(.not-content *))",
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
    fontWeight: "$body-bold-font-weight",
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
    {
      padding: "0.125rem 0.375rem",
      color: "#text",
      fill: "#surface-2",
      fontSize: "$small-font-size",
      radius: "($radius * 0.65)",
    },
  );

  useGlobalStyles(".sl-markdown-content pre:not(:where(.not-content *))", {
    padding: "0.875rem 1rem",
    overflowX: "auto",
    color: "#text-soft",
    border: true,
    fill: "#surface-2",
    fontSize: "$code-font-size",
    lineHeight: "$code-line-height",
    radius: "$card-radius",
    tabSize: "2",
  });

  useGlobalStyles(".sl-markdown-content pre code", {
    padding: "0",
    color: "inherit",
    fill: "#clear",
    fontFamily: "$code-font-family",
    fontSize: "inherit",
    lineHeight: "inherit",
  });

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
    fontWeight: "$body-bold-font-weight",
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
      transition: "rotate 120ms ease",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content details[open] > summary:not(:where(.not-content *))::before",
    {
      rotate: "90deg",
    },
  );

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper", {
    lineHeight: "$heading-line-height",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h1", {
    fontSize: "$h1-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h2", {
    fontSize: "$h2-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h3", {
    fontSize: "$h3-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h4", {
    fontSize: "$h4-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h5", {
    fontSize: "$h5-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper.level-h6", {
    fontSize: "$h6-font-size",
  });

  useGlobalStyles(".sl-markdown-content .sl-heading-wrapper > :first-child", {
    display: "inline",
    paddingInlineEnd: "1.1em",
  });

  useGlobalStyles(".sl-markdown-content .sl-anchor-link", {
    position: "relative",
    display: "inline-flex",
    marginInlineStart: "-0.85em",
    color: "#text-muted",
    userSelect: "none",
    textDecoration: "none",
  });

  useGlobalStyles(".sl-markdown-content .sl-anchor-link:hover", {
    color: "#accent-text",
  });

  useGlobalStyles(".sl-markdown-content .sl-anchor-icon > svg", {
    display: "inline",
    inlineSize: "0.8275em",
    verticalAlign: "middle",
  });

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
    fontWeight: "$body-bold-font-weight",
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
    fontWeight: "$body-bold-font-weight",
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
    fontFamily: "$code-font-family",
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
    fontSize: "$small-font-size",
    fontWeight: "$body-bold-font-weight",
  });

  useGlobalStyles(".sl-steps > li::after", {
    content: '""',
    position: "absolute",
    insetBlock: "2.5rem $gap",
    insetInlineStart: "(1rem - ($border-width / 2))",
    inlineSize: "$border-width",
    fill: "#border",
  });

  useGlobalStyles("site-search button[data-open-modal]", {
    display: "flex",
    alignItems: "center",
    gap: "$gap",
    inlineSize: "100%",
    maxInlineSize: "22rem",
    blockSize: "$control-height",
    paddingInlineStart: "($gap * 1.5)",
    paddingInlineEnd: "$gap",
    color: "#text-soft",
    border: true,
    fill: "#surface",
    fontSize: "$small-font-size",
    boxShadow: "none",
    cursor: "pointer",
    transition: "color 120ms ease, background-color 120ms ease",
  });

  useGlobalStyles("site-search", {
    display: "contents",
  });

  useGlobalStyles("site-search button[data-open-modal] > :last-child", {
    marginInlineStart: "auto",
  });

  useGlobalStyles("site-search button[data-open-modal] > kbd", {
    display: { "": "flex", "@mobile": "none" },
    gap: "0.25em",
    paddingInlineStart: "0.375rem",
    paddingInlineEnd: "0.375rem",
    fill: "#surface-3",
    fontFamily: "$body-font-family",
    fontSize: "0.75rem",
    radius: "($radius * 0.75)",
  });

  useGlobalStyles("site-search button[data-open-modal]:hover", {
    borderColor: "#border",
    fill: "#surface-2-hover",
  });

  useGlobalStyles("site-search button[data-open-modal]:active", {
    fill: "#surface-2-pressed",
  });

  useGlobalStyles(".pagination-links a", {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "$gap",
    inlineSize: "100%",
    padding: "($gap * 2)",
    borderWidth: "$border-width",
    borderColor: "#border",
    color: "#text-soft",
    fill: "#surface-2",
    boxShadow: "none",
    transition: "color 120ms ease, background-color 120ms ease",
    textDecoration: "none",
    overflowWrap: "anywhere",
  });

  useGlobalStyles('.pagination-links a[rel="next"]', {
    flow: "row-reverse",
    justifyContent: "flex-start",
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

  useGlobalStyles("main footer", {
    display: "flex",
    flow: "column",
    gap: "($gap * 3)",
  });

  useGlobalStyles("main footer .meta", {
    display: "flex",
    flow: "row wrap",
    justifyContent: "space-between",
    gap: "($gap * 1.5) ($gap * 6)",
    marginBlockStart: "($gap * 6)",
    color: "#text-muted",
    preset: "small",
  });

  useGlobalStyles("main footer .meta a, main footer .kudos", {
    display: "flex",
    alignItems: "center",
    gap: "$gap",
    color: "#text-muted",
    textDecoration: "none",
  });

  useGlobalStyles("main footer .meta a:hover, main footer .kudos:hover", {
    color: "#text",
  });

  useGlobalStyles("main footer .kudos", {
    margin: "($gap * 3) auto",
    preset: "small",
  });

  useGlobalStyles("starlight-lang-select label", {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "($gap * 0.5)",
    color: "#text-soft",
  });

  useGlobalStyles("starlight-lang-select label:hover", {
    color: "#text",
  });

  useGlobalStyles("starlight-lang-select select", {
    color: "#text-soft",
    border: "0",
    fill: "#clear",
    cursor: "pointer",
  });

  useGlobalStyles("starlight-lang-select option", {
    color: "#text",
    fill: "#surface-2",
  });

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

  useGlobalStyles(
    "site-search button[data-open-modal] > svg, .pagination-links a > svg, mobile-starlight-toc .toggle > svg, #starlight__sidebar summary > svg.caret",
    {
      hide: true,
    },
  );

  useGlobalStyles(
    "site-search button[data-open-modal]::before, site-search button[data-close-modal]::before, .pagination-links a::before, mobile-starlight-toc .toggle::after, #starlight__sidebar summary::after",
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

  useGlobalStyles("site-search button[data-open-modal]::before", {
    mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
  });

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

  useGlobalStyles(
    "mobile-starlight-toc .toggle::after, #starlight__sidebar summary::after",
    {
      mask: `url("${svgIconUrl(chevronRightIcon)}") center / contain no-repeat`,
      transition: "rotate 120ms ease",
    },
  );

  useGlobalStyles(
    "mobile-starlight-toc details[open] .toggle::after, #starlight__sidebar details[open] > summary::after",
    {
      rotate: "90deg",
    },
  );

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
  });

  useGlobalStyles("site-search button[data-close-modal]", {
    position: "absolute",
    zIndex: "1",
    insetBlockStart: "($gap * 2)",
    insetInlineEnd: "($gap * 2)",
    display: { "": "none", "@mobile": "flex" },
    alignItems: "center",
    gap: "0.375rem",
    paddingInlineStart: "0.625rem",
    paddingInlineEnd: "0.625rem",
    color: "#text",
    border: true,
    radius: "$radius",
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
    fontWeight: "$body-bold-font-weight",
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
    inlineSize: "1rem",
    blockSize: "1rem",
    mask: `url("${svgIconUrl(searchIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-clear::before", {
    mask: `url("${svgIconUrl(closeIcon)}") center / 1rem no-repeat`,
  });

  useGlobalStyles(
    "starlight-menu-button button, mobile-starlight-toc .toggle",
    {
      color: "#text",
      border: true,
      radius: "$radius",
      fill: "#surface-3",
      transition: "color 120ms ease, background-color 120ms ease",
    },
  );

  useGlobalStyles("starlight-menu-button button", {
    alignItems: "center",
    justifyContent: "center",
    inlineSize: "$docs-menu-button-size",
    blockSize: "$docs-menu-button-size",
    minBlockSize: "0",
    padding: "0",
    color: "#text-soft",
    boxShadow: "none",
  });

  useGlobalStyles("starlight-menu-button button > svg", {
    inlineSize: "1.125rem",
    blockSize: "1.125rem",
  });

  useGlobalStyles(
    'starlight-menu-button[aria-expanded="true"] .open-menu, starlight-menu-button:not([aria-expanded="true"]) .close-menu',
    {
      hide: true,
    },
  );

  useGlobalStyles("[data-mobile-menu-expanded]", {
    overflow: { "": "auto", "@mobile": "hidden" },
  });

  useGlobalStyles(
    "starlight-menu-button button:hover, mobile-starlight-toc .toggle:hover, mobile-starlight-toc details[open] .toggle",
    {
      color: "#text",
      borderColor: "#border",
      fill: "#surface-3-hover",
    },
  );

  useGlobalStyles(
    'starlight-menu-button[aria-expanded="true"] button, starlight-menu-button[aria-expanded="true"] button:hover, starlight-menu-button button:active, mobile-starlight-toc .toggle:active',
    {
      color: "#text",
      borderColor: "#border",
      fill: "#surface-3-pressed",
      boxShadow: "none",
    },
  );

  useGlobalStyles("mobile-starlight-toc summary", {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "$gap",
    paddingInlineStart: "$docs-content-pad-x",
    paddingInlineEnd: "$docs-content-pad-x",
  });

  useGlobalStyles(
    "mobile-starlight-toc .toggle, mobile-starlight-toc .toggle:hover, mobile-starlight-toc details[open] .toggle, mobile-starlight-toc .toggle:active",
    {
      gap: "$gap",
      margin: "0",
      padding: "0",
      color: "#text-soft",
      fontSize: "$small-font-size",
      fontWeight: "$body-bold-font-weight",
      lineHeight: "$small-line-height",
      border: "0",
      radius: "0",
      fill: "#clear",
      boxShadow: "none",
    },
  );

  useGlobalStyles(
    "mobile-starlight-toc .toggle:hover, mobile-starlight-toc details[open] .toggle, mobile-starlight-toc .toggle:active",
    {
      color: "#text",
    },
  );

  useGlobalStyles("mobile-starlight-toc summary .toggle", {
    gap: "$gap",
    margin: "0",
  });

  useGlobalStyles("mobile-starlight-toc .dropdown", {
    position: "absolute",
    inset: "100% top",
    insetInlineStart: "$docs-content-pad-x",
    zIndex: "1",
    display: "block",
    inlineSize: "min(22rem, (100% - ($docs-content-pad-x * 2)))",
    maxBlockSize:
      "min(24rem, (100vh - ($docs-mobile-toc-height + ($gap * 4))))",
    margin: "$gap 0 0",
    padding: "4px",
    overflow: "auto",
    color: "#text",
    border: true,
    radius: "$card-radius",
    fill: "#surface-2",
    shadow: "0 0.75rem 2rem #shadow",
  });

  useGlobalStyles("mobile-starlight-toc nav", {
    position: "fixed",
    zIndex: "9",
    insetBlockStart: "($docs-nav-height - $border-width)",
    insetInlineStart: {
      "": "0",
      "@medium-layout": "$sidebar-width",
    },
    insetInlineEnd: "0",
    fill: "#surface",
  });

  useGlobalStyles("mobile-starlight-toc details", {
    position: "relative",
  });

  useGlobalStyles("mobile-starlight-toc .display-current", {
    minInlineSize: "0",
    overflow: "hidden",
    color: "#text",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });

  useGlobalStyles("mobile-starlight-toc .dropdown .isMobile", {
    display: "grid",
    gap: "1px",
  });

  useGlobalStyles("mobile-starlight-toc .dropdown .isMobile a", {
    display: "flex",
    alignItems: "center",
    minBlockSize: "2.5rem",
    padding: "0.625rem 0.75rem",
    color: "#text-soft",
    radius: "$radius",
    fill: "#surface-2",
    textDecoration: "none",
  });

  useGlobalStyles("mobile-starlight-toc .dropdown .isMobile a:hover", {
    color: "#text",
    fill: "#surface-2-hover",
  });

  useGlobalStyles(
    'mobile-starlight-toc .dropdown .isMobile a[aria-current="true"]',
    {
      color: "#accent-text",
      fill: "#accent-surface-2-subtle",
    },
  );

  useGlobalStyles(
    'mobile-starlight-toc .dropdown .isMobile a[aria-current="true"]::after',
    {
      blockSize: "1rem",
    },
  );

  useGlobalStyles(
    ".sl-markdown-content :where(code):not(:where(.not-content *))",
    {
      radius: "($radius * 0.65)",
    },
  );

  useGlobalStyles(".sl-markdown-content :where(table, blockquote, details)", {
    borderColor: "#border",
  });

  useGlobalStyles(".sl-markdown-content table", {
    inlineSize: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "auto",
    color: "#text-soft",
    fontSize: "$small-font-size",
    lineHeight: "$small-line-height",
    border: true,
    radius: "$card-radius",
    scrollbarWidth: "thin",
  });

  useGlobalStyles(".sl-markdown-content :where(th, td)", {
    padding: "($gap * 1.5) ($gap * 2)",
    verticalAlign: "top",
    borderColor: "#border",
  });

  useGlobalStyles(".sl-markdown-content :where(th, td):first-child", {
    paddingInlineStart: "($gap * 2)",
  });

  useGlobalStyles(".sl-markdown-content :where(th, td):last-child", {
    paddingInlineEnd: "($gap * 2)",
  });

  useGlobalStyles(".sl-markdown-content tbody tr:last-child td", {
    borderBlockEnd: "0",
  });

  useGlobalStyles(".sl-markdown-content th", {
    color: "#text",
    fill: "#surface-2",
  });

  useGlobalStyles(":root, :root:has(.td-top-tabs)", {
    "$docs-nav-height": {
      "@mobile": "3.5rem",
    },
    "$docs-nav-pad-x": {
      "@mobile": "1rem",
    },
    "$docs-nav-gap": {
      "@mobile": "0.5rem",
    },
    "$docs-menu-button-size": {
      "@mobile": "2.25rem",
    },
  });

  useGlobalStyles(
    "site-search button[data-open-modal], site-search button[data-open-modal]",
    {
      justifyContent: {
        "@mobile": "center",
      },
      inlineSize: {
        "@mobile": "$docs-menu-button-size",
      },
      blockSize: {
        "@mobile": "$docs-menu-button-size",
      },
      minBlockSize: {
        "@mobile": "0",
      },
      padding: {
        "@mobile": "0",
      },
      color: {
        "@mobile": "#text-soft",
      },
      fill: {
        "@mobile": "#surface-3",
      },
    },
  );

  useGlobalStyles(
    "site-search button[data-open-modal]:hover, site-search button[data-open-modal]:hover",
    {
      color: {
        "@mobile": "#text",
      },
      fill: {
        "@mobile": "#surface-3-hover",
      },
    },
  );

  useGlobalStyles(
    "site-search button[data-open-modal]:active, site-search button[data-open-modal]:active",
    {
      color: {
        "@mobile": "#text",
      },
      fill: {
        "@mobile": "#surface-3-pressed",
      },
    },
  );

  useGlobalStyles("site-search button[data-open-modal]::before", {
    inlineSize: {
      "@mobile": "1.125rem",
    },
    blockSize: {
      "@mobile": "1.125rem",
    },
  });

  useGlobalStyles(":root[data-has-toc]", {
    "$docs-mobile-toc-height": {
      "@narrow-layout": "2.5rem",
    },
  });

  useGlobalStyles("mobile-starlight-toc nav", {
    borderBlockEnd: {
      "@narrow-layout": "$border-width solid #border",
    },
  });

  useGlobalStyles(
    "mobile-starlight-toc summary, mobile-starlight-toc summary",
    {
      blockSize: {
        "@narrow-layout": "2.5rem",
      },
    },
  );

  useGlobalStyles(":root[data-has-toc] main > .content-panel:first-of-type", {
    paddingBlockStart: {
      "@narrow-layout": "0",
    },
  });

  useGlobalStyles(":root[data-has-toc], :root[data-has-toc]", {
    "$docs-mobile-toc-height": {
      "@medium-layout": "calc(2.5rem + ($gap * 3))",
    },
  });

  useGlobalStyles("mobile-starlight-toc nav, mobile-starlight-toc nav", {
    paddingBlockStart: {
      "@medium-layout": "($gap * 3)",
    },
    borderBlockEnd: {
      "@medium-layout": "0",
    },
  });

  useGlobalStyles(":root:has(.td-top-tabs) body > .page > .header", {
    paddingBlockStart: {
      "@desktop": "0",
    },
    paddingBlockEnd: {
      "@desktop": "0",
    },
  });

  useGlobalStyles("body > .page > .header", {
    borderBottom: {
      "@desktop": "$border-width solid #border",
    },
  });

  useGlobalStyles(".main-frame", {
    inlineSize: {
      "@desktop": "min(100%, $layout-width)",
    },
    marginInlineStart: {
      "@desktop": "auto",
    },
    marginInlineEnd: {
      "@desktop": "auto",
    },
  });

  useGlobalStyles(".sidebar-pane", {
    insetInlineStart: {
      "@desktop": "max(0px, calc((100% - $layout-width) / 2))",
    },
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
