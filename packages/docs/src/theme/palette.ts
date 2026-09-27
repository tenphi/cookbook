import {
  checkColorContrast,
  measureColorContrast,
  type ColorContrastCheck,
} from "./contrast.js";
import {
  glaze,
  variantToOkhsl,
  type ColorMap,
  type ColorDef,
  type MixColorDef,
  type ShadowColorDef,
  type GlazeColorValue,
  type RegularColorDef,
} from "@tenphi/glaze";
import type {
  BrandConfig,
  BrandDeclaration,
  DocsDiagnostic,
  ThemeConfig,
  ThemePaletteColor,
} from "../types.js";

export interface ResolvedColorTheme {
  colors: {
    surface: Record<string, string>;
    surface2: Record<string, string>;
    surface3: Record<string, string>;
    text: Record<string, string>;
    heading: Record<string, string>;
    textSoft: Record<string, string>;
    accentText: Record<string, string>;
    accentSurface: Record<string, string>;
    accentSurfaceText: Record<string, string>;
    focus: Record<string, string>;
    shadow: Record<string, string>;
  };
  /** Glaze-generated Tasty color tokens, including interaction and status roles. */
  colorTokens: Record<string, Record<string, string>>;
  contrast: {
    light: number;
    dark: number;
    lightContrast: number;
    darkContrast: number;
  };
  contrastChecks: ColorContrastCheck[];
  diagnostics: DocsDiagnostic[];
}

export function resolveColorTheme(theme: ThemeConfig = {}): ResolvedColorTheme {
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
    ...theme.glaze,
    ...(theme.contrastLevel !== undefined
      ? { contrastLevel: theme.contrastLevel }
      : {}),
  } as const;
  const surfaceInput = theme.palette?.surface;
  const declaredSurface =
    isColorDeclaration(surfaceInput) && usesRelativeColor(surfaceInput);
  const surfaceFrom = isColorDeclaration(surfaceInput)
    ? (surfaceInput.from ?? brand.from)
    : isSpecialDefinition(surfaceInput)
      ? "#ffffff"
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
  const resolvedThemeSeed = glaze
    .color({ from: brand.from, mode: "auto" }, glazeOptions)
    .resolve();
  const lightThemeSeed = variantToOkhsl(resolvedThemeSeed.light);
  const darkThemeSeed = variantToOkhsl(resolvedThemeSeed.dark);
  const darkThemeSaturation = darkThemeSeed.s * 100;
  const colorTheme = glaze(
    {
      hue: lightThemeSeed.h,
      saturation: lightThemeSeed.s * 100,
      darkHue: darkThemeSeed.h,
      darkSaturation: darkThemeSaturation,
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
  const darkSurfaceRampSaturation = (factor: number): number =>
    declaredSurface
      ? darkSurfaceSaturation * factor
      : saturationFactor(
          (resolvedSurfaceSeed.dark.s * factor) / 0.35,
          darkThemeSaturation / 100,
        );
  const surfaceRampHue = declaredSurface
    ? {
        hue: surfaceInput.hue ?? lightThemeSeed.h,
        darkHue: surfaceInput.darkHue ?? surfaceInput.hue ?? darkThemeSeed.h,
      }
    : {
        hue: variantToOkhsl(resolvedSurfaceSeed.light).h,
        darkHue: variantToOkhsl(resolvedSurfaceSeed.dark).h,
      };
  const surfaceDefinition = paletteDefinition(
    surfaceInput,
    declaredSurface
      ? {
          tone: 98,
          saturation: surfaceSaturation,
          darkSaturation: darkSurfaceSaturation,
          mode: "auto",
        }
      : {
          from: surfaceFrom,
          mode: "auto",
          darkSaturation: saturationFactor(
            resolvedSurfaceSeed.dark.s,
            darkThemeSaturation / 100,
          ),
        },
  );
  const definitions: ColorMap = {
    surface: surfaceDefinition,
    header: paletteDefinition(
      theme.palette?.header,
      declaredSurface
        ? { ...surfaceDefinition, opacity: 0.7 }
        : {
            from: surfaceFrom,
            mode: "auto",
            darkSaturation: saturationFactor(
              resolvedSurfaceSeed.dark.s,
              darkThemeSaturation / 100,
            ),
            opacity: 0.7,
          },
    ),
    "surface-2": {
      base: "surface",
      ...surfaceRampHue,
      tone: "-2",
      mode: "auto",
      ...(declaredSurface
        ? { saturation: surfaceSaturation * 0.75 }
        : {
            from: {
              h: variantToOkhsl(resolvedSurfaceSeed.light).h,
              s: resolvedSurfaceSeed.light.s * 0.75,
              t: 1,
            },
          }),
      darkSaturation: darkSurfaceRampSaturation(declaredSurface ? 0.75 : 0.275),
    },
    "surface-3": {
      base: "surface-2",
      ...surfaceRampHue,
      tone: "-2",
      mode: "auto",
      ...(declaredSurface
        ? { saturation: surfaceSaturation * 0.65 }
        : {
            from: {
              h: variantToOkhsl(resolvedSurfaceSeed.light).h,
              s: resolvedSurfaceSeed.light.s * 0.65,
              t: 1,
            },
          }),
      darkSaturation: darkSurfaceRampSaturation(declaredSurface ? 0.65 : 0.25),
    },
    text: paletteDefinition(theme.palette?.text, {
      tone: 0,
      saturation: 0,
      base: "surface",
      role: "text",
      contrast: { apca: [75, 90] },
      mode: "auto",
    }),
    heading: paletteDefinition(theme.palette?.heading ?? theme.palette?.text, {
      tone: [4, 0],
      saturation: 0,
      base: "surface",
      role: "text",
      contrast: { apca: [75, 90] },
      mode: "auto",
    }),
    "text-soft": paletteDefinition(theme.palette?.textSoft, {
      from: "#626875",
      base: "surface",
      role: "text",
      contrast: { apca: [60, 85] },
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
      base: "surface-3",
      role: "border",
      contrast: { wcag: [3, 4.5] },
      mode: "auto",
    },
    "accent-surface": {
      from: brand.from,
      base: "surface",
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    },
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
      tuning: { alphaMax: theme.glaze?.shadowTuning?.alphaMax ?? 0.28 },
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
  };

  definitions.overlay = paletteDefinition(theme.palette?.overlay, {
    from: "#000000",
    mode: "static",
    opacity: 0.5,
  });
  definitions.border = {
    base: "surface",
    tone: ["-9", "-22"],
    saturation: 0.205,
    mode: "auto",
  };
  definitions["border-strong"] = {
    base: "surface",
    tone: ["-20", "-38"],
    saturation: 0.205,
    mode: "auto",
  };
  // Syntax uses explicit independent seeds while sharing the same dependency graph.
  definitions["syntax-bg"] = { from: { h: 210, s: 0.09, t: 1 } };
  definitions["syntax-text"] = {
    base: "syntax-bg",
    tone: 0,
    saturation: 0,
    contrast: { wcag: ["AA", "AAA"] },
  };
  for (const [name, hue, saturation, contrast] of [
    ["comment", 210, 0.009, 4.5],
    ["punctuation", 210, 0.009, 6],
    ["keyword", 210, 0.9, 4.5],
    ["string", 40, 0.9, 4.5],
    ["token", 125, 0.9, 4.5],
    ["property", 155, 0.9, 4.5],
    ["number", 70, 0.9, 4.5],
    ["function", 210, 0.9, 4.5],
    ["value", 210, 0.9, 4.5],
    ["operator", 340, 0.9, 4.5],
  ] as const)
    definitions[`syntax-${name}`] = {
      from: { h: hue, s: saturation, t: 1 },
      base: "syntax-bg",
      contrast: { wcag: [contrast, 7] },
    };
  const handled = new Set([
    "surface",
    "header",
    "overlay",
    "text",
    "heading",
    "textSoft",
    "info",
    "success",
    "warning",
    "danger",
  ]);
  const names = new Set<string>();
  for (const [name, input] of Object.entries(theme.palette ?? {})) {
    if (input === undefined) continue;
    const canonical = name === "textSoft" ? "text-soft" : name;
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(canonical) ||
      ["current", "constructor", "prototype"].includes(canonical)
    )
      throw new Error(
        `theme.palette.${name}: use a lowercase color name with hyphens; current, constructor, and prototype are reserved.`,
      );
    if (names.has(canonical))
      throw new Error(
        `theme.palette.${name}: duplicates the ${canonical} color role (textSoft is an alias of text-soft).`,
      );
    names.add(canonical);
    if (handled.has(name)) continue;
    const defaults = definitions[canonical];
    definitions[canonical] = paletteDefinition(
      input,
      defaults ?? { mode: "auto" },
    );
  }
  for (const definition of Object.values(definitions)) {
    if ("base" in definition && definition.base === "textSoft")
      definition.base = "text-soft";
    if ("target" in definition && definition.target === "textSoft")
      definition.target = "text-soft";
    if ("bg" in definition && definition.bg === "textSoft")
      definition.bg = "text-soft";
    if ("fg" in definition && definition.fg === "textSoft")
      definition.fg = "text-soft";
  }
  colorTheme.colors(definitions);

  const resolvedColors = colorTheme.resolve();
  const resolvedSurface = requiredResolvedColor(resolvedColors, "surface");
  const resolvedAccent = requiredResolvedColor(resolvedColors, "accent-text");

  const scores = {
    light: measureColorContrast(resolvedAccent.light, resolvedSurface.light),
    dark: measureColorContrast(resolvedAccent.dark, resolvedSurface.dark),
    lightContrast: measureColorContrast(
      resolvedAccent.lightContrast,
      resolvedSurface.lightContrast,
    ),
    darkContrast: measureColorContrast(
      resolvedAccent.darkContrast,
      resolvedSurface.darkContrast,
    ),
  };
  const { checks: contrastChecks, diagnostics } = checkColorContrast(
    resolvedColors,
    definitions,
    theme.contrastLevel,
    [normalTarget, highTarget],
    theme.glaze?.inferRole,
  );
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
  const colors = {
    surface: requiredJsonColor(resolvedPalette, "surface"),
    surface2: requiredJsonColor(resolvedPalette, "surface-2"),
    surface3: requiredJsonColor(resolvedPalette, "surface-3"),
    text: requiredJsonColor(resolvedPalette, "text"),
    heading: requiredJsonColor(resolvedPalette, "heading"),
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
    colorTokens,
    contrast: scores,
    contrastChecks,
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
      base: `${name}-surface`,
      role: "text",
      contrast: { apca: [60, 75] },
      mode: "auto",
    },
    [`${name}-surface`]: mix("surface", name, [12, 18], "srgb"),
  };
}

function isSpecialDefinition(
  value: ThemePaletteColor | undefined,
): value is MixColorDef | ShadowColorDef {
  return typeof value === "object" && value !== null && "type" in value;
}

function isColorDeclaration(
  value: ThemePaletteColor | undefined,
): value is RegularColorDef {
  return (
    typeof value === "object" &&
    value !== null &&
    !("h" in value || "r" in value || "c" in value || "type" in value)
  );
}

function paletteDefinition(
  value: ThemePaletteColor | undefined,
  baseDefaults: ColorDef,
): ColorDef {
  if (value === undefined) return baseDefaults;
  if (isSpecialDefinition(value)) return { ...value };
  const defaults =
    "type" in baseDefaults ? { mode: "auto" as const } : baseDefaults;
  if (!isColorDeclaration(value) || value.from !== undefined) {
    // An explicit seed owns its tone and chroma; absolute defaults must not
    // override the user's literal color. Keep adaptation and contrast floors.
    const { tone: _tone, saturation: _saturation, ...seedDefaults } = defaults;
    return {
      ...seedDefaults,
      ...(isColorDeclaration(value) ? value : { from: value }),
    };
  }
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

function saturationFactor(colorSaturation: number, themeSaturation: number) {
  return themeSaturation > 0
    ? Math.min(1, colorSaturation / themeSaturation)
    : 0;
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
