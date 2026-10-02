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
    gridTemplateColumns: {
      "": "repeat(2, minmax(0, 1fr))",
      "@small": "1fr",
    },
    Link: {
      $: "a",
      radius: "$radius",
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
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextLabel: {
      $: 'a[rel="next"] > span',
      marginInlineStart: "auto",
      textAlign: "end",
    },
    HoverLink: {
      $: "a:hover",
      borderColor: "#border",
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
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
    PreviousIconRtl: {
      $: '&:is([dir="rtl"] *) a[rel="prev"]::before',
      mask: `url("${svgIconUrl(arrowRightIcon)}") center / contain no-repeat`,
    },
    NextIconRtl: {
      $: '&:is([dir="rtl"] *) a[rel="next"]::before',
      mask: `url("${svgIconUrl(arrowLeftIcon)}") center / contain no-repeat`,
    },
  },
});
