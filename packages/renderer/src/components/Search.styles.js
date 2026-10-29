import closeIcon from "../icons/close.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SearchRoot = defineComponent("Search", {
  as: "cookbook-search",
  "data-element": "Search",
  styles: {
    display: "contents",
    "$dialog-transition": "120ms",
    Status: {
      $: "Status",
      margin: "auto",
      textAlign: "center",
      whiteSpace: "pre-line",
      preset: "body",
    },
    Dialog: {
      $: "dialog",
      radius: { "": "1cr", "!@md": "0" },
      inlineSize: { "": "0 90% 40rem", "!@md": "100%" },
      blockSize: {
        "": "15rem max-content (100% - 8rem)",
        "!@md": "100% 100% 100%",
      },
      margin: { "": "4rem auto auto", "!@md": "0" },
      padding: "0",
      color: "#text",
      border: true,
      fill: "#surface",
      shadow: "0 1rem 3rem #shadow",
      opacity: "0",
      scale: { "": "0.98", "!@md": "1" },
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
    OpenDialog: { $: "dialog", display: { "": null, "@own([open])": "flex" } },
    EnteredDialog: {
      $: "dialog",
      opacity: { "": null, "@own([open] & [data-open])": "1" },
      scale: { "": null, "@own([open] & [data-open])": "1" },
    },
    Backdrop: {
      $: "dialog::backdrop",
      fill: { "": "#overlay", "!@md": "#clear" },
      backdropFilter: { "": "blur(0.25rem)", "!@md": "none" },
      opacity: "0",
      transition: {
        "": "none",
        "!@reduced-motion & @md":
          "opacity $dialog-transition ease-out, display $dialog-transition allow-discrete, overlay $dialog-transition allow-discrete",
      },
    },
    EnteredBackdrop: {
      $: "dialog[open][data-open]::backdrop",
      opacity: { "": "1", "!@md": "0" },
    },
    Frame: {
      $: "Frame",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      blockSize: "min 0",
      gap: "2x",
      padding: { "": "3x", "!@md": "2x 2x 0" },
      overflow: "hidden",
    },
    Container: {
      $: "Container",
      display: "flex",
      flow: "column",
      flexGrow: "1",
      inlineSize: "100%",
      blockSize: "min 0",
    },
    Close: {
      $: 'button[data-element="Close"]',
      display: "grid",
      hide: { "": true, "!@md": false },
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
      transition: "color, fill",
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
