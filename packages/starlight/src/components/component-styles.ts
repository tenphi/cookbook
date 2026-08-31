import { mergeStyles, type Styles } from "@tenphi/tasty/core";
import {
  COOKBOOK_COMPONENT_NAMES,
  type ComponentStyleConfig,
  type ComponentStylesConfig,
  type CookbookComponentName,
} from "@tenphi/docs";

let configuredStyles: ComponentStylesConfig = {};
const cookbookComponentNames = new Set<string>(COOKBOOK_COMPONENT_NAMES);

export function configureComponentStyles(
  styles: ComponentStylesConfig | undefined,
): void {
  configuredStyles = styles ?? {};
}

export function resolveComponentStyles(
  name: CookbookComponentName,
  defaults: Styles,
): Styles {
  const configured = configuredStyles[name] as ComponentStyleConfig | undefined;
  if (!configured) return defaults;
  if (isModeConfig(configured)) {
    const styles = configured.styles as Styles;
    return configured.mode === "replace"
      ? styles
      : mergeStyles(defaults, styles);
  }
  return mergeStyles(defaults, configured as Styles);
}

/** Preserve custom anatomy names from the pre-component style API. */
export function resolveLegacyAnatomyStyles(
  styles: ComponentStylesConfig | undefined,
): Record<string, Styles> | undefined {
  if (!styles) return undefined;
  const entries = Object.entries(styles)
    .filter(
      (entry): entry is [string, ComponentStyleConfig] =>
        !cookbookComponentNames.has(entry[0]) && entry[1] !== undefined,
    )
    .map(([name, value]) => [
      `[data-tasty-anatomy="${name}"]`,
      isModeConfig(value) ? value.styles : value,
    ]);
  return entries.length
    ? (Object.fromEntries(entries) as Record<string, Styles>)
    : undefined;
}

function isModeConfig(
  value: ComponentStyleConfig,
): value is Extract<ComponentStyleConfig, { mode: string }> {
  return (
    "mode" in value &&
    (value.mode === "extend" || value.mode === "replace") &&
    "styles" in value
  );
}
