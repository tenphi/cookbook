import { defineComponent, mergeStyles } from "@tenphi/cookbook/styling";

defineComponent("Fixable", {
  styles: {
    color: "#text !important",
    backgroundColor: "#surface-2",
    Label: { $: '[data-element="Label"] > span', color: "#text" },
  },
});
mergeStyles(base, { backgroundColor: "#surface" });
