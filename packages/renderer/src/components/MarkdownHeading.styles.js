import { useGlobalStyles } from "@tenphi/tasty";
import checkIcon from "../icons/check.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownHeadingStyles() {
  useGlobalStyles(
    ".cookbook-markdown-content .cookbook-heading-wrapper",
    resolveComponentStyles("MarkdownHeading", {
      position: "relative",
      color: "#heading",
      preset: "heading",
      Heading: {
        $: "> *",
        color: { "": null, "@own(:first-child)": "inherit" },
        display: { "": "", "@own(:first-child)": "inline" },
        inlinePadding: {
          "": null,
          "@own(:first-child)": "0 end",
          "(@own(:first-child)) & (@mobile)": "1.75rem end",
        },
      },
      Heading1: { $: "&.level-h1", preset: "h1" },
      Heading2: { $: "&.level-h2", preset: "h2" },
      Heading3: { $: "&.level-h3", preset: "h3" },
      Heading4: { $: "&.level-h4", preset: "h4" },
      Heading5: { $: "&.level-h5", preset: "h5" },
      Heading6: { $: "&.level-h6", preset: "h6" },
      Link: {
        $: "> .cookbook-anchor-link",
        position: { "": "absolute", "@mobile": "relative" },
        blockInset: {
          "": "((1lh - 1.75rem) / 2) start",
          "@mobile": "auto start",
        },
        inlineInset: { "": "-2rem start", "@mobile": "auto start" },
        display: "inline-grid",
        placeItems: "center",
        inlineSize: { "": "1.75rem", "@mobile": "1.5rem" },
        blockSize: { "": "1.75rem", "@mobile": "1.5rem" },
        inlineMargin: { "": "0 start", "@mobile": "-1.5rem start" },
        verticalAlign: { "": "baseline", "@mobile": "middle" },
        color: "#text-muted",
        opacity: {
          "": "1",
          "@media(hover: hover)": "0",
          "@mobile": "1",
        },
        radius: "$radius",
        userSelect: "none",
        textDecoration: "none",
        transition: "color $transition, fill $transition, opacity $transition",
      },
      RevealedLink: {
        $: "> .cookbook-anchor-link",
        opacity: {
          "": null,
          ":hover | @own(:focus-visible)": "1",
        },
      },
      HoverLink: {
        $: "> .cookbook-anchor-link",
        color: {
          "": null,
          "@own(:hover | :focus-visible)": "#accent-text",
        },
        fill: {
          "": null,
          "@own(:hover | :focus-visible)": "#surface-2-hover",
        },
      },
      LinkIcon: {
        $: "> .cookbook-anchor-link > .cookbook-anchor-icon",
        display: "block",
        preset: "inherit / tight",
        // Scale with the current heading without replacing its inherited typography.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        fontSize: "clamp(1rem, 0.65em, 1.5rem)",
        textAlign: "center",
        inlineSize: "1em",
        blockSize: "1em",
      },
      CopiedLink: {
        $: "> .cookbook-anchor-link",
        color: { "": null, '@own([data-copy-state="copied"])': "#green-text" },
        opacity: { "": null, '@own([data-copy-state="copied"])': "1" },
      },
      CopiedLinkIcon: {
        $: "> .cookbook-anchor-link > .cookbook-anchor-icon",
        visibility: {
          "": null,
          '@own(:is(.cookbook-anchor-link[data-copy-state="copied"] > .cookbook-anchor-icon))':
            "hidden",
        },
      },
      CopiedIcon: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
        $: '> .cookbook-anchor-link[data-copy-state="copied"]::after',
        content: '""',
        position: "absolute",
        inlineSize: "clamp(1rem, 0.65em, 1.5rem)",
        blockSize: "clamp(1rem, 0.65em, 1.5rem)",
        fill: "#current",
        // The imported SVG is encoded at build time and never evaluated in the browser.
        // eslint-disable-next-line tasty/no-runtime-styles-mutation
        mask: `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
    }),
  );
  return null;
}
