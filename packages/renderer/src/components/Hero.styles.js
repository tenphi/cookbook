import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const HeroRoot = defineComponent("Hero", {
  as: "div",
  "data-element": "Hero",
  styles: {
    display: "grid",
    gridColumns: {
      "": "minmax(0, 7fr) minmax(12rem, 4fr)",
      "@mobile": "minmax(0, 1fr)",
    },
    alignItems: "center",
    gap: "clamp(2rem, 5vw, 5rem)",
    blockPadding: {
      "": "clamp(3rem, 8vw, 7rem) start, clamp(2rem, 6vw, 5rem) end",
      "@mobile": "($gap * 4) start, clamp(2rem, 6vw, 5rem) end",
    },
    Visual: {
      $: "> img, > Visual",
      order: { "": "2", "@mobile": "0" },
      display: "grid",
      placeItems: "center",
      inlineSize: "min(100%, 22rem)",
      blockSize: "auto",
      objectFit: "contain",
      inlineMargin: "auto",
      color: "#logo-surface",
    },
    DarkVisual: {
      $: "> img",
      hide: {
        "": null,
        '@own([data-hero-image="dark"])': false,
        '(@own([data-hero-image="dark"])) & (@light)': true,
      },
    },
    LightVisual: {
      $: "> img",
      hide: {
        "": null,
        '@own([data-hero-image="light"])': true,
        '(@own([data-hero-image="light"])) & (@light)': false,
      },
    },
    Stack: {
      $: "> Stack",
      display: "flex",
      flow: "column",
      alignItems: { "": "flex-start", "@mobile": "center" },
      gap: "clamp(1.5rem, 3vw, 2rem)",
      textAlign: { "": "start", "@mobile": "center" },
    },
    Copy: {
      $: "> Stack > Copy",
      display: "flex",
      flow: "column",
      alignItems: "inherit",
      gap: "($gap * 2)",
    },
    Title: {
      $: "h1",
      inlineSize: "max 16ch",
      margin: "0",
      color: "#heading",
      preset: "hero-title",
      textWrap: "balance",
    },
    Tagline: {
      $: "Tagline",
      inlineSize: "max 48ch",
      color: "#text-soft",
      preset: "hero-tagline",
      textWrap: "balance",
    },
    Actions: {
      $: "Actions",
      display: "flex",
      flow: "row wrap",
      justifyContent: { "": "flex-start", "@mobile": "center" },
      gap: "($gap * 1.5)",
    },
    Action: {
      $: "Action",
      display: "inline-flex",
      alignItems: "center",
      blockSize: "min $control-height",
      padding: "($gap * 1.25) ($gap * 2.5)",
      gap: "$gap",
      color: "#text",
      border: { "": true, "@own(minimal)": "#clear" },
      radius: "round",
      fill: "#surface-2",
      preset: "navigation / strong",
      textDecoration: "none",
      transition: "fill $transition",
    },
    HoverAction: {
      $: "[data-element=Action]",
      fill: { "": null, "@own(:hover)": "#surface-2-hover" },
    },
    PrimaryAction: {
      $: "[data-element=Action]",
      color: { "": null, "@own(primary)": "#accent-surface-text" },
      // Recolor only; Action owns the border width and style, including theme overrides.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: { "": null, "@own(primary)": "#accent-surface" },
      fill: { "": null, "@own(primary)": "#accent-surface" },
    },
    SecondaryAction: {
      $: "[data-element=Action]",
      color: { "": null, "@own(secondary)": "#accent-text" },
      // Recolor only; Action owns the border width and style, including theme overrides.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: { "": null, "@own(secondary)": "#border-strong" },
    },
    MinimalAction: {
      $: "[data-element=Action]",
      color: { "": null, "@own(minimal)": "#accent-text" },
      // Recolor only so theme.styles.Hero.Action can still own border geometry.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      borderColor: { "": null, "@own(minimal)": "#clear" },
    },
    ActionIcon: { $: "Action svg", flexShrink: "0" },
  },
});
