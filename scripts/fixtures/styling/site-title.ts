import {
  defineComponent,
  mergeStyles,
  resolveComponentStyles,
  useGlobalStyles,
  type Styles,
} from "@tenphi/cookbook/styling";

const titleStyles = {
  display: "flex",
  alignItems: "center",
  gap: "1x",
  color: "#text",
  preset: "consumer-title",
  textDecoration: "none",
  Logo: {
    $: "> svg",
    display: "block",
    flexShrink: "0",
    inlineSize: { "": "2rem", "@mobile": "1.75rem" },
    blockSize: { "": "2rem", "@mobile": "1.75rem" },
    color: "#accent-text",
  },
  Label: {
    $: "> span",
    minInlineSize: "0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
} satisfies Styles;

export const SiteTitleRoot = defineComponent("ConsumerSiteTitle", {
  as: "a",
  elements: { Label: "span" },
  styles: titleStyles,
});

export function ConsumerGlobalStyles() {
  useGlobalStyles(
    ".consumer-global",
    resolveComponentStyles(
      "ConsumerGlobal",
      mergeStyles(
        { color: "#text-soft" },
        {
          padding: "1x",
          Label: {
            $: "> span",
            color: "#accent-text",
            inlineSize: { "": "3rem", "@consumer-narrow": "2.25rem" },
          },
        },
      ),
    ),
  );
  return null;
}
