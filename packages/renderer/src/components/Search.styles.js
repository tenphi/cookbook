import closeIcon from "../icons/close.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SearchRoot = defineComponent("Search", {
  as: "site-search",
  "data-tasty-anatomy": "Search",
  styles: {
    display: "contents",
    "$dialog-transition": "120ms",
    Status: {
      $: "[data-search-status]",
      margin: "auto",
      textAlign: "center",
      whiteSpace: "pre-line",
      preset: "body",
    },
    Dialog: {
      $: "dialog",
      radius: { "": "$card-radius", "@mobile": "0" },
      inlineSize: { "": "0 90% 40rem", "@mobile": "100%" },
      blockSize: { "": "max-content", "@mobile": "100%" },
      maxBlockSize: { "": "(100% - 8rem)", "@mobile": "100%" },
      minBlockSize: { "": "15rem", "@mobile": "100%" },
      margin: { "": "4rem auto auto", "@mobile": "0" },
      padding: "0",
      color: "#text",
      border: true,
      fill: "#surface",
      shadow: "0 1rem 3rem #shadow",
      opacity: "0",
      scale: { "": "0.98", "@mobile": "1" },
      transition: {
        "": "none",
        "!@reduced-motion":
          "opacity $dialog-transition ease-out, scale $dialog-transition ease-out, display $dialog-transition allow-discrete, overlay $dialog-transition allow-discrete",
      },
    },
    CloseIcon: {
      $: "button[data-close-modal]::before",
      content: '""',
      display: "block",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
      mask: `url("${svgIconUrl(closeIcon)}") center / contain no-repeat`,
    },
    OpenDialog: { $: "dialog[open]", display: "flex" },
    EnteredDialog: {
      $: "dialog[open][data-open]",
      opacity: "1",
      scale: "1",
    },
    Backdrop: {
      $: "dialog::backdrop",
      fill: { "": "#overlay", "@mobile": "#clear" },
      backdropFilter: { "": "blur(0.25rem)", "@mobile": "none" },
      opacity: "0",
      transition: {
        "": "none",
        "!@reduced-motion & !@mobile":
          "opacity $dialog-transition ease-out, display $dialog-transition allow-discrete, overlay $dialog-transition allow-discrete",
      },
    },
    EnteredBackdrop: {
      $: "dialog[open][data-open]::backdrop",
      opacity: { "": "1", "@mobile": "0" },
    },
    Frame: {
      $: ".dialog-frame",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      minBlockSize: "0",
      gap: "($gap * 2)",
      padding: { "": "($gap * 3)", "@mobile": "($gap * 2) ($gap * 2) 0" },
      overflow: "hidden",
    },
    Container: {
      $: ".search-container",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      inlineSize: "100%",
      minBlockSize: "0",
    },
    Close: {
      $: "button[data-close-modal]",
      display: { "": "none", "@mobile": "grid" },
      placeItems: "center",
      alignSelf: "flex-end",
      flexShrink: "0",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
      minBlockSize: "$docs-menu-button-size",
      padding: "0",
      color: "#text-soft",
      border: "0",
      radius: "$header-control-radius",
      fill: "#clear",
      boxShadow: "none",
      cursor: "pointer",
      transition: "color $transition, background-color $transition",
    },
    HoverClose: {
      $: "button[data-close-modal]:hover",
      color: "#text",
      fill: "#surface-2-hover",
    },
    ActiveClose: {
      $: "button[data-close-modal]:active",
      color: "#text",
      fill: "#surface-2-pressed",
    },
  },
});
