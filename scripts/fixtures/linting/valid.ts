import {
  defineComponent as component,
  mergeStyles,
  resolveComponentStyles,
  tasty,
  useGlobalStyles,
  type Styles,
} from "@tenphi/cookbook/styling";
import { defineComponent as rendererComponent } from "@tenphi/starlight/styling";

component("ProjectBadge", {
  as: "span",
  styles: {
    padding: "1x",
    radius: "1cr",
    border: "1bw solid #border",
    color: "#accent-text",
    fill: { "": "#surface", "@mobile": "#surface-2" },
    preset: "body / strong",
    Label: { color: "#text-soft", gap: "$gap" } satisfies Styles,
  },
  variants: {
    Compact: {
      "@active": ":hover",
      color: { "": "#text", "@active": "#accent-text" },
    },
  },
});

const base = resolveComponentStyles("ProjectNote", {
  padding: "$project-gap",
  fill: "#project",
  preset: "project-title",
  hide: { "": false, "@project-wide": true },
});
mergeStyles(base, { color: { hovered: "#text-muted" } });
useGlobalStyles(
  ".project-note",
  resolveComponentStyles("ProjectGlobal", {
    color: "#text",
    Label: { preset: "small", padding: "1x" },
  }),
);
tasty({ styles: { color: "#accent-text", padding: "1x" } });
rendererComponent("RendererBadge", { styles: { color: "#syntax-string" } });
