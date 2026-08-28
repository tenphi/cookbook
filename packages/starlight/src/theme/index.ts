import {
  apcaContrast,
  glaze,
  okhslToLinearSrgb,
  relativeLuminanceFromLinearRgb,
  variantToOkhsl,
  type GlazeColorValue,
  type ResolvedColorVariant,
} from "@tenphi/glaze";
import type {
  BrandConfig,
  DocsDiagnostic,
  ThemeConfig,
  ThemeTokens,
  TypographyPreset,
} from "@tenphi/docs";
import { resolveThemeTokens, resolveTypographyPresets } from "./defaults.js";

export interface ResolvedDocsTheme {
  css: string;
  colors: {
    surface: Record<string, string>;
    text: Record<string, string>;
    textSoft: Record<string, string>;
    accentText: Record<string, string>;
    accentSurface: Record<string, string>;
    accentSurfaceText: Record<string, string>;
    focus: Record<string, string>;
  };
  tokens: ThemeTokens;
  presets: Record<string, TypographyPreset>;
  contrast: {
    light: number;
    dark: number;
    lightContrast: number;
    darkContrast: number;
  };
  diagnostics: DocsDiagnostic[];
}

export function resolveDocsTheme(theme: ThemeConfig = {}): ResolvedDocsTheme {
  const brand = normalizeBrand(theme.brand);
  const authoredTarget = brand.contrast?.apca ?? 45;
  const normalTarget = Array.isArray(authoredTarget)
    ? authoredTarget[0]
    : authoredTarget;
  const highTarget = Array.isArray(authoredTarget)
    ? authoredTarget[1]
    : normalTarget + 15;
  const glazeOptions = {
    autoFlip: true,
    ...(theme.contrastLevel !== undefined
      ? { contrastLevel: theme.contrastLevel }
      : {}),
  } as const;
  const surface = glaze.color({
    from: theme.palette?.surface ?? "#ffffff",
    mode: "auto",
    // Near-white brand surfaces can carry a numerically large OKHSL
    // saturation that becomes vivid when tone-inverted. Preserve the authored
    // light surface, but keep dark chrome in the neutral-surface range.
    darkSaturation: 0.35,
  });
  const text = glaze.color(
    {
      from: theme.palette?.text ?? "#20232a",
      base: surface,
      role: "text",
      contrast: { apca: [75, 90] },
      mode: "auto",
    },
    glazeOptions,
  );
  const textSoft = glaze.color(
    {
      from: theme.palette?.textSoft ?? "#626875",
      base: surface,
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    },
    glazeOptions,
  );
  const accentText = glaze.color(
    {
      from: brand.from,
      base: surface,
      role: "text",
      contrast: { apca: authoredTarget },
      mode: "auto",
    },
    glazeOptions,
  );
  const focus = glaze.color(
    {
      from: brand.from,
      base: surface,
      role: "border",
      contrast: { apca: authoredTarget },
      mode: "auto",
    },
    glazeOptions,
  );
  const accentSurface = glaze.color({ from: brand.from, mode: "fixed" });
  const accentSurfaceText = glaze.color({
    from: "#ffffff",
    base: accentSurface,
    role: "text",
    contrast: { apca: 60 },
    mode: "auto",
  });

  const resolvedSurface = surface.resolve();
  const resolvedAccent = accentText.resolve();
  const scores = {
    light: score(resolvedAccent.light, resolvedSurface.light),
    dark: score(resolvedAccent.dark, resolvedSurface.dark),
    lightContrast: score(
      resolvedAccent.lightContrast,
      resolvedSurface.lightContrast,
    ),
    darkContrast: score(
      resolvedAccent.darkContrast,
      resolvedSurface.darkContrast,
    ),
  };
  const diagnostics: DocsDiagnostic[] = [];
  for (const [scheme, measured] of Object.entries(scores)) {
    const required = scheme.includes("Contrast") ? highTarget : normalTarget;
    if (measured + 0.05 < required) {
      diagnostics.push({
        code: "DOCS_BRAND_CONTRAST_UNMET",
        severity: "error",
        message: `Brand contrast in ${scheme} is Lc ${measured.toFixed(1)}; required Lc ${required}.`,
        hint: `Authored color: ${String(brand.from)}.`,
      });
    }
  }
  const outputOptions = { modes: { highContrast: true } } as const;
  const colors = {
    surface: surface.json(outputOptions),
    text: text.json(outputOptions),
    textSoft: textSoft.json(outputOptions),
    accentText: accentText.json(outputOptions),
    accentSurface: accentSurface.json(outputOptions),
    accentSurfaceText: accentSurfaceText.json(outputOptions),
    focus: focus.json(outputOptions),
  };
  return {
    css: themeCss(colors, theme),
    colors,
    tokens: resolveThemeTokens(theme.tokens),
    presets: resolveTypographyPresets(theme.presets),
    contrast: scores,
    diagnostics,
  };
}

function normalizeBrand(
  brand: BrandConfig | undefined,
): Exclude<BrandConfig, GlazeColorValue> & { from: GlazeColorValue } {
  if (typeof brand === "object" && brand !== null && "from" in brand)
    return brand;
  return { from: brand ?? "#315efb" };
}

function score(
  foreground: ResolvedColorVariant,
  background: ResolvedColorVariant,
): number {
  return Math.abs(apcaContrast(luminance(foreground), luminance(background)));
}

function luminance(variant: ResolvedColorVariant): number {
  const { h, s, l } = variantToOkhsl(variant);
  return relativeLuminanceFromLinearRgb(
    okhslToLinearSrgb(h, s, l, variant.pastel),
  );
}

function themeCss(
  colors: ResolvedDocsTheme["colors"],
  theme: ThemeConfig,
): string {
  const tokens = resolveThemeTokens(theme.tokens);
  const presets = resolveTypographyPresets(theme.presets);
  const designDeclarations = [
    ...Object.entries(tokens).map(
      ([name, value]) => `${tokenProperty(name)}:${String(value)}`,
    ),
    ...Object.entries(presets).flatMap(([name, preset]) =>
      Object.entries(preset).map(
        ([property, value]) =>
          `--${kebab(name)}-${kebab(property)}:${String(value)}`,
      ),
    ),
  ].join(";");
  const declarations = (mode: string): string =>
    [
      `--td-surface:${colors.surface[mode]}`,
      `--td-text:${colors.text[mode]}`,
      `--td-text-soft:${colors.textSoft[mode]}`,
      `--td-accent-text:${colors.accentText[mode]}`,
      `--td-accent-surface:${colors.accentSurface[mode]}`,
      `--td-accent-surface-text:${colors.accentSurfaceText[mode]}`,
      `--td-focus:${colors.focus[mode]}`,
      "--td-surface-2:color-mix(in oklab,var(--td-text) 4%,var(--td-surface))",
      "--td-surface-3:color-mix(in oklab,var(--td-text) 8%,var(--td-surface))",
      "--td-border:color-mix(in oklab,var(--td-text) 18%,var(--td-surface))",
      "--td-border-strong:color-mix(in oklab,var(--td-text) 34%,var(--td-surface))",
      "--td-shadow:color-mix(in oklab,var(--td-text) 16%,transparent)",
      "--td-overlay:color-mix(in oklab,var(--td-text) 58%,transparent)",
    ].join(";");
  return [
    `:root{${designDeclarations};${declarations("dark")}}`,
    `:root[data-theme=light]{${declarations("light")}}`,
    `@media(prefers-color-scheme:light){:root:not([data-theme]){${declarations("light")}}}`,
    `@media(prefers-contrast:more){:root{${declarations("darkContrast")}}:root[data-theme=light]{${declarations("lightContrast")}}@media(prefers-color-scheme:light){:root:not([data-theme]){${declarations("lightContrast")}}}}`,
    `:root[data-contrast=more]{${declarations("darkContrast")}}`,
    `:root[data-theme=light][data-contrast=more]{${declarations("lightContrast")}}`,
  ].join("\n");
}

function tokenProperty(name: string): string {
  if (name.startsWith("--")) return name;
  return `--${name.replace(/^\$/, "")}`;
}

function kebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase();
}
