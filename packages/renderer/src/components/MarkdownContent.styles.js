import { useGlobalStyles } from "@tenphi/tasty";
import { resolveComponentStyles } from "./component-styles.js";
import { MarkdownInlineCodeStyles } from "./MarkdownInlineCode.styles.js";
import { SyntaxHighlightStyles } from "./SyntaxHighlight.styles.js";
import { MarkdownCodeBlockStyles } from "./MarkdownCodeBlock.styles.js";
import { MermaidSourceStyles } from "./MermaidSource.styles.js";
import { MermaidStyles } from "./Mermaid.styles.js";
import { MarkdownHeadingStyles } from "./MarkdownHeading.styles.js";
import { MarkdownAlertStyles } from "./MarkdownAlert.styles.js";
import { MarkdownTableStyles } from "./MarkdownTable.styles.js";
import chevronRightIcon from "../icons/chevron-right.svg?raw";
import { svgIconUrl } from "./svg-icon.js";
import { configureCookbookStates } from "./tasty-states.js";

configureCookbookStates();

export default function MarkdownStyles() {
  useGlobalStyles(
    ".cookbook-markdown-content",
    resolveComponentStyles("Markdown", {
      preset: "prose",
      Block: {
        $: ":where(p):not(.not-content *), :where(ul):not(.not-content *), :where(ol):not(.not-content *), :where(dl):not(.not-content *), :where(blockquote):not(.not-content *), :where(pre):not(.not-content *), :where(table):not(.not-content *), :where(hr):not(.not-content *), :where(details):not(.not-content *)",
        blockMargin: "0",
      },
      // Linked Cards are block content even though their root is an anchor.
      BlockSpacing: {
        $: ":not(a):not(strong):not(em):not(del):not(span):not(input):not(code):not(br) + :not(a):not(strong):not(em):not(del):not(span):not(input):not(code):not(br):not(li):not(dt):not(dd):not(.not-content *), :not(a):not(strong):not(em):not(del):not(span):not(input):not(code):not(br) + a.td-card, a.td-card + :not(a):not(strong):not(em):not(del):not(span):not(input):not(code):not(br):not(li):not(dt):not(dd):not(.not-content *), a.td-card + a.td-card",
        // Keep owned components such as Callout's end margin while applying prose spacing.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        marginBlockStart: "($gap * 3)",
      },
      HeadingSpacing: {
        $: ":not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h1):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h2):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h3):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h4):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h5):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(h6):not(.not-content *), :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.cookbook-heading-wrapper) + :where(.cookbook-heading-wrapper):not(.not-content *)",
        blockMargin: "1.5em start",
      },
      List: {
        $: ":where(ul):not(.not-content *), :where(ol):not(.not-content *)",
        inlinePadding: "1.5rem start",
      },
      CompactItem: {
        $: ":where(li + li):not(.not-content *), :where(dt + dt):not(.not-content *), :where(dt + dd):not(.not-content *), :where(dd + dd):not(.not-content *)",
        blockMargin: "($gap * 0.5) start",
      },
      ListItem: {
        $: "li:not(.not-content *)",
        overflowWrap: "anywhere",
      },
      DefinitionTerm: { $: "dt:not(.not-content *)", preset: "strong" },
      DefinitionDescription: {
        $: "dd:not(.not-content *)",
        inlinePadding: "($gap * 2) start",
      },
      Link: {
        $: "a:not(.not-content *)",
        color: "#accent-text",
        textUnderlineOffset: "0.15em",
      },
      HoverLink: { $: "a:hover:not(.not-content *)", color: "#text" },
      Quote: {
        $: "blockquote:not(.not-content *)",
        inlinePadding: "2x start",
        color: "#text-soft",
        inlineBorder: "1bw solid #border start",
      },
      Rule: {
        $: "hr:not(.not-content *)",
        border: "0",
        blockBorder: "$border-width solid #border end",
      },
      Details: {
        $: "details:not(.not-content *)",
        inlinePadding: "($gap * 2) start",
        inlineBorder: "2px solid #border start",
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: "#border",
      },
      HoverDetails: {
        $: "details:not([open]):hover:not(.not-content *), details:has(> summary:hover):not(.not-content *)",
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: "#accent-text",
      },
      Summary: {
        $: "summary:not(.not-content *)",
        display: "block",
        inlineMargin: "-0.5rem start",
        inlinePadding: "0.5rem start",
        color: "#text",
        preset: "strong",
      },
      OpenSummary: {
        $: "details[open] > summary:not(.not-content *)",
        blockMargin: "($gap * 2) end",
      },
      SummaryMarker: {
        $: "summary:not(.not-content *)::marker, summary:not(.not-content *)::-webkit-details-marker",
        hide: true,
      },
      SummaryIcon: {
        $: "summary:not(.not-content *)::before",
        content: '""',
        display: "inline-block",
        inlineSize: "1.25rem",
        blockSize: "1.25rem",
        inlineMargin: "($gap * 0.5) end",
        verticalAlign: "middle",
        fill: "#current",
        // The imported SVG is encoded at build time and never evaluated in the browser.
        // eslint-disable-next-line tasty/no-runtime-styles-mutation
        mask: `url("${svgIconUrl(chevronRightIcon)}") center / contain no-repeat`,
        transition: "rotate $transition",
      },
      OpenSummaryIcon: {
        $: "details[open] > summary:not(.not-content *)::before",
        rotate: "90deg",
      },
      Code: {
        $: ":where(code):not(.not-content *)",
        radius: "($radius * 0.65)",
      },
    }),
  );

  MarkdownInlineCodeStyles();
  SyntaxHighlightStyles();
  MarkdownCodeBlockStyles();
  MermaidSourceStyles();
  MermaidStyles();
  MarkdownHeadingStyles();
  MarkdownAlertStyles();
  MarkdownTableStyles();
  return null;
}
