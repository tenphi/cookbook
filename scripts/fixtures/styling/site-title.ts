import {
  defineComponent,
  extendComponent,
  mergeStyles,
  resolveComponentStyles,
  useGlobalStyles,
  type Styles,
  Button,
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

const BaseSiteTitle = defineComponent("ConsumerTitleBase", {
  as: "a",
  elements: { Label: "span" },
  styles: titleStyles,
});

export const SiteTitleRoot = extendComponent(
  "ConsumerSiteTitle",
  BaseSiteTitle,
  {
    styles: { Label: { radius: "7px" } },
  },
);

export const ConsumerButton = extendComponent("ConsumerButton", Button, {
  styles: { padding: "5px", gap: "11px" },
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
