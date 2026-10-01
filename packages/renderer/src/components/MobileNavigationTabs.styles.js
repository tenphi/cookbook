import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const MobileNavigationTabsRoot = customizeComponent(
  "MobileNavigationTabs",
  tasty({
    as: "nav",
    "data-tasty-anatomy": "MobileNavigationTabs",
    styles: {
      display: "grid",
      hide: { "": false, "@desktop": true },
      gap: "$gap",
      blockMargin: "0",
      Label: {
        $: ".td-mobile-tabs__label",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      Trigger: {
        $: "summary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "$gap",
        blockSize: "min 2.75rem",
        padding: "$gap ($gap * 1.25)",
        border: true,
        radius: "$radius",
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
      ExpandedCaret: { $: "details[open] > summary > svg", rotate: "180deg" },
      List: {
        $: "ul",
        display: "grid",
        gap: "1bw",
        padding: "$gap",
        blockMargin: "$gap start",
        margin: "$gap 0 0",
        listStyle: "none",
        border: true,
        radius: "$radius",
        fill: "#surface",
      },
      Item: { $: "li", margin: "0" },
      Link: {
        $: "a",
        display: "flex",
        alignItems: "center",
        blockSize: "min 2.25rem",
        padding: "($gap * 0.75) ($gap * 1.25)",
        color: "#text-soft",
        preset: "navigation",
        textDecoration: "none",
        radius: "$radius",
      },
      HoverLink: {
        $: "a:hover",
        color: "#text",
        fill: "#surface-2-hover",
      },
      CurrentLink: {
        $: 'a[aria-current="page"]',
        color: "#accent-text",
        fill: "#accent-surface-subtle",
      },
    },
  }),
);
