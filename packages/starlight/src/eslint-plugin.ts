export { default, recommended, strict } from "@tenphi/eslint-plugin-tasty";
export type {
  ResolvedConfig,
  StyleFunctionConfig,
  TastyValidationConfig,
} from "@tenphi/eslint-plugin-tasty";
export { default as validationConfig } from "./tasty.config.js";

import type { ThemeConfig } from "@tenphi/docs";
import type { TastyValidationConfig } from "@tenphi/eslint-plugin-tasty";
import validationConfig from "./tasty.config.js";

/** Keep editor/linter names aligned with a Cookbook theme. */
export function createValidationConfig(
  theme: ThemeConfig = {},
): TastyValidationConfig {
  return {
    ...validationConfig,
    tokens: [
      ...validationConfig.tokens,
      ...Object.keys(theme.tokens ?? {}).map((name) =>
        name.startsWith("--") ? `$${name.slice(2)}` : name,
      ),
      ...Object.keys(theme.palette ?? {}).map(
        (name) => `#${name === "textSoft" ? "text-soft" : name}`,
      ),
    ],
    units: [...validationConfig.units, ...Object.keys(theme.units ?? {})],
    states: [...validationConfig.states, ...Object.keys(theme.states ?? {})],
    presets: [...validationConfig.presets, ...Object.keys(theme.presets ?? {})],
    recipes: Object.keys(theme.recipes ?? {}),
  };
}
