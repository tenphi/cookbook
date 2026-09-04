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
  baseStyles: Styles,
): Styles {
  const configuredStyles = sharedConfiguration
    .__tenphiCookbookComponentStyles?.[name] as
    ComponentStyleConfig | undefined;
  return configuredStyles
    ? mergeStyles(baseStyles, configuredStyles as Styles)
    : baseStyles;
}

export function resolveComponentStyleOverride(
  name: CookbookComponentName,
): Styles | undefined {
  return sharedConfiguration.__tenphiCookbookComponentStyles?.[name] as
    Styles | undefined;
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
    .map(([name, value]) => [`[data-tasty-anatomy="${name}"]`, value]);
  return entries.length
    ? (Object.fromEntries(entries) as Record<string, Styles>)
    : undefined;
}
