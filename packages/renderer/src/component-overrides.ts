import type {
  ComponentsConfig,
  CookbookComponentOverrideName,
} from "@tenphi/docs";

export function resolveComponentOverrides(
  defaults: Record<CookbookComponentOverrideName, string>,
  overrides: ComponentsConfig["overrides"],
  disabledFooterPath: string,
): Record<string, string> {
  const resolved: Record<string, string> = { ...defaults };

  for (const [name, override] of Object.entries(overrides ?? {})) {
    if (name === "Footer" && override === false) {
      resolved.Footer = disabledFooterPath;
    } else if (typeof override === "string") {
      resolved[name] = override;
    }
  }

  return resolved;
}
