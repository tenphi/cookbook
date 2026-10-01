import { configureCookbookStates } from "./tasty-states.js";
import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

configureCookbookStates();

export const PackageVersionRoot = customizeComponent(
  "PackageVersion",
  tasty({
    as: "span",
    "data-tasty-anatomy": "PackageVersion",
    styles: {
      display: "inline-flex",
      hide: { "": false, "@compact": true },
      alignItems: "center",
      flexShrink: "0",
      blockSize: "min 1.5rem",
      inlinePadding: "($gap * 0.75)",
      color: "#text-soft",
      fill: "#surface-2",
      border: true,
      radius: "999px",
      preset: "small",
      whiteSpace: "nowrap",
    },
  }),
);
