import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const HeroRoot = customizeComponent(
  "Hero",
  tasty({
    as: "div",
    "data-tasty-anatomy": "Hero",
    styles: {
      display: "grid",
      gridTemplateColumns: {
        "": "minmax(0, 7fr) minmax(12rem, 4fr)",
        "@mobile": "minmax(0, 1fr)",
      },
      alignItems: "center",
      gap: "clamp(2rem, 5vw, 5rem)",
      paddingBlockStart: {
        "": "clamp(3rem, 8vw, 7rem)",
        "@mobile": "($gap * 4)",
      },
      paddingBlockEnd: "clamp(2rem, 6vw, 5rem)",
      Visual: {
        $: "> img, > .hero-html",
        order: { "": "2", "@mobile": "0" },
        display: "grid",
        placeItems: "center",
        inlineSize: "min(100%, 22rem)",
        blockSize: "auto",
        objectFit: "contain",
        marginInlineStart: "auto",
        marginInlineEnd: "auto",
        color: "#logo-surface",
      },
      DarkVisual: {
        $: '> img[data-hero-image="dark"]',
        hide: { "": false, "@light": true },
      },
      LightVisual: {
        $: '> img[data-hero-image="light"]',
        hide: { "": true, "@light": false },
      },
      Stack: {
        $: "> [class~='stack']",
        display: "flex",
        flow: "column",
        alignItems: { "": "flex-start", "@mobile": "center" },
        gap: "clamp(1.5rem, 3vw, 2rem)",
        textAlign: { "": "start", "@mobile": "center" },
      },
      Copy: {
        $: "> [class~='stack'] > [class~='copy']",
        display: "flex",
        flow: "column",
        alignItems: "inherit",
        gap: "($gap * 2)",
      },
      Title: {
        $: "h1",
        maxInlineSize: "16ch",
        margin: "0",
        color: "#heading",
        preset: "h1",
        fontSize: "clamp(2.75rem, 7vw, 4.75rem)",
        textWrap: "balance",
      },
      Tagline: {
        $: "[class~='tagline']",
        maxInlineSize: "48ch",
        color: "#text-soft",
        fontSize: "clamp(1.05rem, 2.5vw, 1.35rem)",
        lineHeight: "1.55",
        textWrap: "balance",
      },
      Actions: {
        $: "[class~='actions']",
        display: "flex",
        flow: "row wrap",
        justifyContent: { "": "flex-start", "@mobile": "center" },
        gap: "($gap * 1.5)",
      },
      Action: {
        $: ".cookbook-link-button",
        display: "inline-flex",
        alignItems: "center",
        minBlockSize: "$control-height",
        padding: "($gap * 1.25) ($gap * 2.5)",
        gap: "$gap",
        color: "#text",
        border: true,
        radius: "999px",
        fill: "#surface-2",
        preset: "navigation / strong",
        textDecoration: "none",
        transition: "fill $transition, translate $transition",
      },
      HoverAction: {
        $: ".cookbook-link-button:hover",
        fill: "#surface-2-hover",
        translate: "0 -1px",
      },
      PrimaryAction: {
        $: ".cookbook-link-button.primary",
        color: "#accent-surface-text",
        borderColor: "#accent-surface",
        fill: "#accent-surface",
      },
      SecondaryAction: {
        $: ".cookbook-link-button.secondary",
        color: "#accent-text",
        borderColor: "#border-strong",
      },
      MinimalAction: {
        $: ".cookbook-link-button.minimal",
        paddingInlineStart: "0",
        paddingInlineEnd: "0",
        color: "#accent-text",
        border: "0",
        fill: "#clear",
      },
      ActionIcon: { $: ".cookbook-link-button svg", flexShrink: "0" },
    },
  }),
);
