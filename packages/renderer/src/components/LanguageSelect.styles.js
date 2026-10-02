import { selectPopoverStyles } from "./select-popover-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

const languageSelectStyles = selectPopoverStyles();

export const LanguageSelectRoot = defineComponent("LanguageSelect", {
  as: "cookbook-language-select",
  "data-tasty-anatomy": "LanguageSelect",
  styles: {
    display: "flex",
    flexShrink: "0",
    // Shared selector defaults are resolved once during server-side module evaluation.
    // eslint-disable-next-line tasty/no-runtime-styles-mutation
    "$popover-transition": languageSelectStyles["$popover-transition"],
    Compact: {
      $: "&[data-compact]",
    },
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
      $: "> button:active",
      color: "#text",
      fill: "#surface-2-pressed",
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
      $: "&[data-compact] > button",
      inlineSize: "$docs-menu-button-size",
      blockSize: "$docs-menu-button-size",
      padding: "0",
    },
    CompactLabel: {
      $: "&[data-compact] > button > .trigger-label",
      hide: true,
    },
    CompactCaret: {
      $: "&[data-compact] > button > [class~='caret']",
      hide: true,
    },
    Label: { $: "> button" },
    HoverLabel: { $: "> button:hover" },
    Select: { $: "> button" },
    CompactSelect: { $: "&[data-compact] > button" },
    CompactLabelIcon: { $: "&[data-compact] > button > .label-icon" },
    SidebarTrigger: {
      $: "&[data-sidebar] > button",
      anchorName: "--language-trigger",
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
      $: "&[data-sidebar] > [popover]",
      positionAnchor: "--language-trigger",
      blockInset: "auto start, anchor(top) end",
      blockMargin: "$gap end",
      inlineInset: "$gap start, auto end",
      inlineSize: "min(20rem, calc(100vw - 4rem))",
      blockSize: "max (100dvh - 8rem)",
      transformOrigin: "bottom",
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
