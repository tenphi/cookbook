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
    palette: {
      surface: "#fcfcff",
      text: "#20232a",
      textSoft: "#626875",
    },
    tokens: {
      $radius: "0.5rem",
      "$card-radius": "0.875rem",
      "$border-width": "1px",
      "$content-width": "52rem",
      "$sidebar-width": "18rem",
    },
    presets: {
      body: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      heading: {
        fontFamily: "'Avenir Next', Avenir, 'Segoe UI', sans-serif",
        fontWeight: 700,
      },
    },
  },
});
