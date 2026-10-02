import closeIcon from "../icons/close.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SearchRoot = defineComponent("Search", {
  as: "site-search",
  "data-element": "Search",
  styles: {
    display: "contents",
    "$dialog-transition": "120ms",
    Status: {
      $: '[data-element="Status"]',
      margin: "auto",
      textAlign: "center",
      whiteSpace: "pre-line",
      preset: "body",
    },
    Dialog: {
      $: "dialog",
      radius: { "": "$card-radius", "@mobile": "0" },
      inlineSize: { "": "0 90% 40rem", "@mobile": "100%" },
      blockSize: {
        "": "15rem max-content (100% - 8rem)",
        "@mobile": "100% 100% 100%",
      },
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
      $: 'button[data-element="Close"]::before',
      content: '""',
      display: "block",
      flexGrow: "0",
      flexShrink: "0",
      flexBasis: "auto",
      inlineSize: "1rem",
      blockSize: "1rem",
      fill: "#current",
      // The imported SVG is encoded at build time and never evaluated in the browser.
      // eslint-disable-next-line tasty/no-runtime-styles-mutation
      mask: `url("${svgIconUrl(closeIcon)}") center / contain no-repeat`,
    },
    OpenDialog: { $: "dialog", display: { "": "", "@own([open])": "flex" } },
    EnteredDialog: {
      $: "dialog",
      opacity: { "": null, "@own([open] & [data-open])": "1" },
      scale: { "": null, "@own([open] & [data-open])": "1" },
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
      // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: "dialog[open][data-open]::backdrop",
      opacity: { "": "1", "@mobile": "0" },
    },
    Frame: {
      $: ".dialog-frame",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      blockSize: "min 0",
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
      blockSize: "min 0",
    },
    Close: {
      $: 'button[data-element="Close"]',
      display: { "": "none", "@mobile": "grid" },
      placeItems: "center",
      alignSelf: "flex-end",
      flexShrink: "0",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size $docs-menu-button-size initial",
      padding: "0",
      color: "#text-soft",
      border: "0",
      radius: "$header-control-radius",
      fill: "#clear",
      shadow: "none",
      cursor: "pointer",
      transition: "color $transition, background-color $transition",
    },
    HoverClose: {
      $: 'button[data-element="Close"]',
      color: { "": null, "@own(:hover)": "#text" },
      fill: {
        "": null,
        "@own(:hover)": "#surface-2-hover",
      },
    },
    ActiveClose: {
      $: 'button[data-element="Close"]',
      color: { "": null, "@own(:active)": "#text" },
      fill: {
        "": null,
        "@own(:active)": "#surface-2-pressed",
      },
    },
  },
});
