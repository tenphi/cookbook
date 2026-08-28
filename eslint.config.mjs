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
];
