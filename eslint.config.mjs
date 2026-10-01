import js from "@eslint/js";
import tasty from "@tenphi/eslint-plugin-tasty";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/node_modules/**",
      "coverage/**",
      "**/*.ts",
      "**/*.astro",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly" },
    },
  },
  {
    ...tasty.configs.recommended,
    files: ["**/*.{js,mjs}"],
  },
  {
    files: [
      "packages/renderer/src/components/Document.styles.js",
      "packages/renderer/src/components/MarkdownContent.styles.js",
      "packages/renderer/src/components/Banner.styles.js",
      "packages/renderer/src/components/HeaderFrame.styles.js",
      "packages/renderer/src/components/Hero.styles.js",
      "packages/renderer/src/components/LanguageSelect.styles.js",
      "packages/renderer/src/components/MainContent.styles.js",
      "packages/renderer/src/components/MainPane.styles.js",
      "packages/renderer/src/components/MarkdownAlert.styles.js",
      "packages/renderer/src/components/MarkdownCodeBlock.styles.js",
      "packages/renderer/src/components/MarkdownHeading.styles.js",
      "packages/renderer/src/components/MarkdownInlineCode.styles.js",
      "packages/renderer/src/components/MarkdownTable.styles.js",
      "packages/renderer/src/components/Mermaid.styles.js",
      "packages/renderer/src/components/MermaidSource.styles.js",
      "packages/renderer/src/components/MobileMenuToggle.styles.js",
      "packages/renderer/src/components/Pagination.styles.js",
      "packages/renderer/src/components/Search.styles.js",
      "packages/renderer/src/components/SearchButton.styles.js",
      "packages/renderer/src/components/SearchResults.styles.js",
      "packages/renderer/src/components/Sidebar.styles.js",
      "packages/renderer/src/components/SkipLink.styles.js",
      "packages/renderer/src/components/SyntaxHighlight.styles.js",
      "packages/renderer/src/components/TableOfContents.styles.js",
      "packages/renderer/src/components/TableOfContentsLayout.styles.js",
    ],
    rules: {
      // Preserve native popover defaults and the generated-content cascade
      // while moving existing style trees into their owning modules.
      "tasty/require-default-state": "off",
      "tasty/valid-transition": "off",
      "tasty/prefer-hide": "off",
    },
  },
];
