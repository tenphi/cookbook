import {
  apcaContrast,
  inferRoleFromName,
  normalizeRole,
  oppositeRole,
  type Role,
  contrastRatioFromLuminance,
  okhslToSrgb,
  resolveContrastForLevel,
  variantToOkhsl,
  type ColorMap,
  type HCPair,
  type ContrastSpec,
  type ResolvedColor,
  type ResolvedColorVariant,
} from "@tenphi/glaze";
import type { DocsDiagnostic } from "../types.js";

const COLOR_MODES = ["light", "dark", "lightContrast", "darkContrast"] as const;
export interface ColorContrastCheck {
  foreground: string;
  background: string;
  mode: (typeof COLOR_MODES)[number];
  metric: "apca" | "wcag";
  target: number;
  measured: number;
  passed: boolean;
}

function rgb(color: ResolvedColorVariant): number[] {
  const { h, s, l } = variantToOkhsl(color);
  return okhslToSrgb(h, s, l, color.pastel);
}
function composite(
  foreground: ResolvedColorVariant,
  background: number[],
): number[] {
  const alpha = foreground.alpha ?? 1;
  return rgb(foreground).map(
    (channel, i) => channel * alpha + background[i]! * (1 - alpha),
  );
}
function luminance(channels: number[], metric: "apca" | "wcag"): number {
  // APCA uses display-channel power 2.4, not WCAG's piecewise sRGB EOTF.
  // Match Glaze's luminance basis and gamut clipping in both metrics.
  return channels.reduce(
    (sum, channel, i) =>
      sum +
      [0.2126, 0.7152, 0.0722][i]! *
        (metric === "apca"
          ? channel ** 2.4
          : channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4),
    0,
  );
}
export function measureColorContrast(
  foreground: ResolvedColorVariant,
  background: ResolvedColorVariant,
  metric: "apca" | "wcag" = "apca",
  underlay: ResolvedColorVariant = background,
): number {
  const bg = composite(background, rgb(underlay));
  const fg = composite(foreground, bg);
  const yForeground = luminance(fg, metric);
  const yBackground = luminance(bg, metric);
  return metric === "apca"
    ? Math.abs(apcaContrast(yForeground, yBackground))
    : contrastRatioFromLuminance(yForeground, yBackground);
}

export function checkColorContrast(
  colors: Map<string, ResolvedColor>,
  definitions: ColorMap,
  level: number | "auto" | undefined,
  brandTargets: [number, number],
  inferRole = true,
): { checks: ColorContrastCheck[]; diagnostics: DocsDiagnostic[] } {
  const pairs = new Map<
    string,
    { foreground: string; background: string; spec: HCPair<ContrastSpec> }
  >();
  const add = (
    foreground: string,
    background: string,
    spec: HCPair<ContrastSpec>,
  ) => {
    const metric = resolveContrastForLevel(spec, 0).metric;
    const key = `${foreground}/${background}/${metric}`;
    const existing = pairs.get(key);
    if (!existing) pairs.set(key, { foreground, background, spec });
    else {
      const targets = [0, 100].map((value) =>
        Math.max(
          resolveContrastForLevel(spec, value).target,
          resolveContrastForLevel(existing.spec, value).target,
        ),
      ) as [number, number];
      existing.spec = metric === "apca" ? { apca: targets } : { wcag: targets };
    }
  };
  const roles = new Map<string, Role>();
  function role(name: string): Role {
    const cached = roles.get(name);
    if (cached) return cached;
    const definition = definitions[name]!;
    const explicit =
      "role" in definition ? normalizeRole(definition.role) : undefined;
    const inferred = inferRole ? inferRoleFromName(name) : undefined;
    const value =
      explicit ??
      inferred ??
      ("base" in definition && definition.base
        ? oppositeRole(role(definition.base))
        : "text");
    roles.set(name, value);
    return value;
  }
  // Validate every authored/default contrast declaration, including custom roles.
  for (const [name, definition] of Object.entries(definitions)) {
    if ("type" in definition || !definition.base || !definition.contrast)
      continue;
    const isSurface = role(name) === "surface";
    add(
      isSurface ? definition.base : name,
      isSurface ? name : definition.base,
      definition.contrast,
    );
  }
  // These minimums remain enforced when a consumer replaces a default definition.
  for (const role of ["text", "heading", "text-soft"])
    add(role, "surface", { wcag: [4.5, 7] });
  add("accent-text", "surface", { apca: brandTargets });
  for (const background of [
    "surface",
    "surface-2",
    "surface-3",
    "accent-surface-subtle",
    "accent-surface-2-subtle",
  ])
    add("accent-text", background, { wcag: [4.5, 7] });
  add("accent-surface-text", "accent-surface", { wcag: [4.5, 7] });
  add("accent-surface-text", "accent-surface", { apca: [60, 75] });
  for (const background of ["surface", "surface-2", "surface-3"])
    add("focus", background, { wcag: [3, 4.5] });
  for (const role of [
    "info",
    "success",
    "warning",
    "danger",
    "orange",
    "green",
    "blue",
    "purple",
    "red",
  ]) {
    add(`${role}-text`, `${role}-surface`, { apca: [60, 75] });
    add(`${role}-text`, `${role}-surface`, { wcag: [4.5, 7] });
  }

  const checks: ColorContrastCheck[] = [];
  const diagnostics: DocsDiagnostic[] = [];
  for (const { foreground, background, spec } of pairs.values()) {
    for (const mode of COLOR_MODES) {
      const { metric, target } = resolveContrastForLevel(
        spec,
        mode.includes("Contrast") ? 100 : typeof level === "number" ? level : 0,
      );
      const measured = measureColorContrast(
        colors.get(foreground)![mode],
        colors.get(background)![mode],
        metric,
        colors.get("surface")![mode],
      );
      const passed = measured + (metric === "apca" ? 0.05 : 0.01) >= target;
      checks.push({
        foreground,
        background,
        mode,
        metric,
        target,
        measured,
        passed,
      });
      if (!passed)
        diagnostics.push({
          code:
            foreground === "accent-text" && background === "surface"
              ? "DOCS_BRAND_CONTRAST_UNMET"
              : "DOCS_SEMANTIC_CONTRAST_UNMET",
          severity: "error",
          message: `${foreground} on ${background} in ${mode}: ${metric === "apca" ? "APCA Lc" : "WCAG ratio"} ${measured.toFixed(2)}; required ${target}.`,
          hint: `Adjust theme.palette["${foreground}"] or theme.palette["${background}"] using tone, saturation, base, contrast, and autoFlip. Keep their contrast floor; a fixed mid-tone background may need to adapt. Also check theme.glaze tone boundaries and opacity.`,
        });
    }
  }
  return { checks, diagnostics };
}
