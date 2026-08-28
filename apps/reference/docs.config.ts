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
  navigation: {
    tabs: [
      { label: "Docs", link: "/" },
      { label: "Getting started", link: "/getting-started" },
      { label: "Configuration", link: "/configuration" },
      { label: "Theme", link: "/theme-and-components" },
      { label: "Architecture", link: "/architecture" },
    ],
    items: [
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
  },
  theme: {
    brand: { from: "#2f5bff" },
    palette: {
      surface: "#fcfcff",
      text: "#20232a",
      textSoft: "#626875",
    },
    tokens: {
      "$border-width": "1px",
      "$content-width": "58rem",
      "$sidebar-width": "17.5rem",
    },
  },
});
