import { defineComponent } from "../define-component.js";

/** Shared button foundation; descendants own their layout and interaction anatomy. */
export const Button = defineComponent("Button", {
  as: "button",
  styles: {
    display: "flex",
    alignItems: "center",
    gap: "$gap",
    minBlockSize: "0",
    color: "#text-soft",
    cursor: "pointer",
  },
});
