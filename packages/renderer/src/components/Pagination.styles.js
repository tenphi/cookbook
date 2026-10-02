import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PaginationRoot = defineComponent("Pagination", {
  as: "div",
  "data-tasty-anatomy": "Pagination",
  styles: {
    display: { "": "grid", "@media:print": "none" },
    gap: "($gap * 2)",
    gridColumns: { "": "repeat(2, minmax(0, 1fr))", "@small": "1fr" },
    Link: {
      $: "a",
      radius: "$radius",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "$gap",
      inlineSize: "100%",
      padding: "($gap * 2)",
      // Recolor only; Link owns the border width and style, including theme overrides.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: "#border",
      color: "#text-soft",
      fill: "#surface-2",
      shadow: "none",
      transition: "color $transition, background-color $transition",
      textDecoration: "none",
      overflowWrap: "anywhere",
    },
    PreviousLink: {
      $: "a",
      gridColumn: {
        "": null,
        '@own([rel="prev"])': "1",
        '(@own([rel="prev"])) & (@small)': "auto",
      },
      gridRow: {
        "": null,
        '@own([rel="prev"])': "1",
        '(@own([rel="prev"])) & (@small)': "auto",
      },
    },
    NextLink: {
      $: "a",
      justifyContent: { "": null, '@own([rel="next"])': "flex-start" },
      textAlign: { "": null, '@own([rel="next"])': "end" },
      gridColumn: {
        "": null,
        '@own([rel="next"])': "2",
        '(@own([rel="next"])) & (@small)': "auto",
      },
      gridRow: {
        "": null,
        '@own([rel="next"])': "1",
        '(@own([rel="next"])) & (@small)': "auto",
      },
    },
    NextIcon: {
      // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: 'a[rel="next"]::before',
      order: "1",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextLabel: {
      $: "a > span",
      inlineMargin: {
        "": null,
        '@own(:is(a[rel="next"] > span))': "auto start",
      },
      textAlign: { "": null, '@own(:is(a[rel="next"] > span))': "end" },
    },
    HoverLink: {
      $: "a",
      border: { "": null, "@own(:hover)": "$border-width solid #border" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    ActiveLink: {
      $: "a",
      fill: { "": null, "@own(:active)": "#surface-2-pressed" },
    },
    Title: { $: ".link-title", color: "#heading", preset: "h5" },
    LoneNextLink: {
      // Preserve the conditional scope of this empty legacy customization hook.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: 'a[rel="next"]:only-child',
    },
    Icon: {
      $: "a::before",
      content: '""',
      display: "block",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      inlineSize: "1.25rem",
      blockSize: "1.25rem",
      fill: "#current",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
    PreviousIconRtl: {
      // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: '&:is([dir="rtl"] *) a[rel="prev"]::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextIconRtl: {
      // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: '&:is([dir="rtl"] *) a[rel="next"]::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
  },
});
