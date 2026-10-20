import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const PackageVersionRoot = defineComponent("PackageVersion", {
  as: "span",
  "data-element": "PackageVersion",
  styles: {
    display: "inline-flex",
    hide: { "": false, "@media(w <= 23rem)": true },
    alignItems: "center",
    flexShrink: "0",
    blockSize: "min 1.5rem",
    inlinePadding: "0.75x",
    color: "#text-soft",
    fill: "#surface-2",
    border: true,
    radius: "round",
    preset: "small",
    whiteSpace: "nowrap",
  },
});
