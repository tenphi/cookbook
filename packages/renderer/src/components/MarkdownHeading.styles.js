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
        $: "> :first-child",
        color: "inherit",
        display: "inline",
        paddingInlineEnd: { "": "0", "@mobile": "1.75rem" },
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
        insetBlockStart: {
          "": "((1lh - 1.75rem) / 2)",
          "@mobile": "auto",
        },
        insetInlineStart: { "": "-2rem", "@mobile": "auto" },
        display: "inline-grid",
        placeItems: "center",
        inlineSize: { "": "1.75rem", "@mobile": "1.5rem" },
        blockSize: { "": "1.75rem", "@mobile": "1.5rem" },
        marginInlineStart: { "": "0", "@mobile": "-1.5rem" },
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
        $: "&:hover > .cookbook-anchor-link, > .cookbook-anchor-link:focus-visible",
        opacity: "1",
      },
      HoverLink: {
        $: "> .cookbook-anchor-link:hover, > .cookbook-anchor-link:focus-visible",
        color: "#accent-text",
        fill: "#surface-2-hover",
      },
      LinkIcon: {
        $: "> .cookbook-anchor-link > .cookbook-anchor-icon",
        display: "block",
        fontSize: "clamp(1rem, 0.65em, 1.5rem)",
        lineHeight: "1",
        textAlign: "center",
        inlineSize: "1em",
        blockSize: "1em",
      },
      CopiedLink: {
        $: '> .cookbook-anchor-link[data-copy-state="copied"]',
        color: "#green-text",
        opacity: "1",
      },
      CopiedLinkIcon: {
        $: '> .cookbook-anchor-link[data-copy-state="copied"] > .cookbook-anchor-icon',
        visibility: "hidden",
      },
      CopiedIcon: {
        $: '> .cookbook-anchor-link[data-copy-state="copied"]::after',
        content: '""',
        position: "absolute",
        inlineSize: "clamp(1rem, 0.65em, 1.5rem)",
        blockSize: "clamp(1rem, 0.65em, 1.5rem)",
        fill: "#current",
        mask: `url("${svgIconUrl(checkIcon)}") center / contain no-repeat`,
      },
    }),
  );
  return null;
}
