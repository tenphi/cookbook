import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SkipLinkRoot = defineComponent("SkipLink", {
  as: "a",
  "data-tasty-anatomy": "SkipLink",
  styles: {
    position: "fixed",
    inset: "($gap * 1.5) auto auto ($gap * 1.5)",
    inlineSize: "1px",
    blockSize: "1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    Focus: {
      $: "&:where(*)",
      zIndex: { "": null, ":focus": "20" },
      inlineSize: { "": null, ":focus": "auto" },
      blockSize: { "": null, ":focus": "auto" },
      padding: { "": null, ":focus": "$gap ($gap * 2)" },
      overflow: { "": null, ":focus": "visible" },
      color: { "": null, ":focus": "#accent-surface-text" },
      fill: { "": null, ":focus": "#accent-surface" },
      clip: { "": null, ":focus": "auto" },
      radius: { "": null, ":focus": "$radius" },
      shadow: { "": null, ":focus": "0 1rem 3rem #shadow" },
      textDecoration: { "": null, ":focus": "none" },
    },
  },
});
