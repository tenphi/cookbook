import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const HeaderLinksRoot = defineComponent("HeaderLinks", {
  as: "cookbook-header-links",
  "data-element": "HeaderLinks",
  styles: {
    display: "flex",
    flexShrink: "0",
    order: { "": "0", "@mobile": "2" },
    "$popover-transition": "120ms",
    Desktop: {
      $: "Desktop",
      display: "flex",
      hide: { "": false, "@mobile": true },
      alignItems: "center",
      gap: "($gap * 0.5)",
    },
    Link: {
      $: "a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      blockSize: "min $control-height",
      padding: "$gap ($gap * 1.25)",
      radius: "$radius",
      color: "#text-soft",
      fill: "#clear",
      preset: "small / strong",
      textDecoration: "none",
      whiteSpace: "nowrap",
    },
    DesktopLink: {
      $: "Desktop a",
      radius: "$header-control-radius",
      inlinePadding: "($gap * 2)",
    },
    HoverLink: {
      $: "a",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    PrimaryLink: {
      $: "a",
      color: {
        "": null,
        '@own([data-variant="primary"])': "#accent-surface-text",
      },
      fill: { "": null, '@own([data-variant="primary"])': "#accent-surface" },
    },
    HoverPrimaryLink: {
      $: "a",
      filter: {
        "": null,
        '@own([data-variant="primary"] & :hover)': "brightness(1.1)",
      },
    },
    Trigger: {
      $: "Trigger",
      display: "grid",
      hide: { "": true, "@mobile": false },
      placeItems: "center",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
      padding: "0",
      border: "0",
      radius: "$header-control-radius",
      color: "#text-soft",
      fill: "#clear",
    },
    HoverTrigger: {
      $: "[data-element=Trigger]",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    Panel: {
      $: "Panel",
      position: "fixed",
      inset: "0.5rem $docs-nav-pad-x auto auto",
      inlineSize: "min(20rem, calc(100vw - 2 * $docs-nav-pad-x))",
      blockSize: "max (100dvh - 1rem)",
      overflowY: "auto",
      margin: "0",
      padding: "$gap",
      color: "#text",
      fill: "#surface",
      border: true,
      radius: "$card-radius",
      shadow: "0 0.75rem 2rem #shadow",
      opacity: "0",
      scale: "1 0.96",
      transformOrigin: "top",
      transition: {
        "": "none",
        "!@reduced-motion":
          "opacity $popover-transition ease-out, scale $popover-transition ease-out, display $popover-transition allow-discrete, overlay $popover-transition allow-discrete",
      },
    },
    OpenPanel: {
      $: "[data-element=Panel]",
      opacity: { "": null, "@own(@popover-open & [data-open])": "1" },
      scale: { "": null, "@own(@popover-open & [data-open])": "1" },
    },
    PanelNavigation: {
      $: "Panel nav",
      display: "grid",
      gap: "1bw",
    },
    PanelLink: {
      $: "Panel a",
      justifyContent: "flex-start",
      blockSize: "min $docs-menu-button-size",
      inlinePadding: "($gap * 1.5)",
      preset: "navigation",
      textAlign: "start",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
    },
    FirstPanelLink: {
      $: "Panel a",
      inlinePadding: {
        "": null,
        "@own(:first-child)":
          "($gap * 1.5) start, ($docs-menu-button-size + $gap) end",
      },
    },
    Close: {
      $: "Close",
      position: "absolute",
      inset: "$gap $gap auto auto",
      display: "grid",
      placeItems: "center",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
      padding: "0",
      border: "0",
      color: "#text-soft",
      fill: "#clear",
      radius: "$header-control-radius",
    },
    HoverClose: {
      $: "[data-element=Close]",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
  },
});
