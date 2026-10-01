export default {
  // The renderer owns the responsive viewport, even with legacy custom head tags.
  head: [{ tag: "meta", attrs: { name: "VIEWPORT", content: "width=980" } }],
  site: {
    title: "Browser fixture",
    url: "https://example.com",
    versions: [
      { label: "Current", routeBase: "/" },
      { label: "v1", routeBase: "/v1", index: false },
    ],
    headerLinks: [
      { label: "Guide", link: "/guide" },
      { label: "Start", link: "/", variant: "primary" },
    ],
  },
  content: { sources: [{ glob: "docs/**/*.{md,mdx}", base: "docs" }] },
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français" },
  },
  tableOfContents: { mobile: true },
  theme: {
    brand: { from: "#d97706" },
    styles: {
      Button: { gap: "7px" },
      SearchButton: { gap: "11px" },
      Callout: { Title: { color: "#accent-text" } },
    },
  },
};
