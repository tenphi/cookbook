export function resolveComponentOverrides(
  defaults: Record<string, string>,
  overrides: Record<string, string | false> | undefined,
  disabledFooterPath: string,
): Record<string, string> {
  const resolved = { ...defaults };

  for (const [name, override] of Object.entries(overrides ?? {})) {
    if (name === "Footer" && override === false) {
      resolved.Footer = disabledFooterPath;
    } else if (typeof override === "string") {
      resolved[name] = override;
    }
  }

  return resolved;
}
