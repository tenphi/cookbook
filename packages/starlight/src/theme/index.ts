import {
  resolveColorTheme,
  type ThemeConfig,
  type ThemeTokens,
  type TypographyPreset,
} from "@tenphi/docs";
import { resolveThemeTokens, resolveTypographyPresets } from "./defaults.js";
import { fontFamilies } from "./fonts.js";

export interface ResolvedDocsTheme extends ReturnType<
  typeof resolveColorTheme
> {
  tokens: ThemeTokens;
  presets: Record<string, TypographyPreset>;
}

export function resolveDocsTheme(theme: ThemeConfig = {}): ResolvedDocsTheme {
  return {
    ...resolveColorTheme(theme),
    tokens: resolveThemeTokens(theme.tokens),
    presets: resolveTypographyPresets(theme.presets, fontFamilies(theme.fonts)),
  };
}
