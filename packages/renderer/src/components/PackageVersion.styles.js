import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PackageVersionRoot = defineComponent("PackageVersion", {
  as: "span",
  "data-tasty-anatomy": "PackageVersion",
  styles: {
    display: "inline-flex",
    hide: { "": false, "@compact": true },
    alignItems: "center",
    flexShrink: "0",
    blockSize: "min 1.5rem",
    inlinePadding: "($gap * 0.75)",
    color: "#text-soft",
    fill: "#surface-2",
    border: true,
    radius: "999px",
    preset: "small",
    whiteSpace: "nowrap",
  },
});
