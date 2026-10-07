import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SkipLinkRoot = defineComponent("SkipLink", {
  as: "a",
  "data-element": "SkipLink",
  styles: {
    "$visually-hidden-size": "1px",
    zIndex: { "": null, ":focus": "20" },
    color: { "": null, ":focus": "#accent-surface-text" },
    fill: { "": null, ":focus": "#accent-surface" },
    radius: { "": null, ":focus": "$radius" },
    shadow: { "": null, ":focus": "0 1rem 3rem #shadow" },
    textDecoration: { "": null, ":focus": "none" },
    position: "fixed",
    inset: "($gap * 1.5) auto auto ($gap * 1.5)",
    inlineSize: { "": "$visually-hidden-size", ":focus": "auto" },
    blockSize: { "": "$visually-hidden-size", ":focus": "auto" },
    padding: { "": "0", ":focus": "$gap ($gap * 2)" },
    overflow: { "": "hidden", ":focus": "visible" },
    clip: { "": "rect(0, 0, 0, 0)", ":focus": "auto" },
  },
});
