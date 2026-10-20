import arrowLeftIcon from "../icons/arrow-left.svg?raw";
import arrowRightIcon from "../icons/arrow-right.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PaginationRoot = defineComponent("Pagination", {
  as: "div",
  "data-element": "Pagination",
  styles: {
    display: "grid",
    hide: { "": false, "@media:print": true },
    gap: "2x",
    gridColumns: { "": "repeat(2, minmax(0, 1fr))", "!@sm": "1fr" },
    Link: {
      $: "a",
      radius: "1r",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "1x",
      inlineSize: "100%",
      padding: "2x",
      border: true,
      color: "#text-soft",
      fill: "#surface-2",
      shadow: "none",
      transition: "color, fill",
      textDecoration: "none",
      overflowWrap: "anywhere",
    },
    PreviousLink: {
      $: "a",
      gridColumn: {
        "": null,
        '@own([rel="prev"])': "1",
        '@own([rel="prev"]) & !@sm': "auto",
      },
      gridRow: {
        "": null,
        '@own([rel="prev"])': "1",
        '@own([rel="prev"]) & !@sm': "auto",
      },
    },
    NextLink: {
      $: "a",
      justifyContent: { "": null, '@own([rel="next"])': "flex-start" },
      textAlign: { "": null, '@own([rel="next"])': "end" },
      gridColumn: {
        "": null,
        '@own([rel="next"])': "2",
        '@own([rel="next"]) & !@sm': "auto",
      },
      gridRow: {
        "": null,
        '@own([rel="next"])': "1",
        '@own([rel="next"]) & !@sm': "auto",
      },
    },
    NextIcon: {
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
      // Recolor only; Link owns the border width and style, including theme overrides.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: { "": null, "@own(:hover)": "#border" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    ActiveLink: {
      $: "a",
      fill: { "": null, "@own(:active)": "#surface-2-pressed" },
    },
    Title: { $: "Title", color: "#heading", preset: "h5" },
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
      $: 'a[rel="prev"]:dir(rtl)::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextIconRtl: {
      $: 'a[rel="next"]:dir(rtl)::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
  },
});
