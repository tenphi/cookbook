import { defineComponent, mergeStyles } from "@tenphi/cookbook/styling";

defineComponent("Fixable", {
  styles: { color: "#text !important", backgroundColor: "#surface-2" },
});
mergeStyles(base, { backgroundColor: "#surface" });
