import {
  configure,
  type ConfigTokens,
  type TypographyPreset,
} from "@tenphi/tasty/core";
import type { ThemeConfig } from "@tenphi/docs";
import { cookbookStates } from "../components/tasty-states.js";
import { resolveDocsTheme, type ResolvedDocsTheme } from "./index.js";
import {
  TASTY_SPACING_PROPERTIES,
  TASTY_UNITS,
  tastyTokens,
} from "./tasty-config.js";

/**
 * Configure Tasty with a site's theme, as a Cookbook build does: Cookbook's
 * states and units, plus the theme's tokens, units, recipes, states and
 * typography presets. Agent tools such as `tasty:styles` use it too.
 */
export function configureTastyTheme(
  theme: ThemeConfig | undefined,
  resolved: ResolvedDocsTheme = resolveDocsTheme(theme),
): void {
  const tokens = tastyTokens(resolved) as ConfigTokens;

  // Recipes and custom parser units are module-local in Tasty. Astro evaluates
  // renderer code in a separate server module graph. Share configuration only
  // inside the build process; never serialize this state into the page.
  (
    globalThis as typeof globalThis & { __tenphiCookbookTastyRuntime?: unknown }
  ).__tenphiCookbookTastyRuntime = {
    units: { ...TASTY_UNITS, ...theme?.units },
    recipes: theme?.recipes ?? {},
    states: theme?.states ?? {},
    presets: resolved.presets,
    tokens,
  };
  configure({
    states: {
      ...cookbookStates,
      ...theme?.states,
    },
    units: { ...TASTY_UNITS, ...theme?.units },
    recipes: theme?.recipes ?? {},
    tokens,
    properties: TASTY_SPACING_PROPERTIES,
    presets: resolved.presets as Record<string, TypographyPreset>,
  });
}
