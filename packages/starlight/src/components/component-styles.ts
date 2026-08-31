import { mergeStyles, type Styles } from "@tenphi/tasty/core";
import {
  COOKBOOK_COMPONENT_NAMES,
  type ComponentStyleConfig,
  type ComponentStylesConfig,
  type CookbookComponentName,
} from "@tenphi/docs";

// Astro can load the integration and renderer through separate module graphs.
// Keep their component configuration on the shared process global.
const sharedConfiguration = globalThis as typeof globalThis & {
  __tenphiCookbookComponentStyles?: ComponentStylesConfig;
};
const cookbookComponentNames = new Set<string>(COOKBOOK_COMPONENT_NAMES);

export function configureComponentStyles(
  styles: ComponentStylesConfig | undefined,
): void {
  sharedConfiguration.__tenphiCookbookComponentStyles = styles ?? {};
}

export function resolveComponentStyles(
  name: CookbookComponentName,
  defaults: Styles,
): Styles {
  const configured = sharedConfiguration.__tenphiCookbookComponentStyles?.[
    name
  ] as ComponentStyleConfig | undefined;
  if (!configured) return defaults;
  if (isModeConfig(configured)) {
    const styles = configured.styles as Styles;
    return configured.mode === "replace"
      ? styles
      : mergeStyles(defaults, styles);
  }
  return mergeStyles(defaults, configured as Styles);
}

export function resolveComponentStyleOverride(
  name: CookbookComponentName,
): { mode: "extend" | "replace"; styles: Styles } | undefined {
  const configured = sharedConfiguration.__tenphiCookbookComponentStyles?.[
    name
  ] as ComponentStyleConfig | undefined;
  if (!configured) return undefined;
  if (isModeConfig(configured)) {
    return { mode: configured.mode, styles: configured.styles as Styles };
  }
  return { mode: "extend", styles: configured as Styles };
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
