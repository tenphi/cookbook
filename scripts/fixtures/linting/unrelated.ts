import { defineComponent } from "another-library";
import { defineComponent as component } from "@tenphi/cookbook/styling";

defineComponent("Other", {
  styles: { paddding: "1x", color: "red !important" },
});
function render(component) {
  component("Other", { styles: { paddding: "1x", color: "red !important" } });
}
