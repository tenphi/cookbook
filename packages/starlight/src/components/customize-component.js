import { tasty } from "@tenphi/tasty";
import { resolveComponentStyleOverride } from "./component-styles.js";

export function customizeComponent(name, base) {
  const override = resolveComponentStyleOverride(name);
  if (!override) return base;
  return tasty(base, { styles: override });
}
