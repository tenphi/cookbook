import { configureCookbookStates } from "./components/tasty-states.js";

// Consumer components can be evaluated before Cookbook's own components.
configureCookbookStates();

export { tasty, useGlobalStyles, mergeStyles } from "@tenphi/tasty";
export type { Styles } from "@tenphi/tasty";
export { defineComponent } from "./define-component.js";
export { resolveComponentStyles } from "./components/component-styles.js";
