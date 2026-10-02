import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const SocialIconsRoot = defineComponent("SocialIcons", {
  as: "div",
  "data-element": "SocialIcons",
  styles: {
    display: "flex",
    alignItems: "center",
    gap: "($gap * 0.5)",
    Link: {
      $: "a",
      display: "grid",
      placeItems: "center",
      inlineSize: "$control-height",
      blockSize: "$control-height",
      color: "#text-soft",
      fill: "#clear",
      radius: "$header-control-radius",
      textDecoration: "none",
    },
    HoverLink: {
      $: "a",
      color: { "": null, "@own(:hover)": "#text" },
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    Icon: {
      $: "a > svg",
      display: "block",
      inlineSize: "1.25rem",
      blockSize: "1.25rem",
    },
  },
});
