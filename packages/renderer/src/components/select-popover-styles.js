/** Shared server-side styles for the language, version, and section selectors. */
export function selectPopoverStyles({
  option = "Option",
  hoverOption = "HoverOption",
  currentOption = "CurrentOption",
} = {}) {
  return {
    "$popover-transition": "120ms",
    Trigger: {
      $: "> button",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5x",
      color: "#text-soft",
      radius: "$header-control-radius",
      preset: "small",
      cursor: "pointer",
    },
    HoverTrigger: {
      $: "> button",
      color: {
        "": null,
        "@own(:hover) | :has([popover]:popover-open)": "#text",
      },
      fill: {
        "": null,
        "@own(:hover) | :has([popover]:popover-open)": "#surface-2-hover",
      },
    },
    TriggerLabel: {
      $: "TriggerLabel",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    Caret: {
      $: "> button > Caret",
      flexShrink: "0",
      inlineSize: "0.875rem",
      blockSize: "0.875rem",
    },
    Panel: {
      $: '> [data-element="Panel"]',
      position: "fixed",
      inset: "auto",
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
      $: '> [data-element="Panel"]',
      opacity: {
        "": null,
        "@own(:popover-open & [data-open])": "1",
      },
      scale: { "": null, "@own(:popover-open & [data-open])": "1" },
    },
    PanelTitle: {
      $: "PanelTitle",
      padding: "0.75x 1x",
      color: "#text-muted",
      preset: "small / strong",
    },
    Options: { $: "nav", display: "grid", gap: "0.25x" },
    [option]: {
      $: "nav a",
      display: "flex",
      alignItems: "center",
      gap: "1x",
      blockSize: "min 2.25rem",
      padding: "0.75x 1x",
      color: "#text-soft",
      preset: "small",
      textDecoration: "none",
      radius: "1r",
    },
    [hoverOption]: {
      $: "nav a",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    [currentOption]: {
      $: "nav a",
      color: {
        "": null,
        '@own([aria-current="page"])': "#accent-text",
      },
      fill: {
        "": null,
        '@own([aria-current="page"])': "#accent-surface-2-subtle",
      },
    },
    Checkmark: {
      $: "nav a > Checkmark",
      flexShrink: "0",
      inlineMargin: "auto start",
      inlineSize: "1rem",
      blockSize: "1rem",
      visibility: "hidden",
    },
    SelectedCheckmark: {
      $: "nav a > [data-element=Checkmark]",
      visibility: {
        "": null,
        '@own(:is([aria-current="page"] >))': "visible",
      },
    },
  };
}
