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
  colors: {
    surface: Record<string, string>;
    surface2: Record<string, string>;
    surface3: Record<string, string>;
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
  const surfaceFrom = theme.palette?.surface ?? "#ffffff";
  const surface = glaze.color({
    from: surfaceFrom,
    mode: "auto",
    // Near-white brand surfaces can carry a numerically large OKHSL
    // saturation that becomes vivid as the ramp moves away from white. Reduce
    // saturation along the light ramp and keep dark chrome nearly neutral.
    darkSaturation: 0.35,
  });
  const surface2 = glaze.color(
    {
      from: surfaceFrom,
      base: surface,
      tone: "-2",
      mode: "auto",
      saturationFactor: 0.9,
      darkSaturation: 0.325,
    },
    glazeOptions,
  );
  const surface3 = glaze.color(
    {
      from: surfaceFrom,
      base: surface2,
      tone: "-2",
      mode: "auto",
      saturationFactor: 0.8,
      darkSaturation: 0.3,
    },
    glazeOptions,
  );
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
    surface2: surface2.json(outputOptions),
    surface3: surface3.json(outputOptions),
    text: text.json(outputOptions),
    textSoft: textSoft.json(outputOptions),
    accentText: accentText.json(outputOptions),
    accentSurface: accentSurface.json(outputOptions),
    accentSurfaceText: accentSurfaceText.json(outputOptions),
    focus: focus.json(outputOptions),
  };
  return {
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
