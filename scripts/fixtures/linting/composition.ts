import type { Styles } from "@tenphi/cookbook/styling";

const outerStyles: Styles = {
  Label: { color: "#text", padding: "1x" },
};
const styles: Styles = {
  Label: { color: "#accent-text" },
};
const finalStyles: Styles = { ...outerStyles, ...styles };
