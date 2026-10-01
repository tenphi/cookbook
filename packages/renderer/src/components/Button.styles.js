import { tasty } from "@tenphi/tasty";
import { customizeComponent } from "./customize-component.js";

/** Shared button foundation; descendants own their layout and interaction anatomy. */
export const Button = customizeComponent(
  "Button",
  tasty({
    as: "button",
    styles: {
      display: "flex",
      alignItems: "center",
      gap: "$gap",
      minBlockSize: "0",
      color: "#text-soft",
      cursor: "pointer",
    },
  }),
);
