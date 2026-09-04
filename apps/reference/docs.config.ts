import { defineDocsConfig } from "@tenphi/cookbook";
import cookbookPackage from "../../packages/facade/package.json" with { type: "json" };

export default defineDocsConfig({
  site: {
    title: "Cookbook",
    version: cookbookPackage.version,
    description: "Repository-native documentation for Astro.",
    url: "https://cookbook.tenphi.me",
    repository: "https://github.com/tenphi/cookbook",
  },
  head: [
    {
      tag: "script",
      attrs: {
        defer: true,
        src: "https://umami.tenphi.me/script.js",
        "data-website-id": "084ca820-b3e3-440d-bf91-c246cf60da48",
      },
    },
  ],
  editLink: {
    baseUrl: "https://github.com/tenphi/cookbook/edit/main/",
  },
  lastUpdated: true,
  content: {
    sources: [{ glob: "docs/**/*.{md,mdx}", base: "docs" }],
  },
  navigation: {
    tabs: [
      {
        label: "Guide",
        link: "/",
        items: [
          "/",
          "/getting-started",
          {
            label: "Author content",
            items: [
              "/content-sources",
              {
                label: "Customize",
                items: [
                  "/configuration",
                  "/starlight-comparison",
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
        label: "Reference",
        link: "/cli",
        items: [
          {
            label: "Operations",
            items: ["/cli", "/deployment"],
          },
          "/architecture",
        ],
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
