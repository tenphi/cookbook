import { defineDocsConfig } from "@tenphi/cookbook/config";
import cookbookPackage from "../../packages/facade/package.json" with { type: "json" };

export default defineDocsConfig({
  root: "../..",
  site: {
    title: "Cookbook",
    version: cookbookPackage.version,
    description:
      "Build a static Astro documentation site from existing files with a theme that fits your product.",
    url: "https://cookbook.tenphi.me",
    repository: "https://github.com/tenphi/cookbook",
    seo: {
      image: {
        src: "/social.jpg",
        alt: "Cookbook documentation that stays with the code and fits your product.",
        width: 1200,
        height: 630,
      },
    },
    headerLinks: [
      { label: "Examples", link: "/examples" },
      {
        label: "Changelog",
        link: "https://github.com/tenphi/cookbook/releases",
        newTab: true,
      },
      { label: "Get started", link: "/getting-started", variant: "primary" },
    ],
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
          {
            label: "Start",
            items: ["/getting-started", "/comparison", "/ai-agents"],
          },
          {
            label: "Author",
            items: ["/content-sources", "/authoring", "/examples"],
          },
          { label: "Customize", items: ["/recipes", "/customization-rules"] },
          { label: "Extend", items: ["/plugins"] },
          { label: "Publish", items: ["/deployment"] },
          {
            label: "Maintain",
            items: ["/migration", "/quality-checks", "/troubleshooting"],
          },
        ],
      },
      {
        label: "Reference",
        link: "/configuration",
        items: [
          "/configuration",
          "/theme-and-components",
          "/publishing",
          "/cli",
          "/architecture",
        ],
      },
    ],
  },
  theme: {
    brand: { from: "okhsl(266 68% 48%)" },
    palette: {
      surface: { tone: 98, saturation: 0.05 },
      text: {
        base: "surface",
        tone: 0,
        saturation: 0,
        contrast: { wcag: [7, 10] },
      },
      heading: {
        base: "surface",
        tone: [4, 0],
        saturation: 0,
        contrast: { wcag: [7, 10] },
      },
      textSoft: {
        base: "surface",
        tone: [25, 10],
        saturation: 0.05,
        contrast: { wcag: [4.5, 7] },
      },
    },
    tokens: {
      "$border-width": "1px",
      "$layout-width": "87.5rem",
      "$content-width": "58rem",
      "$sidebar-width": "17.5rem",
    },
    styles: {
      Hero: { Visual: { order: "2" } },
    },
  },
});
