import {
  defineComponent,
  mergeStyles,
  resolveComponentStyles,
  tasty,
} from "@tenphi/cookbook/styling";
import { defineComponent as rendererComponent } from "@tenphi/starlight/styling";

defineComponent("Broken", {
  styles: {
    paddding: "1x",
    color: "#missing",
    padding: "1oops",
    preset: "missing",
    fill: { "": "#surface", "@missing": "#text" },
  },
});
resolveComponentStyles("Broken", { paddding: "1x" });
mergeStyles({}, { paddding: "1x" });
tasty({ styles: { paddding: "1x" } });
rendererComponent("Broken", { styles: { paddding: "1x" } });
