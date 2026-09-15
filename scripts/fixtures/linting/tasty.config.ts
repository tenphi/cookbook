import type { TastyValidationConfig } from "@tenphi/cookbook/eslint-plugin";

export default {
  extends: "@tenphi/cookbook",
  tokens: ["#project", "$project-gap"],
  states: ["@project-wide"],
  presets: ["project-title"],
} satisfies TastyValidationConfig;
