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
  // Prose must outrank component roots (two generated class selectors) so it
  // owns block spacing without targeting the containing element in a $ selector.
  useGlobalStyles(
    "[data-element=Markdown][data-element=Markdown][data-element=Markdown]",
    resolveComponentStyles("Markdown", {
      preset: "prose",
      Block: {
        $: ":where(p), :where(ul), :where(ol), :where(dl), :where(blockquote), :where(pre), :where(table), :where(hr), :where(details)",
        "$margin-block-start": {
          "": null,
          "@own(!:is([data-not-content] *))": "0",
        },
        "$margin-block-end": {
          "": null,
          "@own(!:is([data-not-content] *))": "0",
        },
        blockMargin: {
          "": null,
          "@own(!:is([data-not-content] *))":
            "$margin-block-start $margin-block-end",
        },
      },
      // Linked Cards are block content even though their root is an anchor.
      BlockSpacing: {
        // Prose spacing must win over each block component's root margin.
        $: "* + *",
        blockMargin: {
          "": null,
          "(@own(:is(:not(a,strong,em,del,span,input,code,br) + *)) | @own(:is(a[data-element=Card] + *))) & (@own(!:is(a,strong,em,del,span,input,code,br,li,dt,dd,[data-not-content] *)) | @own(:is(a[data-element=Card])))":
            "$margin-block-start $margin-block-end",
        },
        "$margin-block-start": {
          "": null,
          "(@own(:is(:not(a,strong,em,del,span,input,code,br) + *)) | @own(:is(a[data-element=Card] + *))) & (@own(!:is(a,strong,em,del,span,input,code,br,li,dt,dd,[data-not-content] *)) | @own(:is(a[data-element=Card])))":
            "($gap * 3)",
        },
      },
      HeadingSpacing: {
        $: "* + h1, * + h2, * + h3, * + h4, * + h5, * + h6, * + [data-element=MarkdownHeading]",
        "$margin-block-start": {
          "": null,
          "@own(:is(:not(h1,h2,h3,h4,h5,h6,[data-element=MarkdownHeading]) + *)) & @own(!:is([data-not-content] *))":
            "1.5em",
        },
        "$margin-block-end": {
          "": null,
          "@own(:is(:not(h1,h2,h3,h4,h5,h6,[data-element=MarkdownHeading]) + *)) & @own(!:is([data-not-content] *))":
            "0",
        },
        blockMargin: {
          "": null,
          "@own(:is(:not(h1,h2,h3,h4,h5,h6,[data-element=MarkdownHeading]) + *)) & @own(!:is([data-not-content] *))":
            "$margin-block-start $margin-block-end",
        },
      },
      List: {
        $: ":where(ul), :where(ol)",
        inlinePadding: {
          "": null,
          "@own(!:is([data-not-content] *))": "1.5rem start",
        },
      },
      CompactItem: {
        $: ":where(li + li), :where(dt + dt), :where(dt + dd), :where(dd + dd)",
        "$margin-block-start": {
          "": null,
          "@own(!:is([data-not-content] *))": "($gap * 0.5)",
        },
        "$margin-block-end": {
          "": null,
          "@own(!:is([data-not-content] *))": "0",
        },
        blockMargin: {
          "": null,
          "@own(!:is([data-not-content] *))":
            "$margin-block-start $margin-block-end",
        },
      },
      ListItem: {
        $: "li",
        overflowWrap: {
          "": null,
          "@own(!:is([data-not-content] *))": "anywhere",
        },
      },
      DefinitionTerm: {
        $: "dt",
        preset: { "": null, "@own(!:is([data-not-content] *))": "strong" },
      },
      DefinitionDescription: {
        $: "dd",
        inlinePadding: {
          "": null,
          "@own(!:is([data-not-content] *))": "($gap * 2) start",
        },
      },
      Link: {
        // Keep ordinary prose links at their former weight so heading controls own color.
        $: ":where(a)",
        color: { "": null, "@own(!:is([data-not-content] *))": "#accent-text" },
        textUnderlineOffset: {
          "": null,
          "@own(!:is([data-not-content] *))": "0.15em",
        },
      },
      HoverLink: {
        $: ":where(a)",
        color: {
          "": null,
          "@own(:hover) & @own(!:is([data-not-content] *))": "#text",
        },
      },
      Quote: {
        $: "blockquote",
        inlinePadding: {
          "": null,
          "@own(!:is([data-not-content] *))": "2x start",
        },
        color: { "": null, "@own(!:is([data-not-content] *))": "#text-soft" },
        inlineBorder: {
          "": null,
          "@own(!:is([data-not-content] *))": "1bw solid #border start",
        },
      },
      Rule: {
        $: "hr",
        border: { "": null, "@own(!:is([data-not-content] *))": "0" },
        blockBorder: {
          "": null,
          "@own(!:is([data-not-content] *))": "$border-width solid #border end",
        },
      },
      Details: {
        $: "details",
        "$details-border-width": "2px",
        inlinePadding: {
          "": null,
          "@own(!:is([data-not-content] *))": "($gap * 2) start",
        },
        inlineBorder: {
          "": null,
          "@own(!:is([data-not-content] *))":
            "$details-border-width solid #border start",
        },
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: {
          "": null,
          "@own(!:is([data-not-content] *))": "#border",
        },
      },
      HoverDetails: {
        $: "details",
        // Change only color; border widths and styles belong to other rules or theme overrides.
        // eslint-disable-next-line tasty/prefer-shorthand-property
        borderColor: {
          "": null,
          "(@own(![open] & :hover) | @own(:has(> summary:hover))) & @own(!:is([data-not-content] *))":
            "#accent-text",
        },
      },
      Summary: {
        $: "summary",
        display: { "": "", "@own(!:is([data-not-content] *))": "block" },
        inlineMargin: {
          "": null,
          "@own(!:is([data-not-content] *))": "-0.5rem start",
        },
        inlinePadding: {
          "": null,
          "@own(!:is([data-not-content] *))": "0.5rem start",
        },
        color: { "": null, "@own(!:is([data-not-content] *))": "#text" },
        preset: { "": null, "@own(!:is([data-not-content] *))": "strong" },
      },
      OpenSummary: {
        $: "details > summary",
        "$margin-block-start": {
          "": null,
          "@own(:is(details[open] > summary)) & @own(!:is([data-not-content] *))":
            "0",
        },
        "$margin-block-end": {
          "": null,
          "@own(:is(details[open] > summary)) & @own(!:is([data-not-content] *))":
            "($gap * 2)",
        },
        blockMargin: {
          "": null,
          "@own(:is(details[open] > summary)) & @own(!:is([data-not-content] *))":
            "$margin-block-start $margin-block-end",
        },
      },
      SummaryMarker: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
        $: "summary:not([data-not-content] *)::marker, summary:not([data-not-content] *)::-webkit-details-marker",
        hide: true,
      },
      SummaryIcon: {
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
        $: "summary:not([data-not-content] *)::before",
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
        // Tasty 3.9.3 appends @own states after pseudo-elements, producing invalid CSS.
        // eslint-disable-next-line tasty/no-state-in-selector
        $: "details[open] > summary:not([data-not-content] *)::before",
        rotate: "90deg",
      },
      Code: {
        $: ":where(code)",
        radius: {
          "": null,
          "@own(!:is([data-not-content] *))": "($radius * 0.65)",
        },
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
