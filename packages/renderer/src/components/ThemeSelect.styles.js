import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const ThemeSelectRoot = defineComponent("ThemeSelect", {
  as: "cookbook-appearance-menu",
  "data-element": "ThemeSelect",
  styles: {
    display: "flex",
    flexShrink: "0",
    "$popover-transition": "120ms",
    Trigger: {
      $: "> button",
      display: "grid",
      placeItems: "center",
      inlineSize: {
        "": "$control-height",
        "!@md": "$docs-menu-button-size",
      },
      blockSize: {
        "": "$control-height",
        "!@md": "$docs-menu-button-size",
      },
      padding: "0",
      color: "#text-soft",
      fill: "#clear",
      border: "0",
      radius: "$header-control-radius",
      transition: "color, fill",
    },
    HoverTrigger: {
      $: "> button",
      color: {
        "": null,
        "@own(:hover) | :has([popover]:is(:popover-open))": "#text",
      },
      fill: {
        "": null,
        "@own(:hover) | :has([popover]:is(:popover-open))": "#surface-2-hover",
      },
    },
    ActiveTrigger: {
      $: "> button",
      color: { "": null, "@own(:active)": "#text" },
      fill: { "": null, "@own(:active)": "#surface-2-pressed" },
    },
    Icon: {
      $: "> button svg",
      display: "block",
      inlineSize: { "": "1.25rem", "!@md": "1.125rem" },
      blockSize: { "": "1.25rem", "!@md": "1.125rem" },
    },
    Panel: {
      $: "Panel",
      position: "fixed",
      inset: "auto",
      blockInset: { "": "4rem start", "!@md": "3.5rem start" },
      inlineInset:
        "max($docs-nav-pad-x, ((100vw - $layout-width) / 2 + $docs-sidebar-pad-x)) end",
      inlineSize: "min(15rem, (100vw - 2 * $docs-nav-pad-x))",
      blockSize: "max (100dvh - $docs-nav-height - 1x)",
      overflowY: "auto",
      margin: "0",
      padding: "1x",
      color: "#text",
      fill: "#surface-2",
      border: true,
      radius: "1cr",
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
      $: '[data-element="Panel"]',
      opacity: {
        "": null,
        "@own(:is(:popover-open) & [data-open])": "1",
      },
      scale: { "": null, "@own(:is(:popover-open) & [data-open])": "1" },
    },
    Section: {
      $: "fieldset",
      inlineSize: "min 0",
      margin: "0",
      padding: "0",
      border: "0",
    },
    SectionSpacing: {
      $: "fieldset + fieldset",
      blockMargin: "1x start",
      blockPadding: "1x start",
      blockBorder: "1bw solid #border start",
    },
    SectionLabel: {
      $: "legend",
      float: "inline-start",
      inlineSize: "100%",
      padding: "0.75x 1x",
      color: "#text-muted",
      preset: "small / strong",
    },
    Option: {
      $: "label",
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "1x",
      inlineSize: "100%",
      blockSize: "min 2.25rem",
      padding: "0.75x 1x",
      color: "#text-soft",
      preset: "small",
      radius: "1r",
      cursor: "pointer",
    },
    HoverOption: {
      $: "label",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    CheckedOption: {
      $: "label",
      color: { "": null, "@own(:has(input:checked))": "#accent-text" },
      fill: {
        "": null,
        "@own(:has(input:checked))": "#accent-surface-2-subtle",
      },
    },
    FocusedOption: {
      $: "label",
      outline: {
        "": null,
        "@own(:has(input:focus-visible))":
          "$outline-width solid #focus / ($outline-offset * -1)",
      },
    },
    Input: {
      $: "input",
      "$visually-hidden-size": "1px",
      position: "absolute",
      inlineSize: "$visually-hidden-size",
      blockSize: "0 $visually-hidden-size",
      padding: "0",
      margin: "0",
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
    },
    OptionIcon: {
      $: "label > svg",
      display: "block",
      flexShrink: "0",
      inlineSize: "1rem",
      blockSize: "1rem",
    },
    Checkmark: {
      $: "label > svg",
      inlineMargin: {
        "": null,
        "@own(:last-child)": "auto start",
      },
      visibility: { "": null, "@own(:last-child)": "hidden" },
    },
    SelectedCheckmark: {
      $: "label > svg",
      visibility: {
        "": null,
        "@own(:last-child & :is(:has(input:checked) >))": "visible",
      },
    },
  },
});
