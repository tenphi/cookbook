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
    "$popover-transition": languageSelectStyles["$popover-transition"],
    Compact: {
      $: "&[data-compact]",
    },
    Trigger: {
      ...languageSelectStyles.Trigger,
      inlineSize: "8rem",
      blockSize: "$control-height",
      padding: "0 $gap",
      fill: "#clear",
      border: "0",
      transition: "color $transition, fill $transition",
    },
    HoverTrigger: { ...languageSelectStyles.HoverTrigger },
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
    TriggerLabel: { ...languageSelectStyles.TriggerLabel },
    Caret: { ...languageSelectStyles.Caret },
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
    OpenPanel: { ...languageSelectStyles.OpenPanel },
    PanelTitle: { ...languageSelectStyles.PanelTitle },
    Options: { ...languageSelectStyles.Options },
    Option: { ...languageSelectStyles.Option },
    HoverOption: { ...languageSelectStyles.HoverOption },
    CurrentOption: { ...languageSelectStyles.CurrentOption },
    Fallback: { $: ".fallback-label", color: "#text-muted" },
    Checkmark: { ...languageSelectStyles.Checkmark },
    SelectedCheckmark: { ...languageSelectStyles.SelectedCheckmark },
  },
});
