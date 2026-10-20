import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MobileNavigationTabsRoot = defineComponent(
  "MobileNavigationTabs",
  {
    as: "nav",
    "data-element": "MobileNavigationTabs",
    styles: {
      display: "grid",
      hide: { "": false, "@md": true },
      gap: "1x",
      blockMargin: "0",
      Label: {
        $: "Label",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      Trigger: {
        $: "summary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1x",
        blockSize: "min 2.75rem",
        padding: "1x 1.25x",
        border: true,
        radius: "1r",
        color: "#text-soft",
        fill: "#surface",
        preset: "navigation",
        listStyle: "none",
      },
      Marker: {
        $: "summary::marker, summary::-webkit-details-marker",
        hide: true,
      },
      Caret: { $: "summary > svg", flexShrink: "0" },
      ExpandedCaret: {
        $: "details > summary > svg",
        rotate: {
          "": null,
          "@own(:is([open] > summary >))": "180deg",
        },
      },
      List: {
        $: "ul",
        display: "grid",
        gap: "1bw",
        padding: "1x",
        margin: "1x top",
        listStyle: "none",
        border: true,
        radius: "1r",
        fill: "#surface",
      },
      Item: { $: "li", margin: "0" },
      Link: {
        $: "a",
        display: "flex",
        alignItems: "center",
        blockSize: "min 2.25rem",
        padding: "0.75x 1.25x",
        color: "#text-soft",
        preset: "navigation",
        textDecoration: "none",
        radius: "1r",
      },
      HoverLink: {
        $: "a",
        color: { "": null, "@own(:hover)": "#text" },
        fill: { "": null, "@own(:hover)": "#surface-2-hover" },
      },
      CurrentLink: {
        $: "a",
        color: { "": null, '@own([aria-current="page"])': "#accent-text" },
        fill: {
          "": null,
          '@own([aria-current="page"])': "#accent-surface-subtle",
        },
      },
    },
  },
);
