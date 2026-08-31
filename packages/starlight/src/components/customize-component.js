import { tasty } from "@tenphi/tasty";
import { resolveComponentStyleOverride } from "./component-styles.js";

export function customizeComponent(name, options, base) {
  const override = resolveComponentStyleOverride(name);
  if (!override) return base;
  return override.mode === "replace"
    ? tasty({ ...options, styles: override.styles })
    : tasty(base, { styles: override.styles });
}
