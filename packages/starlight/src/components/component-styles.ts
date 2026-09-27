import { mergeStyles, type Styles } from "@tenphi/tasty/core";
import { COOKBOOK_COMPONENT_NAMES } from "@tenphi/docs";

// Astro can load the integration and renderer through separate module graphs.
// Keep their component configuration on the shared process global.
const sharedConfiguration = globalThis as typeof globalThis & {
  __tenphiCookbookComponentStyles?: Record<string, Styles | undefined>;
  __tenphiCookbookUsedComponentStyles?: Set<string>;
};
const cookbookComponentNames = new Set<string>(COOKBOOK_COMPONENT_NAMES);

export function configureComponentStyles(
  styles: Record<string, Styles | undefined> | undefined,
): void {
  sharedConfiguration.__tenphiCookbookComponentStyles = styles ?? {};
  sharedConfiguration.__tenphiCookbookUsedComponentStyles = new Set();
}

/** Merge a partial theme override into a built-in or consumer style tree. */
export function resolveComponentStyles(
  name: string,
  baseStyles: Styles,
): Styles {
  sharedConfiguration.__tenphiCookbookUsedComponentStyles?.add(name);
  const configuredStyles = sharedConfiguration
    .__tenphiCookbookComponentStyles?.[name] as Styles | undefined;
  return configuredStyles
    ? mergeStyles(baseStyles, configuredStyles as Styles)
    : baseStyles;
}

/** Find custom names without a component style resolver or rendered anatomy. */
export function unusedCustomStyleNames(
  styles: Record<string, Styles> | undefined,
  anatomyNames: ReadonlySet<string>,
): string[] {
  return Object.keys(styles ?? {}).filter(
    (name) =>
      !sharedConfiguration.__tenphiCookbookUsedComponentStyles?.has(name) &&
      !anatomyNames.has(name),
  );
}

export function resolveComponentStyleOverride(
  name: string,
): Styles | undefined {
  return sharedConfiguration.__tenphiCookbookComponentStyles?.[name] as
    Styles | undefined;
}

/** Preserve custom anatomy names from the pre-component style API. */
export function resolveLegacyAnatomyStyles(
  styles: Record<string, Styles | undefined> | undefined,
): Record<string, Styles> | undefined {
  if (!styles) return undefined;
  const entries = Object.entries(styles)
    .filter(
      (entry): entry is [string, Styles] =>
        !cookbookComponentNames.has(entry[0]) && entry[1] !== undefined,
    )
    .map(([name, value]) => [`[data-tasty-anatomy="${name}"]`, value]);
  return entries.length
    ? (Object.fromEntries(entries) as Record<string, Styles>)
    : undefined;
}
