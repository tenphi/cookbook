import { selectPopoverStyles } from "./select-popover-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

const versionSelectStyles = selectPopoverStyles({
  option: "Link",
  hoverOption: "HoverLink",
  currentOption: "CurrentLink",
});

export const VersionSwitcherRoot = defineComponent("VersionSwitcher", {
  as: "div",
  "data-tasty-anatomy": "VersionSwitcher",
  styles: {
    ...versionSelectStyles,
    display: "inline-flex",
    flexShrink: "0",
    Trigger: {
      ...versionSelectStyles.Trigger,
      blockSize: "min $control-height",
      inlinePadding: "$gap",
      fill: "#surface-2",
      border: true,
      preset: "small / strong",
      anchorName: "--version-trigger",
    },
    Panel: {
      ...versionSelectStyles.Panel,
      positionAnchor: "--version-trigger",
      blockInset: "(anchor(bottom) + $gap) start, auto end",
      inlineInset: {
        "": "anchor(left) start, auto end",
        "@mobile": "auto start, anchor(right) end",
      },
    },
  },
});
