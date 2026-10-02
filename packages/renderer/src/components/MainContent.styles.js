import { configureCookbookStates } from "./tasty-states.js";
import { defineComponent } from "../define-component.js";

configureCookbookStates();

export const MainContentRoot = defineComponent("MainContent", {
  as: "main",
  "data-tasty-anatomy": "MainContent",
  styles: {
    padding: "0 0 5rem",
    ContentSpacing: {
      $: ".content-panel > .cookbook-container > * + *",
      // Keep each child's owned end margin while applying spacing before it.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      marginBlockStart: "($gap * 3)",
    },
    Container: {
      $: ".content-panel > .cookbook-container",
      inlineMargin: { "": "auto", "@narrow-layout": "0" },
      inlineSize: "max $content-width",
    },
    Panel: { $: ".content-panel", padding: "($gap * 3) $docs-content-pad-x" },
    FirstPanel: {
      $: "> .content-panel:first-of-type",
      blockPadding: "($gap * 3) start, ($gap * 2) end",
    },
    BodyPanel: {
      $: "> .content-panel:nth-of-type(2)",
      // Patch only the start edge; the Panel rule owns the end padding.
      // eslint-disable-next-line tasty/prefer-shorthand-property
      paddingBlockStart: "($gap * 2)",
    },
  },
});
