import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const MainContentRoot = customizeComponent(
  "MainContent",
  tasty({
    as: "main",
    "data-tasty-anatomy": "MainContent",
    styles: {
      padding: "0 0 5rem",
      ContentSpacing: {
        $: ".content-panel > .cookbook-container > * + *",
        marginBlockStart: "($gap * 3)",
      },
      Container: {
        $: ".content-panel > .cookbook-container",
        marginInlineStart: { "": "auto", "@narrow-layout": "0" },
        marginInlineEnd: { "": "auto", "@narrow-layout": "0" },
        maxInlineSize: "$content-width",
      },
      Panel: { $: ".content-panel", padding: "($gap * 3) $docs-content-pad-x" },
      FirstPanel: {
        $: "> .content-panel:first-of-type",
        paddingBlockStart: "($gap * 3)",
        paddingBlockEnd: "($gap * 2)",
      },
      BodyPanel: {
        $: "> .content-panel:nth-of-type(2)",
        paddingBlockStart: "($gap * 2)",
      },
    },
  }),
);
