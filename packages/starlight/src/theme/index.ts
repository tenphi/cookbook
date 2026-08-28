import {
  apcaContrast,
  glaze,
  okhslToLinearSrgb,
  relativeLuminanceFromLinearRgb,
  variantToOkhsl,
  type GlazeColorValue,
  type ResolvedColorVariant,
} from "@tenphi/glaze";
import type { BrandConfig, DocsDiagnostic, ThemeConfig } from "@tenphi/docs";

export interface ResolvedDocsTheme {
  css: string;
  colors: {
    surface: Record<string, string>;
    accentText: Record<string, string>;
    accentSurface: Record<string, string>;
    accentSurfaceText: Record<string, string>;
    focus: Record<string, string>;
  };
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
  const surface = glaze.color({ from: "#ffffff", mode: "auto" });
  const accentText = glaze.color(
    {
      from: brand.from,
      base: surface,
      role: "text",
      contrast: { apca: authoredTarget },
      mode: "auto",
    },
    {
      autoFlip: true,
      ...(theme.contrastLevel !== undefined
        ? { contrastLevel: theme.contrastLevel }
        : {}),
    },
  );
  const focus = glaze.color(
    {
      from: brand.from,
      base: surface,
      role: "border",
      contrast: { apca: authoredTarget },
      mode: "auto",
    },
    { autoFlip: true },
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
    accentText: accentText.json(outputOptions),
    accentSurface: accentSurface.json(outputOptions),
    accentSurfaceText: accentSurfaceText.json(outputOptions),
    focus: focus.json(outputOptions),
  };
  return {
    css: themeCss(colors, theme),
    colors,
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
  const declarations = (mode: string): string =>
    [
      `--td-surface:${colors.surface[mode]}`,
      `--td-accent-text:${colors.accentText[mode]}`,
      `--td-accent-surface:${colors.accentSurface[mode]}`,
      `--td-accent-surface-text:${colors.accentSurfaceText[mode]}`,
      `--td-focus:${colors.focus[mode]}`,
      ...Object.entries(theme.tokens ?? {}).map(
        ([name, value]) => `${name}:${String(value)}`,
      ),
    ].join(";");
  return [
    `:root{${declarations("dark")}}`,
    `:root[data-theme=light]{${declarations("light")}}`,
    `@media(prefers-color-scheme:light){:root:not([data-theme]){${declarations("light")}}}`,
    `@media(prefers-contrast:more){:root{${declarations("darkContrast")}}:root[data-theme=light]{${declarations("lightContrast")}}@media(prefers-color-scheme:light){:root:not([data-theme]){${declarations("lightContrast")}}}}`,
    `:root[data-contrast=more]{${declarations("darkContrast")}}`,
    `:root[data-theme=light][data-contrast=more]{${declarations("lightContrast")}}`,
  ].join("\n");
}
