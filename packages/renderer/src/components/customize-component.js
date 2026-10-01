import { tasty } from "@tenphi/tasty";
import { resolveComponentStyleOverride } from "./component-styles.js";
import { inheritComponentParts } from "./inherit-component-parts.js";

export function customizeComponent(name, base) {
  const override = resolveComponentStyleOverride(name);
  if (!override) return base;
  return inheritComponentParts(base, tasty(base, { styles: override }));
}
