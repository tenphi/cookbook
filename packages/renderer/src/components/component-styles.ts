import { mergeStyles, type Styles } from "@tenphi/tasty/core";

// Astro can load the integration and renderer through separate module graphs.
// Keep their component configuration on the shared process global.
const sharedConfiguration = globalThis as typeof globalThis & {
  __tenphiCookbookComponentStyles?: Record<string, Styles | undefined>;
  __tenphiCookbookUsedComponentStyles?: Set<string>;
};

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

/** Find custom names without a component style resolver match. */
export function unusedCustomStyleNames(
  styles: Record<string, Styles> | undefined,
): string[] {
  return Object.keys(styles ?? {}).filter(
    (name) =>
      !sharedConfiguration.__tenphiCookbookUsedComponentStyles?.has(name),
  );
}

export function resolveComponentStyleOverride(
  name: string,
): Styles | undefined {
  return sharedConfiguration.__tenphiCookbookComponentStyles?.[name] as
    Styles | undefined;
}
