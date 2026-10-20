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
      preset: {
        "": "heading",
        "level=h1": "h1",
        "level=h2": "h2",
        "level=h3": "h3",
        "level=h4": "h4",
        "level=h5": "h5",
        "level=h6": "h6",
      },
      Heading: {
        $: "> *",
        color: { "": null, "@own(:first-child)": "inherit" },
        display: { "": null, "@own(:first-child)": "inline" },
        inlinePadding: {
          "": null,
          "@own(:first-child)": "0 end",
          "@own(:first-child) & !@md": "1.75rem end",
        },
      },
      Link: {
        $: "> [data-element=Anchor]",
        position: { "": "absolute", "!@md": "relative" },
        blockInset: {
          "": "((1lh - 1.75rem) / 2) start",
          "!@md": "auto start",
        },
        inlineInset: { "": "-2rem start", "!@md": "auto start" },
        display: "inline-grid",
        placeItems: "center",
        inlineSize: { "": "1.75rem", "!@md": "1.5rem" },
        blockSize: { "": "1.75rem", "!@md": "1.5rem" },
        inlineMargin: { "": "0 start", "!@md": "-1.5rem start" },
        verticalAlign: { "": "baseline", "!@md": "middle" },
        color: "#text-muted",
        opacity: {
          "": "1",
          "@media(hover: hover)": "0",
          "!@md": "1",
        },
        radius: "1r",
        userSelect: "none",
        textDecoration: "none",
        transition: "color, fill, opacity",
      },
      RevealedLink: {
        $: "> [data-element=Anchor]",
        opacity: {
          "": null,
          ":hover | @own(:focus-visible)": "1",
        },
      },
      HoverLink: {
        $: "> [data-element=Anchor]",
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
        $: "> Anchor > [data-element=AnchorIcon]",
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
        $: "> [data-element=Anchor]",
        color: { "": null, '@own([data-copy-state="copied"])': "#green-text" },
        opacity: { "": null, '@own([data-copy-state="copied"])': "1" },
      },
      CopiedLinkIcon: {
        $: "> Anchor > [data-element=AnchorIcon]",
        visibility: {
          "": null,
          '@own(:is([data-copy-state="copied"] >))': "hidden",
        },
      },
      CopiedIcon: {
        $: '> Anchor[data-copy-state="copied"]::after',
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
