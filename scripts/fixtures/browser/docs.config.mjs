export default {
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
  theme: { brand: { from: "#d97706" } },
};
