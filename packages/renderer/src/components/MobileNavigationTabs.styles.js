import { selectPopoverStyles } from "./select-popover-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

const sectionSelectStyles = selectPopoverStyles({
  option: "Link",
  hoverOption: "HoverLink",
  currentOption: "CurrentLink",
});

export const MobileNavigationTabsRoot = defineComponent(
  "MobileNavigationTabs",
  {
    as: "cookbook-popover",
    "data-element": "MobileNavigationTabs",
    styles: {
      // Reuse the shared, server-only popover anatomy.
      // eslint-disable-next-line tasty/no-style-spread
      ...sectionSelectStyles,
      display: "grid",
      hide: { "": false, "@md": true },
      inlineSize: "min 0",
      blockMargin: "0",
      Trigger: {
        // Reuse the shared, server-only popover anatomy.
        // eslint-disable-next-line tasty/no-style-spread
        ...sectionSelectStyles.Trigger,
        justifyContent: "space-between",
        inlineSize: "100%",
        blockSize: "min 2.75rem",
        padding: "1x 1.25x",
        border: true,
        radius: "1r",
        fill: "#surface",
        preset: "navigation",
        anchorName: "--section-trigger",
      },
      Panel: {
        // Reuse the shared, server-only popover anatomy.
        // eslint-disable-next-line tasty/no-style-spread
        ...sectionSelectStyles.Panel,
        positionAnchor: "--section-trigger",
        blockInset: "(anchor(bottom) + 1x) start, auto end",
        inlineInset: "anchor(start) start, auto end",
        inlineSize: "anchor-size(width)",
        blockSize: "max (100dvh - anchor(bottom) - 2x)",
      },
      // Keep the original disclosure's customization names on the Select anatomy.
      Label: {
        // eslint-disable-next-line tasty/no-style-spread -- shared label anatomy, retained under its original customization name.
        ...sectionSelectStyles.TriggerLabel,
      },
      List: { $: "> Panel > nav" },
      Item: { $: "> Panel > nav > a" },
      Marker: { $: "> button::marker" },
      ExpandedCaret: {
        $: "> button > Caret",
        rotate: { "": null, ":has([popover]:popover-open)": "180deg" },
      },
    },
  },
);
