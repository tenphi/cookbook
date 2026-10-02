import {
  defineComponent,
  mergeStyles,
  resolveComponentStyles,
  tasty,
} from "@tenphi/cookbook/styling";
import { defineComponent as rendererComponent } from "@tenphi/renderer/styling";
import { Button, extendComponent } from "@tenphi/cookbook/styling";

extendComponent("BrokenExtension", Button, {
  styles: { color: "#missing-extension-color" },
});

defineComponent("Broken", {
  styles: {
    paddding: "1x",
    RootHeading: { $: "&:is(h1)", preset: "h1" },
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
