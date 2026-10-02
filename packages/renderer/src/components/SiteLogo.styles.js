import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SiteLogoRoot = defineComponent("SiteLogo", {
  as: "span",
  "data-element": "SiteLogo",
  styles: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    inlineSize: { "": "auto max 12rem", "@mobile": "auto max 30vw" },
    blockSize: { "": "2rem", "@mobile": "1.75rem" },
    Image: {
      $: "> img",
      display: "block",
      inlineSize: "auto max 100%",
      blockSize: "100%",
      objectFit: "contain",
    },
    Light: {
      $: "> .td-site-logo__light",
      hide: { "": false, "@dark": true },
    },
    Dark: {
      $: "> .td-site-logo__dark",
      hide: { "": true, "@dark": false },
    },
  },
});
