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
    files: ["packages/starlight/src/components/GlobalStyles.js"],
    rules: {
      // Global responsive rules intentionally do not invent a desktop value
      // when the upstream component owns that side of the cascade.
      "tasty/require-default-state": "off",
      // Bridges into third-party DOM preserve its exact longhand cascade.
      // Component-owned styles use the semantic Tasty shorthands instead.
      "tasty/prefer-shorthand-property": "off",
      "tasty/valid-transition": "off",
      "tasty/prefer-hide": "off",
    },
  },
];
