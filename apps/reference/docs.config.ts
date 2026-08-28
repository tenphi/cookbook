import { defineDocsConfig } from "tasty-docs";

export default defineDocsConfig({
  site: {
    title: "Tasty Docs",
    description: "Executable reference documentation for Tasty Docs.",
    repository: "https://github.com/tenphi/tasty-docs",
  },
  content: {
    sources: [
      { file: "README.md", route: "/" },
      { glob: "docs/**/*.{md,mdx}", base: "docs" },
    ],
  },
  navigation: [
    "/",
    { label: "Guides", autogenerate: { directory: "/guides" } },
    "/reference",
  ],
  theme: {
    brand: { from: "#2f5bff" },
    tokens: { "--content-width": "52rem", "--sidebar-width": "18rem" },
  },
});
