import { useGlobalStyles } from "@tenphi/tasty";
import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import chevronRightIcon from "../icons/chevron-right.svg?raw";
import closeIcon from "../icons/close.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

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
    "$sl-color-gray-3": "#text-muted",
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
    "$sl-color-bg-badge": "#surface-2",
    "$sl-color-border-badge": "#border",
    "$sl-color-text-badge": "#text-soft",
    "$sl-color-hairline-light": "#border",
    "$sl-color-hairline": "#border",
    "$sl-color-hairline-shade": "#border",
    "$sl-color-backdrop-overlay": "#overlay",
    "$sl-color-accent-low": "#accent-surface-subtle",
    "$sl-color-accent": "#accent-text",
    "$sl-color-accent-high": "#accent-text",
    "$sl-color-banner-bg": "#accent-surface",
    "$sl-color-banner-text": "#accent-surface-text",
    "$sl-color-asides-border": "#border-strong",
    "$sl-color-asides-text-accent": "#text",
    "$sl-color-orange-low": "#orange-surface",
    "$sl-color-orange": "#orange",
    "$sl-color-orange-high": "#orange-text",
    "$sl-color-green-low": "#green-surface",
    "$sl-color-green": "#green",
    "$sl-color-green-high": "#green-text",
    "$sl-color-blue-low": "#blue-surface",
    "$sl-color-blue": "#blue",
    "$sl-color-blue-high": "#blue-text",
    "$sl-color-purple-low": "#purple-surface",
    "$sl-color-purple": "#purple",
    "$sl-color-purple-high": "#purple-text",
    "$sl-color-red-low": "#red-surface",
    "$sl-color-red": "#red",
    "$sl-color-red-high": "#red-text",
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

  useGlobalStyles("body", {
    color: "#text",
    fill: "#surface",
    fontSize: "$body-font-size",
    fontWeight: "$body-font-weight",
    lineHeight: "$body-line-height",
    letterSpacing: "$body-letter-spacing",
  });

  useGlobalStyles(".sl-banner", {
    padding: "($gap * 1.5) $sl-nav-pad-x",
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
    padding: "($gap * 3) $sl-content-pad-x",
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

  useGlobalStyles("site-search button[data-open-modal]", {
    border: true,
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
    color: "#text-soft",
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
    fill: "#surface",
  });

  useGlobalStyles("site-search button[data-close-modal]", {
    gap: "0.375rem",
    paddingInlineStart: "0.625rem",
    paddingInlineEnd: "0.625rem",
    color: "#text",
    border: true,
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
    alignItems: "center",
    gap: "$gap",
    paddingInlineStart: "$sl-content-pad-x",
    paddingInlineEnd: "$sl-content-pad-x",
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
    insetInlineStart: "$sl-content-pad-x",
    zIndex: "1",
    display: "block",
    inlineSize: "min(22rem, (100% - ($sl-content-pad-x * 2)))",
    maxBlockSize: "min(24rem, (100vh - ($sl-mobile-toc-height + ($gap * 4))))",
    margin: "$gap 0 0",
    padding: "4px",
    overflow: "auto",
    color: "#text",
    border: true,
    radius: "$card-radius",
    fill: "#surface-2",
    shadow: "0 0.75rem 2rem #shadow",
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
    "$sl-nav-height": {
      "@mobile": "3.5rem",
    },
    "$sl-nav-pad-x": {
      "@mobile": "1rem",
    },
    "$sl-nav-gap": {
      "@mobile": "0.5rem",
    },
    "$sl-menu-button-size": {
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
        "@mobile": "$sl-menu-button-size",
      },
      blockSize: {
        "@mobile": "$sl-menu-button-size",
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
    "$sl-mobile-toc-height": {
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
    "$sl-mobile-toc-height": {
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
