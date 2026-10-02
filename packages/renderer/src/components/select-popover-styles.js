/** Shared server-side styles for the language and version selectors. */
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
      gap: "($gap * 0.5)",
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
      $: ".trigger-label",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    Caret: {
      $: "> button > .caret",
      flexShrink: "0",
      inlineSize: "0.875rem",
      blockSize: "0.875rem",
    },
    Panel: {
      $: '> [data-element="Panel"]',
      position: "fixed",
      inset: "auto",
      inlineSize: "min(15rem, calc(100vw - 2 * $docs-nav-pad-x))",
      blockSize: "max (100dvh - $docs-nav-height - $gap)",
      overflowY: "auto",
      margin: "0",
      padding: "$gap",
      color: "#text",
      fill: "#surface-2",
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
      $: '> [data-element="Panel"]',
      opacity: {
        "": null,
        "@own(@popover-open & [data-open])": "1",
      },
      scale: { "": null, "@own(@popover-open & [data-open])": "1" },
    },
    PanelTitle: {
      $: ".panel-title",
      padding: "($gap * 0.75) $gap",
      color: "#text-muted",
      preset: "small / strong",
    },
    Options: { $: "nav", display: "grid", gap: "($gap * 0.25)" },
    [option]: {
      $: "nav a",
      display: "flex",
      alignItems: "center",
      gap: "$gap",
      blockSize: "min 2.25rem",
      padding: "($gap * 0.75) $gap",
      color: "#text-soft",
      preset: "small",
      textDecoration: "none",
      radius: "$radius",
    },
    [hoverOption]: {
      $: "nav a",
      color: { "": null, "@own(:is(nav a:hover))": "#text" },
      fill: { "": null, "@own(:is(nav a:hover))": "#surface-2-hover" },
    },
    [currentOption]: {
      $: "nav a",
      color: {
        "": null,
        '@own(:is(nav a[aria-current="page"]))': "#accent-text",
      },
      fill: {
        "": null,
        '@own(:is(nav a[aria-current="page"]))': "#accent-surface-2-subtle",
      },
    },
    Checkmark: {
      $: "nav a > .checkmark",
      flexShrink: "0",
      inlineMargin: "auto start",
      inlineSize: "1rem",
      blockSize: "1rem",
      visibility: "hidden",
    },
    SelectedCheckmark: {
      $: "nav a > .checkmark",
      visibility: {
        "": null,
        '@own(:is(nav a[aria-current="page"] > .checkmark))': "visible",
      },
    },
  };
}
