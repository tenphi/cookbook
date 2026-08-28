import { defineDocsConfig } from "tasty-docs";

export default defineDocsConfig({
  site: {
    title: "Tasty Docs",
    description: "Repository-native documentation for Astro.",
    url: "https://tastydocs.tenphi.me",
    repository: "https://github.com/tenphi/tasty-docs",
  },
  content: {
    sources: [{ glob: "docs/**/*.{md,mdx}", base: "docs" }],
  },
  navigation: [
    "/",
    {
      label: "Start here",
      items: ["/getting-started", "/content-sources"],
    },
    {
      label: "Customize",
      items: ["/configuration", "/theme-and-components"],
    },
    {
      label: "Operate",
      items: ["/cli", "/deployment"],
    },
    "/architecture",
  ],
  theme: {
    brand: { from: "#2f5bff" },
    tokens: { "--content-width": "52rem", "--sidebar-width": "18rem" },
  },
});
