import { useGlobalStyles } from "@tenphi/tasty";
import checkIcon from "../icons/check.svg?raw";
import { resolveComponentStyles } from "./component-styles.js";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export function MarkdownHeadingStyles() {
  useGlobalStyles(
    "[data-element=Markdown] [data-element=MarkdownHeading]",
    resolveComponentStyles("MarkdownHeading", {
      position: "relative",
      color: "#heading",
      preset: {
        "": "heading",
        "[data-level=h1]": "h1",
        "[data-level=h2]": "h2",
        "[data-level=h3]": "h3",
        "[data-level=h4]": "h4",
        "[data-level=h5]": "h5",
        "[data-level=h6]": "h6",
      },
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
      Link: {
        $: "> [data-element=Anchor]",
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
          '@own(:is([data-element=Anchor][data-copy-state="copied"] > [data-element=AnchorIcon]))':
            "hidden",
        },
      },
      CopiedIcon: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
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
