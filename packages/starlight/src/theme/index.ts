import {
  apcaContrast,
  glaze,
  okhslToLinearSrgb,
  relativeLuminanceFromLinearRgb,
  variantToOkhsl,
  type ColorMap,
  type GlazeColorValue,
  type RegularColorDef,
  type ResolvedColorVariant,
} from "@tenphi/glaze";
import type {
  BrandConfig,
  BrandDeclaration,
  DocsDiagnostic,
  ThemeConfig,
  ThemePaletteColor,
  ThemeTokens,
  TypographyPreset,
} from "@tenphi/docs";
import { resolveThemeTokens, resolveTypographyPresets } from "./defaults.js";
import { fontFamilies } from "./fonts.js";

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
    shadow: Record<string, string>;
  };
  /** Glaze-generated Tasty color tokens, including interaction and status roles. */
  colorTokens: Record<string, Record<string, string>>;
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
  const surfaceInput = theme.palette?.surface;
  const declaredSurface =
    isColorDeclaration(surfaceInput) && usesRelativeColor(surfaceInput);
  const surfaceFrom = isColorDeclaration(surfaceInput)
    ? (surfaceInput.from ?? brand.from)
    : (surfaceInput ?? "#ffffff");
  const surfaceSeed = glaze.color({
    from: surfaceFrom,
    mode: "auto",
    // Near-white brand surfaces can carry a numerically large OKHSL
    // saturation that becomes vivid as the ramp moves away from white. Reduce
    // saturation along the light ramp and keep dark chrome nearly neutral.
    darkSaturation: 0.35,
  });
  const resolvedSurfaceSeed = surfaceSeed.resolve();
  const lightSurface = variantToOkhsl(resolvedSurfaceSeed.light);
  const darkSurface = variantToOkhsl(resolvedSurfaceSeed.dark);
  const colorTheme = glaze(
    {
      hue: lightSurface.h,
      saturation: lightSurface.s * 100,
      darkHue: darkSurface.h,
      // The surface definition applies its 0.35 factor again. Normalize the
      // seed so dependent dark colors retain the authored surface chroma.
      darkSaturation: Math.min(100, (darkSurface.s * 100) / 0.35),
    },
    undefined,
    glazeOptions,
  );
  const surfaceSaturation = declaredSurface
    ? (surfaceInput.saturation ?? 0.05)
    : 1;
  const darkSurfaceSaturation = declaredSurface
    ? (surfaceInput.darkSaturation ?? surfaceSaturation * 0.7)
    : 0.35;
  const surfaceDefinition = paletteDefinition(
    surfaceInput,
    declaredSurface
      ? {
          tone: 98,
          saturation: surfaceSaturation,
          darkSaturation: darkSurfaceSaturation,
          mode: "auto",
        }
      : { from: surfaceFrom, mode: "auto", darkSaturation: 0.35 },
  );
  colorTheme.colors({
    surface: surfaceDefinition,
    header: paletteDefinition(
      theme.palette?.header,
      declaredSurface
        ? { ...surfaceDefinition, opacity: 0.7 }
        : {
            from: surfaceFrom,
            mode: "auto",
            darkSaturation: 0.35,
            opacity: 0.7,
          },
    ),
    "surface-2": {
      base: "surface",
      tone: "-2",
      mode: "auto",
      saturation: declaredSurface ? surfaceSaturation * 0.75 : 0.75,
      darkSaturation: declaredSurface ? darkSurfaceSaturation * 0.75 : 0.275,
    },
    "surface-3": {
      base: "surface-2",
      tone: "-2",
      mode: "auto",
      saturation: declaredSurface ? surfaceSaturation * 0.65 : 0.65,
      darkSaturation: declaredSurface ? darkSurfaceSaturation * 0.65 : 0.25,
    },
    text: paletteDefinition(theme.palette?.text, {
      from: "#20232a",
      base: "surface",
      role: "text",
      contrast: { apca: [75, 90] },
      mode: "auto",
    }),
    "text-soft": paletteDefinition(theme.palette?.textSoft, {
      from: "#626875",
      base: "surface",
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    }),
    "text-muted": mix("surface", "text", 66),
    "surface-2-hover": mix("surface-2", "text", [3, 6]),
    "surface-2-pressed": mix("surface-2", "text", [9, 14]),
    "surface-3-hover": mix("surface-3", "text", [3, 6]),
    "surface-3-pressed": mix("surface-3", "text", [9, 14]),
    "accent-text": {
      from: brand.from,
      base: "surface",
      role: "text",
      contrast: { apca: [normalTarget, highTarget] },
      mode: "auto",
    },
    focus: {
      from: brand.from,
      base: "surface",
      role: "border",
      contrast: { apca: [normalTarget, highTarget] },
      mode: "auto",
    },
    "accent-surface": { from: brand.from, mode: "fixed" },
    "accent-surface-text": {
      from: "#ffffff",
      base: "accent-surface",
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    },
    "accent-surface-subtle": mix("surface", "accent-surface", [12, 18]),
    "accent-surface-2-subtle": mix("surface-2", "accent-surface", [12, 18]),
    shadow: {
      type: "shadow",
      bg: "surface",
      fg: "text",
      intensity: [12, 20],
      tuning: { alphaMax: 0.28 },
    },
    clear: { from: "#ffffff", mode: "fixed", opacity: 0 },
    ...statusColors("info", theme.palette?.info, "#2563eb"),
    ...statusColors("success", theme.palette?.success, "#16a34a"),
    ...statusColors("warning", theme.palette?.warning, "#d97706"),
    ...statusColors("danger", theme.palette?.danger, "#dc2626"),
    ...statusColors("orange", undefined, "#d97706"),
    ...statusColors("green", undefined, "#16a34a"),
    ...statusColors("blue", undefined, "#2563eb"),
    ...statusColors("purple", undefined, "#9333ea"),
    ...statusColors("red", undefined, "#dc2626"),
  } satisfies ColorMap);

  // Underlays retain their authored dark tone instead of following text or
  // being lifted into the dark scheme's surface tone window.
  const overlaySeed =
    isColorDeclaration(theme.palette?.overlay) &&
    usesRelativeColor(theme.palette.overlay)
      ? glaze.color({ from: brand.from, mode: "fixed" }).resolve().light
      : undefined;
  const overlayTheme = glaze(
    overlaySeed?.h ?? 0,
    overlaySeed ? overlaySeed.s * 100 : 0,
    {
      ...glazeOptions,
      lightTone: false,
      darkTone: false,
    },
  );
  overlayTheme.colors({
    overlay: paletteDefinition(theme.palette?.overlay, {
      from: "#000000",
      mode: "fixed",
      opacity: 0.5,
    }),
  });

  const resolvedBrandSeed = glaze
    .color({ from: brand.from, mode: "fixed" })
    .resolve();
  const lightBrand = variantToOkhsl(resolvedBrandSeed.light);
  const darkBrand = variantToOkhsl(resolvedBrandSeed.dark);
  const borderTheme = glaze(
    {
      hue: lightBrand.h,
      saturation: lightBrand.s * 100,
      darkHue: darkBrand.h,
      darkSaturation: darkBrand.s * 100,
    },
    undefined,
    glazeOptions,
  );
  borderTheme.colors({
    surface: surfaceDefinition,
    border: {
      base: "surface",
      tone: ["-9", "-22"],
      saturation: 0.205,
      mode: "auto",
    },
    "border-strong": {
      base: "surface",
      tone: ["-20", "-38"],
      saturation: 0.205,
      mode: "auto",
    },
  } satisfies ColorMap);

  // Syntax colors are intentionally resolved as their own Glaze palette.
  // This keeps code semantics vivid enough to scan without coupling them to
  // either the product brand ramp or the deliberately restrained UI chrome.
  const syntaxTheme = glaze(210, 90, glazeOptions);
  syntaxTheme.colors({
    bg: { tone: 100, saturation: 0.1 },
    text: {
      base: "bg",
      tone: 0,
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 0,
    },
    comment: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 0.01,
      hue: 210,
    },
    punctuation: {
      base: "bg",
      contrast: { wcag: [6, "AAA"] },
      saturation: 0.01,
      hue: 210,
    },
    keyword: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
    },
    string: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 40,
    },
    token: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 125,
    },
    property: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 155,
    },
    number: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 70,
    },
    function: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 210,
    },
    value: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 210,
    },
    operator: {
      base: "bg",
      contrast: { wcag: ["AA", "AAA"] },
      saturation: 80,
      hue: 340,
    },
  } satisfies ColorMap);

  const resolvedColors = colorTheme.resolve();
  const resolvedSurface = requiredResolvedColor(resolvedColors, "surface");
  const resolvedAccent = requiredResolvedColor(resolvedColors, "accent-text");

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
  const tastyOptions = {
    ...outputOptions,
    states: {
      dark: "theme=dark | (@media(prefers-color-scheme: dark) & :not([data-theme]))",
      highContrast:
        "contrast=more | (@media(prefers-contrast: more) & :not([data-contrast]))",
    },
  } as const;
  const resolvedPalette = colorTheme.json(outputOptions);
  const colorTokens = colorTheme.tasty(tastyOptions);
  const borderTokens = borderTheme.tasty(tastyOptions);
  const syntaxTokens = glaze.palette({ syntax: syntaxTheme }).tasty({
    ...tastyOptions,
    prefix: true,
    primary: false,
  });
  const colors = {
    surface: requiredJsonColor(resolvedPalette, "surface"),
    surface2: requiredJsonColor(resolvedPalette, "surface-2"),
    surface3: requiredJsonColor(resolvedPalette, "surface-3"),
    text: requiredJsonColor(resolvedPalette, "text"),
    textSoft: requiredJsonColor(resolvedPalette, "text-soft"),
    accentText: requiredJsonColor(resolvedPalette, "accent-text"),
    accentSurface: requiredJsonColor(resolvedPalette, "accent-surface"),
    accentSurfaceText: requiredJsonColor(
      resolvedPalette,
      "accent-surface-text",
    ),
    focus: requiredJsonColor(resolvedPalette, "focus"),
    shadow: requiredJsonColor(resolvedPalette, "shadow"),
  };
  return {
    colors,
    colorTokens: {
      ...colorTokens,
      ...overlayTheme.tasty(tastyOptions),
      "#border": requiredJsonColor(borderTokens, "#border"),
      "#border-strong": requiredJsonColor(borderTokens, "#border-strong"),
      ...syntaxTokens,
    },
    tokens: resolveThemeTokens(theme.tokens),
    presets: resolveTypographyPresets(theme.presets, fontFamilies(theme.fonts)),
    contrast: scores,
    diagnostics,
  };
}

function mix(
  base: string,
  target: string,
  value: number | [number, number],
  space: "okhsl" | "srgb" = "okhsl",
): ColorMap[string] {
  return { type: "mix", base, target, value, space };
}

function statusColors(
  name: string,
  input: ThemePaletteColor | undefined,
  fallback: GlazeColorValue,
): ColorMap {
  const declaration = paletteDefinition(input, { from: fallback });
  return {
    [name]: {
      base: "surface",
      role: "border",
      contrast: { apca: [30, 45] },
      mode: "auto",
      ...declaration,
    },
    [`${name}-text`]: {
      ...declaration,
      base: "surface",
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    },
    [`${name}-surface`]: mix("surface", name, [12, 18], "srgb"),
  };
}

function isColorDeclaration(
  value: ThemePaletteColor | undefined,
): value is RegularColorDef {
  return (
    typeof value === "object" &&
    value !== null &&
    !("h" in value || "r" in value || "c" in value)
  );
}

function paletteDefinition(
  value: ThemePaletteColor | undefined,
  defaults: RegularColorDef,
): RegularColorDef {
  if (value === undefined) return defaults;
  if (!isColorDeclaration(value)) return { ...defaults, from: value };
  if (!usesRelativeColor(value)) return { ...defaults, ...value };
  const { from: _ignored, ...relativeDefaults } = defaults;
  return { ...relativeDefaults, ...value };
}

function usesRelativeColor(value: RegularColorDef): boolean {
  return (
    value.from === undefined &&
    (value.tone !== undefined ||
      value.hue !== undefined ||
      value.darkHue !== undefined ||
      value.saturation !== undefined ||
      value.darkSaturation !== undefined ||
      value.base !== undefined)
  );
}

function requiredResolvedColor(
  colors: ReturnType<ReturnType<typeof glaze>["resolve"]>,
  name: string,
) {
  const color = colors.get(name);
  if (!color) throw new Error(`The Glaze ${name} color failed to resolve.`);
  return color;
}

function requiredJsonColor(
  colors: Record<string, Record<string, string>>,
  name: string,
): Record<string, string> {
  const color = colors[name];
  if (!color) throw new Error(`The Glaze ${name} token failed to export.`);
  return color;
}

function normalizeBrand(
  brand: BrandConfig | undefined,
): Exclude<BrandConfig, GlazeColorValue> & { from: GlazeColorValue } {
  if (typeof brand === "object" && brand !== null && "from" in brand)
    return brand;
  if (isBrandDeclaration(brand)) {
    const seed = glaze
      .color({
        hue: brand.hue,
        saturation: brand.saturation,
        tone: brand.tone,
        mode: "fixed",
      })
      .resolve().light;
    return {
      from: { h: seed.h, s: seed.s, t: seed.t },
      ...(brand.contrast && { contrast: brand.contrast }),
      ...(brand.unsafeContrast && { unsafeContrast: true }),
    };
  }
  return { from: brand ?? "okhsl(266 68% 48%)" };
}

function isBrandDeclaration(
  brand: BrandConfig | undefined,
): brand is BrandDeclaration {
  return (
    typeof brand === "object" &&
    brand !== null &&
    "hue" in brand &&
    "saturation" in brand &&
    "tone" in brand
  );
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
