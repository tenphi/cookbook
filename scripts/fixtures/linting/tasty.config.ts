import {
  validationConfig,
  type TastyValidationConfig,
} from "@tenphi/cookbook/eslint-plugin";

export default {
  ...validationConfig,
  tokens: [...validationConfig.tokens, "#project", "$project-gap"],
  states: [...validationConfig.states, "@project-wide"],
  presets: [...validationConfig.presets, "project-title"],
} satisfies TastyValidationConfig;
