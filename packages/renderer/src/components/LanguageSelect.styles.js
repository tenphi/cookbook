import { selectPopoverStyles } from "./select-popover-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

const languageSelectStyles = selectPopoverStyles();

export const LanguageSelectRoot = defineComponent("LanguageSelect", {
  as: "cookbook-language-select",
  "data-element": "LanguageSelect",
  styles: {
    display: "flex",
    flexShrink: "0",
    // Shared selector defaults are resolved once during server-side module evaluation.
    // eslint-disable-next-line tasty/no-runtime-styles-mutation
    "$popover-transition": languageSelectStyles["$popover-transition"],
    Trigger: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Trigger,
      inlineSize: "8rem",
      blockSize: "$control-height",
      padding: "0 $gap",
      fill: "#clear",
      border: "0",
      transition: "color $transition, fill $transition",
    },
    HoverTrigger: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.HoverTrigger,
    },
    ActiveTrigger: {
      $: "> button",
      color: { "": null, "@own(:active)": "#text" },
      fill: { "": null, "@own(:active)": "#surface-2-pressed" },
    },
    LabelIcon: {
      $: "> button > .label-icon",
      display: "block",
      flexShrink: "0",
      inlineSize: { "": "1.25rem", "@mobile": "1.125rem" },
      blockSize: { "": "1.25rem", "@mobile": "1.125rem" },
    },
    TriggerLabel: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.TriggerLabel,
    },
    Caret: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Caret,
    },
    CompactTrigger: {
      $: "& > button",
      inlineSize: { "": null, "[data-compact]": "$docs-menu-button-size" },
      blockSize: { "": null, "[data-compact]": "$docs-menu-button-size" },
      padding: { "": null, "[data-compact]": "0" },
    },
    CompactLabel: {
      $: "& > button > .trigger-label",
      hide: { "": null, "[data-compact]": true },
    },
    CompactCaret: {
      $: "& > button > :is(.caret)",
      hide: { "": null, "[data-compact]": true },
    },
    Label: { $: "> button" },
    HoverLabel: {
      // Preserve the conditional scope of this empty legacy customization hook.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: "> button:hover",
    },
    Select: { $: "> button" },
    CompactSelect: {
      // Preserve the conditional scope of this empty legacy customization hook.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: "&[data-compact] > button",
    },
    CompactLabelIcon: {
      // Preserve the conditional scope of this empty legacy customization hook.
      // eslint-disable-next-line tasty/no-state-in-selector
      $: "&[data-compact] > button > .label-icon",
    },
    SidebarTrigger: {
      $: "& > button",
      anchorName: { "": null, "[data-sidebar]": "--language-trigger" },
    },
    Panel: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Panel,
      blockInset: { "": "4rem start", "@mobile": "3.5rem start" },
      inlineInset:
        "max($docs-nav-pad-x, ((100vw - $layout-width) / 2 + $docs-sidebar-pad-x)) end",
    },
    SidebarPanel: {
      $: '& > [data-element="Panel"]',
      positionAnchor: {
        "": null,
        "[data-sidebar]": "--language-trigger",
      },
      blockInset: {
        "": null,
        "[data-sidebar]": "auto start, anchor(top) end",
      },
      blockMargin: { "": null, "[data-sidebar]": "$gap end" },
      inlineInset: {
        "": null,
        "[data-sidebar]": "$gap start, auto end",
      },
      inlineSize: {
        "": null,
        "[data-sidebar]": "min(20rem, calc(100vw - 4rem))",
      },
      blockSize: {
        "": null,
        "[data-sidebar]": "max (100dvh - 8rem)",
      },
      transformOrigin: {
        "": null,
        "[data-sidebar]": "bottom",
      },
    },
    OpenPanel: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.OpenPanel,
    },
    PanelTitle: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.PanelTitle,
    },
    Options: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Options,
    },
    Option: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Option,
    },
    HoverOption: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.HoverOption,
    },
    CurrentOption: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.CurrentOption,
    },
    Fallback: { $: ".fallback-label", color: "#text-muted" },
    Checkmark: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.Checkmark,
    },
    SelectedCheckmark: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...languageSelectStyles.SelectedCheckmark,
    },
  },
});
