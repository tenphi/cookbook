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
    // Reuse the shared, server-only popover anatomy.
    // eslint-disable-next-line tasty/no-style-spread
    ...versionSelectStyles,
    display: "inline-flex",
    flexShrink: "0",
    Trigger: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...versionSelectStyles.Trigger,
      blockSize: "min $control-height",
      inlinePadding: "$gap",
      fill: "#surface-2",
      border: true,
      preset: "small / strong",
      anchorName: "--version-trigger",
    },
    Panel: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
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
