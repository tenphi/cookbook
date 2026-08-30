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
      {
        label: "Docs",
        link: "/",
        items: ["/"],
      },
      {
        label: "Guide",
        link: "/getting-started",
        items: [
          "/getting-started",
          {
            label: "Author content",
            items: [
              "/content-sources",
              {
                label: "Customize",
                items: [
                  "/configuration",
                  {
                    label: "Presentation",
                    items: ["/theme-and-components"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Operations",
        link: "/cli",
        items: ["/cli", "/deployment"],
      },
      {
        label: "Architecture",
        link: "/architecture",
        items: ["/architecture"],
      },
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
      "$layout-width": "87.5rem",
      "$content-width": "58rem",
      "$sidebar-width": "17.5rem",
    },
  },
});
