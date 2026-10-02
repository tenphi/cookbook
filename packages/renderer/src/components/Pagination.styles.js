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
      $: 'a[rel="prev"]',
      gridColumn: { "": "1", "@small": "auto" },
      gridRow: { "": "1", "@small": "auto" },
    },
    NextLink: {
      $: 'a[rel="next"]',
      justifyContent: "flex-start",
      textAlign: "end",
      gridColumn: { "": "2", "@small": "auto" },
      gridRow: { "": "1", "@small": "auto" },
    },
    NextIcon: {
      $: 'a[rel="next"]::before',
      order: "1",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextLabel: {
      $: 'a[rel="next"] > span',
      inlineMargin: "auto start",
      textAlign: "end",
    },
    HoverLink: {
      $: "a:hover",
      border: "$border-width solid #border",
      fill: "#surface-2-hover",
    },
    ActiveLink: { $: "a:active", fill: "#surface-2-pressed" },
    Title: { $: ".link-title", color: "#heading", preset: "h5" },
    LoneNextLink: {
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
      $: '&:is([dir="rtl"] *) a[rel="prev"]::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextIconRtl: {
      $: '&:is([dir="rtl"] *) a[rel="next"]::before',
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
  },
});
