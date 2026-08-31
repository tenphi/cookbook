import { useGlobalStyles } from "@tenphi/tasty";
import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import chevronDownIcon from "../icons/chevron-down.svg?raw";
import chevronRightIcon from "../icons/chevron-right.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import contrastIcon from "../icons/contrast.svg?raw";
import deviceIcon from "../icons/device-desktop.svg?raw";
import moonIcon from "../icons/moon.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import sunIcon from "../icons/sun.svg?raw";

// Tasty normalizes style values to lowercase. Escape the uppercase B so the
// SVG's case-sensitive viewBox attribute survives CSS extraction.
const iconUrl = (svg) =>
  `data:image/svg+xml,${encodeURIComponent(
    svg.replace("viewbox=", "viewBox="),
  ).replace("viewBox", "view%42ox")}`;

// These global rules bridge Cookbook tokens into markup owned by Astro,
// Starlight, Expressive Code, and Pagefind. Cookbook-owned components use
// tasty() wrappers; every style object remains visible to the Tasty linter.
export default function GlobalStyles() {
  useGlobalStyles(":root", {
    colorScheme: "dark",
    "$sl-font": "$body-font-family",
    "$sl-font-mono": "$code-font-family",
    "$sl-line-height": "$body-line-height",
    "$sl-line-height-headings": "$heading-line-height",
    "$sl-text-body": "$body-font-size",
    "$sl-text-body-sm": "$small-font-size",
    "$sl-text-code": "$code-font-size",
    "$sl-text-code-sm": "$small-font-size",
    "$sl-text-h1": "$h1-font-size",
    "$sl-text-h2": "$h2-font-size",
    "$sl-text-h3": "$h3-font-size",
    "$sl-text-h4": "$h4-font-size",
    "$sl-text-h5": "$h5-font-size",
    "$sl-content-width": "$content-width",
    "$sl-sidebar-width": "$sidebar-width",
    "$sl-color-white": "#text",
    "$sl-color-gray-1": "#text",
    "$sl-color-gray-2": "#text-soft",
    "$sl-color-gray-3": "color-mix( in oklab, #text 66%, #surface )",
    "$sl-color-gray-4": "#border-strong",
    "$sl-color-gray-5": "#border",
    "$sl-color-gray-6": "#surface-2",
    "$sl-color-gray-7": "#surface-3",
    "$sl-color-black": "#surface",
    "$sl-color-text": "#text-soft",
    "$sl-color-text-accent": "#accent-text",
    "$sl-color-text-invert": "#accent-surface-text",
    "$sl-color-bg": "#surface",
    "$sl-color-bg-nav": "#surface",
    "$sl-color-bg-sidebar": "#surface",
    "$sl-color-bg-inline-code": "#surface-2",
    "$sl-color-bg-accent": "#accent-surface",
    "$sl-color-hairline-light": "#border",
    "$sl-color-hairline": "#border",
    "$sl-color-hairline-shade": "#border",
    "$sl-color-backdrop-overlay": "#overlay",
    "$sl-color-accent-low":
      "color-mix( in oklab, #accent-surface 12%, #surface )",
    "$sl-color-accent": "#accent-text",
    "$sl-color-accent-high": "#accent-text",
    "$sl-shadow-sm": "none",
    "$sl-shadow-md": "0 0.5rem 1.5rem #shadow",
    "$sl-shadow-lg": "0 1rem 3rem #shadow",
    "$sl-nav-height": "4.5rem",
    "$sl-nav-pad-x": "clamp(1.25rem, 2.5vw, 2rem)",
    "$sl-sidebar-pad-x": "1.5rem",
    "$sl-content-pad-x": "clamp(1.5rem, 4vw, 4rem)",
    "$sl-main-pad": "0 0 5rem",
  });

  useGlobalStyles(":root:has(.td-top-tabs)", {
    "$sl-nav-height": "7rem",
  });

  useGlobalStyles(':root[data-theme="light"]', {
    colorScheme: "light",
  });

  useGlobalStyles(":root:not([data-theme])", {
    colorScheme: {
      "@media(prefers-color-scheme: light)": "light",
    },
  });

  useGlobalStyles("html, body, button, input, select, textarea", {
    fontFamily: "$body-font-family",
  });

  useGlobalStyles("body, .td-shell", {
    color: "#text",
    fill: "#surface",
    fontSize: "$body-font-size",
    fontWeight: "$body-font-weight",
    lineHeight: "$body-line-height",
    letterSpacing: "$body-letter-spacing",
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

  useGlobalStyles(
    ":where(button, input, select, textarea):not(:where(.expressive-code *))",
    {
      minBlockSize: "$control-height",
      radius: "$radius",
      boxShadow: "none",
    },
  );

  useGlobalStyles(".expressive-code", {
    "$ec-brdRad": "calc($card-radius - $border-width)",
    "$ec-brdWd": "$border-width",
    "$ec-brdCol": "#border",
  });

  useGlobalStyles(".expressive-code .copy button", {
    radius: "$radius",
    fill: "#surface-3",
    boxShadow: "none",
  });

  useGlobalStyles(".expressive-code .copy button::before", {
    borderColor: "#border",
    opacity: "1",
  });

  useGlobalStyles(".expressive-code .copy button div", {
    hide: true,
  });

  useGlobalStyles(
    ".expressive-code .copy button:hover, .expressive-code .copy button:focus-visible",
    {
      fill: "#surface-3-hover",
    },
  );

  useGlobalStyles(".expressive-code .copy button:active", {
    fill: "#surface-3-pressed",
  });

  useGlobalStyles(
    'starlight-theme-select label, starlight-theme-select select, site-search button[data-open-modal], site-search dialog, .pagination-links a, a[aria-current="page"]',
    {
      radius: "$radius",
    },
  );

  useGlobalStyles(
    '#starlight__sidebar a[aria-current="page"], #starlight__sidebar a[aria-current="page"]:hover, #starlight__sidebar a[aria-current="page"]:focus',
    {
      color: "#accent-text",
      fill: "color-mix( in oklab, #accent-surface 12%, #surface )",
    },
  );

  useGlobalStyles("starlight-theme-select label", {
    boxSizing: "border-box",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    inlineSize: "$control-height",
    blockSize: "$control-height",
    padding: "0",
    border: "0",
    fill: "#clear",
  });

  useGlobalStyles("starlight-theme-select .label-icon", {
    position: "absolute",
    zIndex: "1",
    insetInlineStart: "50%",
    inlineSize: "1rem",
    blockSize: "1rem",
    color: "#text-soft",
    translate: "-50% 0",
    pointerEvents: "none",
  });

  useGlobalStyles("starlight-theme-select select", {
    appearance: "base-select",
    position: "static",
    inlineSize: "$control-height",
    minInlineSize: "0",
    blockSize: "$control-height",
    paddingBlockStart: "0",
    paddingBlockEnd: "0",
    paddingInlineStart: "0",
    paddingInlineEnd: "0",
    margin: "0",
    color: "#clear",
    fontSize: "0",
    fontWeight: "$body-bold-font-weight",
    border: "$border-width solid #border",
    fill: "#surface-3",
    boxShadow: "none",
    cursor: "pointer",
    transition: "color 120ms ease, background-color 120ms ease",
  });

  useGlobalStyles("starlight-theme-select select:hover", {
    fill: "#surface-3-hover",
  });

  useGlobalStyles("starlight-theme-select select:active", {
    fill: "#surface-3-pressed",
  });

  useGlobalStyles("starlight-theme-select select::picker-icon", {
    hide: true,
  });

  useGlobalStyles("::picker(select)", {
    appearance: "base-select",
    minInlineSize: "8rem",
    marginBlockStart: "0.5rem",
    padding: "0.375rem",
    color: "#text",
    border: "$border-width solid #border",
    radius: "$radius",
    fill: "#surface-2",
    boxShadow: "0 0.75rem 2rem #shadow",
  });

  useGlobalStyles("starlight-theme-select option", {
    padding: "0.625rem 0.75rem",
    color: "#text",
    fontSize: "$small-font-size",
    radius: "$radius",
    fill: "#surface-2",
  });

  useGlobalStyles(
    "starlight-theme-select option:hover, starlight-theme-select option:focus",
    {
      fill: "#surface-2-hover",
    },
  );

  useGlobalStyles("starlight-theme-select option:checked", {
    color: "#accent-text",
    fill: "color-mix( in oklab, #accent-surface 12%, #surface-2 )",
  });

  useGlobalStyles("starlight-theme-select option::checkmark", {
    order: "1",
    marginInlineStart: "auto",
  });

  useGlobalStyles(".td-header", {
    display: "flex",
    flexDirection: "column",
    inlineSize: "100%",
    maxInlineSize: "($layout-width - ($sl-sidebar-pad-x * 2))",
    blockSize: "100%",
    minInlineSize: "0",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
  });

  useGlobalStyles(".td-header__primary", {
    display: "grid",
    gridTemplateColumns:
      "minmax(9rem, $sidebar-width) minmax(12rem, 28rem) minmax(5rem, 1fr)",
    placeItems: "center stretch",
    flexGrow: "1",
    flexShrink: "1",
    flexBasis: "0%",
    rowGap: "clamp(1rem, 2.5vw, 2.5rem)",
    columnGap: "clamp(1rem, 2.5vw, 2.5rem)",
    minBlockSize: "0",
  });

  useGlobalStyles(".td-header__title, .td-header__search", {
    display: "flex",
    alignItems: "center",
    minInlineSize: "0",
  });

  useGlobalStyles(".td-header__search site-search", {
    inlineSize: "100%",
  });

  useGlobalStyles(".td-header__tools", {
    alignItems: "center",
    justifyContent: "flex-end",
    rowGap: "($gap * 1.5)",
    columnGap: "($gap * 1.5)",
  });

  useGlobalStyles(".td-header__social", {
    display: "flex",
    alignItems: "center",
  });

  useGlobalStyles(".site-title", {
    color: "#text",
    fontWeight: "$heading-bold-font-weight",
    letterSpacing: "$heading-letter-spacing",
  });

  useGlobalStyles(".td-top-tabs", {
    display: "flex",
    alignItems: "stretch",
    rowGap: "clamp(1.25rem, 2.5vw, 2.5rem)",
    columnGap: "clamp(1.25rem, 2.5vw, 2.5rem)",
    inlineSize: "100%",
    minBlockSize: "2.5rem",
    overflowX: "auto",
    scrollbarWidth: "none",
  });

  useGlobalStyles(".td-top-tabs::-webkit-scrollbar", {
    hide: true,
  });

  useGlobalStyles(".td-top-tabs a", {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    flexGrow: "0",
    flexShrink: "0",
    flexBasis: "auto",
    paddingBlockStart: "($gap * 0.75)",
    paddingBlockEnd: "$gap",
    color: "#text-soft",
    fontSize: "$navigation-font-size",
    fontWeight: "$navigation-bold-font-weight",
    lineHeight: "$navigation-line-height",
    letterSpacing: "$navigation-letter-spacing",
    textDecoration: "none",
    whiteSpace: "nowrap",
  });

  useGlobalStyles(".td-top-tabs a:hover", {
    color: "#text",
  });

  useGlobalStyles('.td-top-tabs a[aria-current="page"]', {
    color: "#accent-text",
  });

  useGlobalStyles('.td-top-tabs a[aria-current="page"]::after', {
    content: '""',
    position: "absolute",
    inset: "auto 0 0",
    blockSize: "2px",
    radius: "999px",
    fill: "#accent-surface",
  });

  useGlobalStyles(".td-mobile-tabs", {
    display: "grid",
    rowGap: "$gap",
    columnGap: "$gap",
    marginBlockEnd: "($gap * 2)",
    paddingBlockEnd: "($gap * 2)",
    borderBlockEnd: "$border-width solid #border",
  });

  useGlobalStyles(".td-mobile-tabs__label", {
    paddingInlineStart: "($gap * 1.25)",
    paddingInlineEnd: "($gap * 1.25)",
    color: "#text",
    fontSize: "$navigation-font-size",
    fontWeight: "$navigation-bold-font-weight",
    lineHeight: "$navigation-line-height",
    letterSpacing: "$navigation-letter-spacing",
  });

  useGlobalStyles(".td-mobile-tabs ul", {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    rowGap: "$gap",
    columnGap: "$gap",
    padding: "0",
    margin: "0",
    listStyle: "none",
  });

  useGlobalStyles(".td-mobile-tabs li", {
    margin: "0",
  });

  useGlobalStyles(".td-mobile-tabs a", {
    display: "flex",
    alignItems: "center",
    minBlockSize: "2.25rem",
    padding: "($gap * 0.75) ($gap * 1.25)",
    color: "#text-soft",
    fontSize: "$navigation-font-size",
    fontWeight: "$navigation-font-weight",
    lineHeight: "$navigation-line-height",
    letterSpacing: "$navigation-letter-spacing",
    textDecoration: "none",
    radius: "$radius",
  });

  useGlobalStyles(".td-mobile-tabs a:hover", {
    color: "#text",
    fill: "#surface-2-hover",
  });

  useGlobalStyles('.td-mobile-tabs a[aria-current="page"]', {
    color: "#accent-text",
    fill: "color-mix( in oklab, #accent-surface 12%, #surface )",
  });

  useGlobalStyles(
    "body > .page > .header, .sidebar-pane, .right-sidebar, .content-panel + .content-panel, mobile-starlight-toc :where(nav, summary)",
    {
      border: "0",
    },
  );

  useGlobalStyles("body > .page > .header, .sidebar-pane", {
    fill: "#surface",
  });

  useGlobalStyles("#starlight__sidebar .sidebar-content", {
    rowGap: "($gap * 3)",
    columnGap: "($gap * 3)",
    paddingBlockStart: "($gap * 4)",
    paddingBlockEnd: "($gap * 6)",
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
    lineHeight: "1.45",
  });

  useGlobalStyles("#starlight__sidebar a", {
    fontSize: "0.9375rem",
  });

  useGlobalStyles("#starlight__sidebar .large", {
    fontSize: "0.9375rem",
    fontWeight: "$body-bold-font-weight",
  });

  useGlobalStyles(".right-sidebar-panel", {
    paddingBlockStart: "($gap * 5)",
  });

  useGlobalStyles(".right-sidebar-panel h2", {
    fontSize: "0.9375rem",
  });

  useGlobalStyles(".right-sidebar-panel a", {
    paddingBlockStart: "($gap * 0.5)",
    paddingBlockEnd: "($gap * 0.5)",
    fontSize: "$small-font-size",
    lineHeight: "1.45",
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

  useGlobalStyles("site-search button[data-open-modal]", {
    border: "$border-width solid #border",
    fill: "#surface",
    boxShadow: "none",
    transition: "color 120ms ease, background-color 120ms ease",
  });

  useGlobalStyles("site-search button[data-open-modal]:hover", {
    borderColor: "#border",
    fill: "#surface-2-hover",
  });

  useGlobalStyles("site-search button[data-open-modal]:active", {
    fill: "#surface-2-pressed",
  });

  useGlobalStyles(".pagination-links a", {
    borderWidth: "$border-width",
    borderColor: "#border",
    fill: "#surface-2",
    boxShadow: "none",
    transition: "color 120ms ease, background-color 120ms ease",
  });

  useGlobalStyles(".pagination-links a:hover", {
    borderColor: "#border",
    fill: "#surface-2-hover",
  });

  useGlobalStyles(".pagination-links a:active", {
    fill: "#surface-2-pressed",
  });

  useGlobalStyles("main .pagination-links", {
    gridTemplateColumns: {
      "": "repeat(2, minmax(0, 1fr))",
      "@media(max-width: 40rem)": "1fr",
    },
  });

  useGlobalStyles('main .pagination-links a[rel="next"]:first-child', {
    gridColumn: {
      "": "2",
      "@media(max-width: 40rem)": "1",
    },
  });

  useGlobalStyles(
    "site-search button[data-open-modal] > svg, .pagination-links a > svg, starlight-theme-select .caret, mobile-starlight-toc .toggle > svg, #starlight__sidebar summary > svg.caret",
    {
      hide: true,
    },
  );

  useGlobalStyles(
    'site-search button[data-open-modal]::before, site-search button[data-close-modal]::before, .pagination-links a::before, mobile-starlight-toc .toggle::after, #starlight__sidebar summary::after, [data-docs-search-open]::before, [data-docs-search] button[aria-label="Close search"]::before, .td-shell__actions label:has([data-docs-theme])::before',
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

  useGlobalStyles(
    "site-search button[data-open-modal]::before, [data-docs-search-open]::before",
    {
      mask: `url("${iconUrl(searchIcon)}") center / contain no-repeat`,
    },
  );

  useGlobalStyles(
    'site-search button[data-close-modal]::before, [data-docs-search] button[aria-label="Close search"]::before',
    {
      mask: `url("${iconUrl(closeIcon)}") center / contain no-repeat`,
    },
  );

  useGlobalStyles(".pagination-links a::before", {
    mask: `url("${iconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    inlineSize: "1.25rem",
    blockSize: "1.25rem",
  });

  useGlobalStyles('.pagination-links a[rel="next"]::before', {
    mask: `url("${iconUrl(arrowRightIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles('[dir="rtl"] .pagination-links a[rel="prev"]::before', {
    mask: `url("${iconUrl(arrowRightIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles('[dir="rtl"] .pagination-links a[rel="next"]::before', {
    mask: `url("${iconUrl(arrowLeftIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles(
    "mobile-starlight-toc .toggle::after, #starlight__sidebar summary::after",
    {
      mask: `url("${iconUrl(chevronRightIcon)}") center / contain no-repeat`,
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
    fill: "#surface",
  });

  useGlobalStyles("site-search button[data-close-modal]", {
    rowGap: "0.375rem",
    columnGap: "0.375rem",
    paddingInlineStart: "0.625rem",
    paddingInlineEnd: "0.625rem",
    color: "#text",
    border: "$border-width solid #border",
    radius: "$radius",
  });

  useGlobalStyles("#starlight__search", {
    "$pagefind-ui-background": "#surface",
    "$pagefind-ui-border": "#border",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-input", {
    borderColor: "#border",
    fill: "#surface",
    boxShadow: "none",
  });

  useGlobalStyles("#starlight__search .pagefind-ui__form::before", {
    inlineSize: "1rem",
    blockSize: "1rem",
    mask: `url("${iconUrl(searchIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles("#starlight__search .pagefind-ui__search-clear::before", {
    mask: `url("${iconUrl(closeIcon)}") center / 1rem no-repeat`,
  });

  useGlobalStyles(
    "starlight-menu-button button, mobile-starlight-toc .toggle",
    {
      color: "#text",
      border: "$border-width solid #border",
      radius: "$radius",
      fill: "#surface-3",
      transition: "color 120ms ease, background-color 120ms ease",
    },
  );

  useGlobalStyles("starlight-menu-button button", {
    alignItems: "center",
    justifyContent: "center",
    inlineSize: "$sl-menu-button-size",
    blockSize: "$sl-menu-button-size",
    minBlockSize: "0",
    padding: "0",
    color: "#text-soft",
    boxShadow: "none",
  });

  useGlobalStyles("starlight-menu-button button > svg", {
    inlineSize: "1.125rem",
    blockSize: "1.125rem",
  });

  useGlobalStyles(".td-mobile-preferences", {
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: "($gap * 2)",
    columnGap: "($gap * 2)",
    paddingBlockStart: "$gap",
    paddingBlockEnd: "$gap",
    borderBlockStart: "$border-width solid #border",
  });

  useGlobalStyles(".td-mobile-preferences__social", {
    display: "flex",
    alignItems: "center",
    rowGap: "($gap * 2)",
    columnGap: "($gap * 2)",
    marginInlineEnd: "auto",
    paddingBlockStart: "($gap * 2)",
    paddingBlockEnd: "($gap * 2)",
  });

  useGlobalStyles(".td-mobile-preferences__social:empty", {
    hide: true,
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
    paddingInlineStart: "$sl-content-pad-x",
    paddingInlineEnd: "$sl-content-pad-x",
  });

  useGlobalStyles(
    "mobile-starlight-toc .toggle, mobile-starlight-toc .toggle:hover, mobile-starlight-toc details[open] .toggle, mobile-starlight-toc .toggle:active",
    {
      rowGap: "$gap",
      columnGap: "$gap",
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
    border: "$border-width solid #border",
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

  useGlobalStyles(".td-shell", {
    minBlockSize: "100vh",
  });

  useGlobalStyles(".td-shell__header", {
    position: "sticky",
    top: "0",
    zIndex: "2",
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: "clamp(1.25rem, 3vw, 2rem)",
    paddingInlineEnd: "clamp(1.25rem, 3vw, 2rem)",
    fill: "color-mix(in oklab, #surface 96%, #clear)",
    backdropFilter: "blur(12px)",
  });

  useGlobalStyles(".td-shell__header-primary", {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    rowGap: "($gap * 3)",
    columnGap: "($gap * 3)",
    inlineSize: "100%",
    maxInlineSize: "($layout-width - ($gap * 6))",
    minBlockSize: "4.5rem",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
  });

  useGlobalStyles(".td-shell__header > .td-top-tabs", {
    maxInlineSize: "($layout-width - ($gap * 6))",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
  });

  useGlobalStyles(".td-shell__header-primary > a", {
    color: "#text",
    fontFamily: "$heading-font-family",
    fontWeight: "$heading-font-weight",
    textDecoration: "none",
  });

  useGlobalStyles(".td-shell__actions", {
    display: "flex",
    alignItems: "center",
    rowGap: "$gap",
    columnGap: "$gap",
  });

  useGlobalStyles(
    ".td-shell__actions :where(select, button), [data-docs-search] :where(input, button)",
    {
      paddingInlineStart: "($gap * 1.5)",
      paddingInlineEnd: "($gap * 1.5)",
      color: "#text",
      border: "$border-width solid #border",
    },
  );

  useGlobalStyles(".td-shell__actions select, [data-docs-search] input", {
    fill: "#surface",
  });

  useGlobalStyles(
    ".td-shell__actions button, [data-docs-search] button, site-search button[data-close-modal]",
    {
      fill: "#surface-2",
      transition: "background-color 120ms ease",
    },
  );

  useGlobalStyles(
    ".td-shell__actions button:hover, [data-docs-search] button:hover, site-search button[data-close-modal]:hover",
    {
      borderColor: "#border",
      fill: "#surface-2-hover",
    },
  );

  useGlobalStyles(
    ".td-shell__actions button:active, [data-docs-search] button:active, site-search button[data-close-modal]:active",
    {
      fill: "#surface-2-pressed",
    },
  );

  useGlobalStyles(".td-shell__actions label:has(select)", {
    position: "relative",
  });

  useGlobalStyles(".td-appearance-control", {
    display: "grid",
    placeItems: "center",
    inlineSize: "$control-height",
    blockSize: "$control-height",
    radius: "$radius",
  });

  useGlobalStyles(".td-appearance-control:hover", {
    fill: "#surface-2-hover",
  });

  useGlobalStyles(".td-appearance-control select", {
    position: "absolute",
    inset: "0",
    inlineSize: "100%",
    blockSize: "100%",
    padding: "0",
    border: "0",
    opacity: "0",
    cursor: "pointer",
  });

  useGlobalStyles(".td-shell__actions label:has([data-docs-theme])::before", {
    mask: `url("${iconUrl(deviceIcon)}") center / contain no-repeat`,
    position: "absolute",
    zIndex: "1",
    insetBlockStart: "50%",
    insetInlineStart: "50%",
    translate: "-50% -50%",
    pointerEvents: "none",
  });

  useGlobalStyles(
    '.td-shell__actions label:has([data-docs-theme] option[value="light"]:checked)::before',
    {
      mask: `url("${iconUrl(sunIcon)}") center / contain no-repeat`,
    },
  );

  useGlobalStyles(
    '.td-shell__actions label:has([data-docs-theme] option[value="dark"]:checked)::before',
    {
      mask: `url("${iconUrl(moonIcon)}") center / contain no-repeat`,
    },
  );

  useGlobalStyles(".td-shell__actions label:has(select)::after", {
    content: '""',
    position: "absolute",
    zIndex: "1",
    insetBlockStart: "50%",
    insetInlineEnd: "0.75rem",
    inlineSize: "1rem",
    blockSize: "1rem",
    translate: "0 -50%",
    fill: "#text",
    mask: `url("${iconUrl(chevronDownIcon)}") center / contain no-repeat`,
    pointerEvents: "none",
  });

  useGlobalStyles(".td-appearance-control::after", {
    hide: true,
  });

  useGlobalStyles(".td-appearance-control--contrast::before", {
    content: '""',
    display: "block",
    inlineSize: "1rem",
    blockSize: "1rem",
    fill: "#text-soft",
    mask: `url("${iconUrl(contrastIcon)}") center / contain no-repeat`,
    pointerEvents: "none",
  });

  useGlobalStyles(".td-shell__actions select", {
    paddingInlineEnd: "($gap * 4)",
    appearance: "none",
  });

  useGlobalStyles(".td-shell__actions [data-docs-theme]", {
    paddingInlineStart: "($gap * 4)",
  });

  useGlobalStyles("[data-docs-search-open]", {
    display: "inline-flex",
    alignItems: "center",
    rowGap: "$gap",
    columnGap: "$gap",
  });

  useGlobalStyles("[data-docs-search-open] > kbd", {
    display: "flex",
    rowGap: "0.125rem",
    columnGap: "0.125rem",
    marginInlineStart: "($gap * 1.5)",
    color: "#text-soft",
    fontSize: "0.75rem",
    fontWeight: "500",
  });

  useGlobalStyles("[data-docs-search-open] kbd", {
    fontFamily: "$body-font-family",
  });

  useGlobalStyles('[data-docs-search] button[aria-label="Close search"]', {
    display: "grid",
    placeItems: "center",
    inlineSize: "$control-height",
    padding: "0",
    overflow: "hidden",
    color: "#clear",
  });

  useGlobalStyles(
    '[data-docs-search] button[aria-label="Close search"]::before',
    {
      color: "#text",
    },
  );

  useGlobalStyles(".td-visually-hidden", {
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

  useGlobalStyles(".td-shell__layout", {
    display: "grid",
    gridTemplateColumns: "minmax(13rem, $sidebar-width) minmax(0, 1fr)",
    inlineSize: "min(100%, $layout-width)",
    marginInlineStart: "auto",
    marginInlineEnd: "auto",
  });

  useGlobalStyles(".td-shell__nav", {
    padding: "($gap * 5) ($gap * 3)",
  });

  useGlobalStyles(".td-shell__nav ul", {
    margin: "0",
    padding: "0",
    listStyle: "none",
  });

  useGlobalStyles(".td-shell__nav ul ul", {
    paddingInlineStart: "($gap * 1.5)",
  });

  useGlobalStyles(".td-shell__nav details > summary", {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "($gap * 0.9) ($gap * 1.25)",
    color: "#text",
    fontWeight: "$body-bold-font-weight",
    cursor: "pointer",
    listStyle: "none",
  });

  useGlobalStyles(".td-shell__nav details > summary::-webkit-details-marker", {
    hide: true,
  });

  useGlobalStyles(".td-shell__nav details > summary::after", {
    content: '""',
    inlineSize: "1rem",
    blockSize: "1rem",
    fill: "#text-soft",
    mask: `url("${iconUrl(chevronDownIcon)}") center / contain no-repeat`,
  });

  useGlobalStyles(".td-shell__nav details:not([open]) > summary::after", {
    rotate: "-90deg",
  });

  useGlobalStyles(".td-shell__nav a", {
    display: "block",
    padding: "($gap * 0.9) ($gap * 1.25)",
    color: "#text-soft",
    radius: "$radius",
    textDecoration: "none",
  });

  useGlobalStyles(".td-shell__nav a:hover", {
    color: "#text",
    fill: "#surface-2",
  });

  useGlobalStyles('.td-shell__nav a[aria-current="page"]', {
    color: "#accent-text",
    fontWeight: "$body-bold-font-weight",
    fill: "color-mix( in oklab, #accent-surface 12%, #surface )",
  });

  useGlobalStyles(".td-shell__main", {
    inlineSize: "min(100%, $content-width)",
    padding: "($gap * 3) clamp(1.5rem, 5vw, 4rem) ($gap * 10)",
  });

  useGlobalStyles(".td-shell__main img", {
    maxInlineSize: "100%",
    blockSize: "auto",
    radius: "$radius",
  });

  useGlobalStyles(".td-shell__main :where(pre, table)", {
    maxInlineSize: "100%",
    overflow: "auto",
  });

  useGlobalStyles(".td-shell__main :where(pre):not(:where(.td-preview *))", {
    padding: "($gap * 1.5) ($gap * 2)",
    fontSize: "$code-font-size",
    lineHeight: "$code-line-height",
    letterSpacing: "$code-letter-spacing",
    border: "$border-width solid #border",
    radius: "$card-radius",
  });

  useGlobalStyles(".td-shell__main a", {
    color: "#accent-text",
  });

  useGlobalStyles("[data-docs-search]", {
    inlineSize: "min(42rem, calc(100% - 2rem))",
    padding: "($gap * 2.5)",
    color: "#text",
    fill: "#surface",
    border: "$border-width solid #border-strong",
    radius: "$card-radius",
    boxShadow: "$sl-shadow-lg",
  });

  useGlobalStyles("[data-docs-search]::backdrop", {
    fill: "#overlay",
  });

  useGlobalStyles("[data-docs-search] form", {
    float: "inline-end",
  });

  useGlobalStyles("[data-docs-search] label, [data-docs-search] input", {
    display: "block",
    inlineSize: "100%",
  });

  useGlobalStyles("[data-docs-search] input", {
    marginBlockStart: "$gap",
    marginBlockEnd: "($gap * 2)",
  });

  useGlobalStyles(".td-skip", {
    position: "fixed",
    inset: "$gap auto auto $gap",
    zIndex: "4",
    translate: "0 -150%",
    padding: "$gap ($gap * 1.5)",
    color: "#accent-surface-text",
    radius: "$radius",
    fill: "#accent-surface",
  });

  useGlobalStyles(".td-skip:focus", {
    translate: "0",
  });

  useGlobalStyles(".td-shell__header, .td-shell__actions", {
    alignItems: {
      "@media(max-width: 48rem)": "stretch",
    },
  });

  useGlobalStyles(".td-shell__header, .td-shell__header", {
    paddingInlineStart: {
      "@media(max-width: 48rem)": "1rem",
    },
    paddingInlineEnd: {
      "@media(max-width: 48rem)": "1rem",
    },
  });

  useGlobalStyles(".td-shell__actions, .td-shell__actions", {
    flexWrap: {
      "@media(max-width: 48rem)": "wrap",
    },
  });

  useGlobalStyles(".td-shell__layout, .td-shell__layout", {
    gridTemplateColumns: {
      "@media(max-width: 48rem)": "1fr",
    },
  });

  useGlobalStyles(".td-shell__nav, .td-shell__nav", {
    paddingBlockStart: {
      "@media(max-width: 48rem)": "($gap * 2)",
    },
    paddingBlockEnd: {
      "@media(max-width: 48rem)": "($gap * 2)",
    },
  });

  useGlobalStyles(":root, :root:has(.td-top-tabs)", {
    "$sl-nav-height": {
      "@media(max-width: 49.99rem)": "3.5rem",
    },
    "$sl-nav-pad-x": {
      "@media(max-width: 49.99rem)": "1rem",
    },
    "$sl-nav-gap": {
      "@media(max-width: 49.99rem)": "0.5rem",
    },
    "$sl-menu-button-size": {
      "@media(max-width: 49.99rem)": "2.25rem",
    },
  });

  useGlobalStyles(".td-header__primary, .td-header__primary", {
    display: {
      "@media(max-width: 49.99rem)": "flex",
    },
    justifyContent: {
      "@media(max-width: 49.99rem)": "space-between",
    },
    rowGap: {
      "@media(max-width: 49.99rem)": "$gap",
    },
    columnGap: {
      "@media(max-width: 49.99rem)": "$gap",
    },
  });

  useGlobalStyles(".td-header__search", {
    position: {
      "@media(max-width: 49.99rem)": "fixed",
    },
    zIndex: {
      "@media(max-width: 49.99rem)": "10",
    },
    top: {
      "@media(max-width: 49.99rem)":
        "(($sl-nav-height - $sl-menu-button-size) / 2)",
    },
    insetInlineEnd: {
      "@media(max-width: 49.99rem)":
        "($sl-nav-pad-x + (($sl-menu-button-size + $sl-nav-gap) * 2))",
    },
    placeItems: {
      "@media(max-width: 49.99rem)": "center",
    },
    inlineSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    blockSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    marginInlineStart: {
      "@media(max-width: 49.99rem)": "0",
    },
  });

  useGlobalStyles(".td-header__search site-search", {
    inlineSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    blockSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
  });

  useGlobalStyles(".td-header__mobile-theme", {
    display: {
      "@media(max-width: 49.99rem)": "grid",
    },
    position: {
      "@media(max-width: 49.99rem)": "fixed",
    },
    zIndex: {
      "@media(max-width: 49.99rem)": "10",
    },
    top: {
      "@media(max-width: 49.99rem)":
        "(($sl-nav-height - $sl-menu-button-size) / 2)",
    },
    insetInlineEnd: {
      "@media(max-width: 49.99rem)":
        "($sl-nav-pad-x + $sl-menu-button-size + $sl-nav-gap)",
    },
    placeItems: {
      "@media(max-width: 49.99rem)": "center",
    },
    inlineSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
    blockSize: {
      "@media(max-width: 49.99rem)": "$sl-menu-button-size",
    },
  });

  useGlobalStyles(
    ".td-header__mobile-theme starlight-theme-select label, .td-header__mobile-theme starlight-theme-select select",
    {
      inlineSize: {
        "@media(max-width: 49.99rem)": "$sl-menu-button-size",
      },
      blockSize: {
        "@media(max-width: 49.99rem)": "$sl-menu-button-size",
      },
    },
  );

  useGlobalStyles(".site-title, .site-title", {
    fontSize: {
      "@media(max-width: 49.99rem)": "1.125rem",
    },
    lineHeight: {
      "@media(max-width: 49.99rem)": "1.5rem",
    },
  });

  useGlobalStyles(
    "site-search button[data-open-modal], site-search button[data-open-modal]",
    {
      justifyContent: {
        "@media(max-width: 49.99rem)": "center",
      },
      inlineSize: {
        "@media(max-width: 49.99rem)": "$sl-menu-button-size",
      },
      blockSize: {
        "@media(max-width: 49.99rem)": "$sl-menu-button-size",
      },
      minBlockSize: {
        "@media(max-width: 49.99rem)": "0",
      },
      padding: {
        "@media(max-width: 49.99rem)": "0",
      },
      color: {
        "@media(max-width: 49.99rem)": "#text-soft",
      },
      fill: {
        "@media(max-width: 49.99rem)": "#surface-3",
      },
    },
  );

  useGlobalStyles(
    "site-search button[data-open-modal]:hover, site-search button[data-open-modal]:hover",
    {
      color: {
        "@media(max-width: 49.99rem)": "#text",
      },
      fill: {
        "@media(max-width: 49.99rem)": "#surface-3-hover",
      },
    },
  );

  useGlobalStyles(
    "site-search button[data-open-modal]:active, site-search button[data-open-modal]:active",
    {
      color: {
        "@media(max-width: 49.99rem)": "#text",
      },
      fill: {
        "@media(max-width: 49.99rem)": "#surface-3-pressed",
      },
    },
  );

  useGlobalStyles("site-search button[data-open-modal]::before", {
    inlineSize: {
      "@media(max-width: 49.99rem)": "1.125rem",
    },
    blockSize: {
      "@media(max-width: 49.99rem)": "1.125rem",
    },
  });

  useGlobalStyles(".td-top-tabs, .td-top-tabs", {
    display: {
      "@media(max-width: 49.99rem)": "none",
    },
  });

  useGlobalStyles(":root[data-has-toc]", {
    "$sl-mobile-toc-height": {
      "@media(max-width: 71.99rem)": "2.5rem",
    },
  });

  useGlobalStyles("mobile-starlight-toc nav", {
    borderBlockEnd: {
      "@media(max-width: 71.99rem)": "$border-width solid #border",
    },
  });

  useGlobalStyles(
    "mobile-starlight-toc summary, mobile-starlight-toc summary",
    {
      blockSize: {
        "@media(max-width: 71.99rem)": "2.5rem",
      },
    },
  );

  useGlobalStyles(":root[data-has-toc] main > .content-panel:first-of-type", {
    paddingBlockStart: {
      "@media(max-width: 71.99rem)": "0",
    },
  });

  useGlobalStyles(":root[data-has-toc], :root[data-has-toc]", {
    "$sl-mobile-toc-height": {
      "@media(min-width: 50rem) & @media(max-width: 71.99rem)":
        "calc(2.5rem + ($gap * 3))",
    },
  });

  useGlobalStyles("mobile-starlight-toc nav, mobile-starlight-toc nav", {
    paddingBlockStart: {
      "@media(min-width: 50rem) & @media(max-width: 71.99rem)": "($gap * 3)",
    },
    borderBlockEnd: {
      "@media(min-width: 50rem) & @media(max-width: 71.99rem)": "0",
    },
  });

  useGlobalStyles(".td-mobile-tabs, .td-mobile-tabs", {
    display: {
      "@media(min-width: 50rem)": "none",
    },
  });

  useGlobalStyles(":root:has(.td-top-tabs) body > .page > .header", {
    paddingBlockStart: {
      "@media(min-width: 50rem)": "0",
    },
    paddingBlockEnd: {
      "@media(min-width: 50rem)": "0",
    },
  });

  useGlobalStyles("body > .page > .header, .td-shell__header", {
    borderBottom: {
      "@media(min-width: 50rem)": "$border-width solid #border",
    },
  });

  useGlobalStyles(".main-frame", {
    inlineSize: {
      "@media(min-width: 50rem)": "min(100%, $layout-width)",
    },
    marginInlineStart: {
      "@media(min-width: 50rem)": "auto",
    },
    marginInlineEnd: {
      "@media(min-width: 50rem)": "auto",
    },
  });

  useGlobalStyles(".sidebar-pane", {
    insetInlineStart: {
      "@media(min-width: 50rem)": "max(0px, calc((100% - $layout-width) / 2))",
    },
  });

  useGlobalStyles("*, *::before, *::after", {
    scrollBehavior: {
      "@media(prefers-reduced-motion: reduce)": "auto",
    },
    transitionDuration: {
      "@media(prefers-reduced-motion: reduce)": "0.01ms",
    },
  });

  return null;
}
