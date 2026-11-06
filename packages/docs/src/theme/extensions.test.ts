import { describe, it, expect } from "vitest";
import { COOKBOOK_PALETTE_NAMES } from "../types.js";
import { mergeDocsConfig, normalizeDocsConfig } from "../config/index.js";
import { resolveColorTheme } from "./palette.js";

describe("theme extensions", () => {
  it("publishes every generated palette role", () => {
    expect(
      Object.keys(resolveColorTheme().colorTokens)
        .map((name) => name.slice(1))
        .sort(),
    ).toEqual([...COOKBOOK_PALETTE_NAMES].sort());
  });
  it("accepts native Glaze mix/shadow/glow definitions with custom references", () => {
    const config = normalizeDocsConfig({
      theme: {
        palette: {
          "review-panel": { tone: 95, saturation: 0.05 },
          "review-fill": {
            type: "mix",
            base: "review-panel",
            target: "accent-surface",
            value: [10, 20],
            space: "srgb",
          },
          shadow: {
            type: "shadow",
            bg: "review-fill",
            fg: "text-soft",
            intensity: [6, 0],
            tuning: { objectInfluence: 1 },
          },
          "review-glow": { type: "glow", bg: "surface-3", intensity: [3, 0] },
        },
      },
    });
    const theme = resolveColorTheme(config.theme);
    expect(Object.values(theme.colorTokens["#review-fill"]!)).toHaveLength(4);
    expect(Object.values(theme.colorTokens["#review-glow"]!)).toHaveLength(4);
    expect(theme.colorTokens["#shadow"]).not.toEqual(
      resolveColorTheme().colorTokens["#shadow"],
    );
    expect(config.theme.palette?.shadow).toHaveProperty("fg", "text-soft");
  });
  it("preserves status mix/shadow graphs and gives derived text its own contrast floor", () => {
    for (const declaration of [
      {
        type: "mix",
        base: "surface",
        target: "accent-surface",
        value: 30,
        space: "srgb",
      },
      { type: "shadow", bg: "surface", fg: "text", intensity: [6, 0] },
      { type: "glow", bg: "surface-3", intensity: [3, 0] },
    ] as const) {
      const resolved = resolveColorTheme({
        palette: { info: declaration, "custom-status": declaration },
      });
      expect(resolved.diagnostics).toEqual([]);
      expect(resolved.colorTokens["#info"]).toEqual(
        resolved.colorTokens["#custom-status"],
      );
      expect(
        resolved.contrastChecks
          .filter((check) => check.foreground === "info-text")
          .every((check) => check.passed),
      ).toBe(true);
      expect(Object.values(resolved.colorTokens["#info-text"]!)).toHaveLength(
        4,
      );
    }
  });
  it("merges units and recipe state maps deterministically", () => {
    const config = mergeDocsConfig(
      {
        theme: {
          units: { rh: "6px" },
          recipes: {
            panel: {
              padding: "2rh",
              color: { "": "#text", hovered: "#accent-text" },
            },
          },
        },
      },
      {
        theme: {
          units: { rh: "8px", tiny: "2px" },
          recipes: { panel: { radius: "1r", color: { focused: "#focus" } } },
        },
      },
    );
    expect(config.theme?.units).toEqual({ rh: "8px", tiny: "2px" });
    expect(config.theme?.recipes?.panel).toEqual({
      padding: "2rh",
      radius: "1r",
      color: { "": "#text", hovered: "#accent-text", focused: "#focus" },
    });
    expect(() =>
      normalizeDocsConfig({
        theme: { recipes: { bad: { recipe: "bad" } } },
      } as never),
    ).toThrow(/cannot reference/);
  });
  it("applies and validates Glaze adaptation settings", () => {
    const baseline = resolveColorTheme();
    const custom = normalizeDocsConfig({
      theme: {
        glaze: {
          lightTone: [5, 100],
          darkTone: [10, 98],
          darkDesaturation: 0.5,
        },
      },
    });
    expect(resolveColorTheme(custom.theme).colors.text.light).not.toBe(
      baseline.colors.text.light,
    );
    const tuned = normalizeDocsConfig({
      theme: { glaze: { shadowTuning: { tint: 0.3, reach: 0.95 } } },
    });
    expect(resolveColorTheme(tuned.theme).colorTokens["#shadow"]).not.toEqual(
      baseline.colorTokens["#shadow"],
    );
    expect(() =>
      normalizeDocsConfig({ theme: { glaze: { lightTone: [100, 0] } } }),
    ).toThrow(/ascending/);
    // Glaze 3 replaced the 2.x shadow tuning fields.
    expect(() =>
      normalizeDocsConfig({
        theme: { glaze: { shadowTuning: { alphaMax: 0.3 } } },
      } as never),
    ).toThrow(/shadowTuning\.alphaMax/);
    expect(() =>
      normalizeDocsConfig({
        theme: { glaze: { shadowTuning: { reach: 2 } } },
      }),
    ).toThrow(/reach must be a number from 0 to 1/);
    // A role's own tuning follows the same rules; Cookbook emits no HDR tier.
    expect(() =>
      normalizeDocsConfig({
        theme: {
          palette: {
            shadow: {
              type: "shadow",
              bg: "surface",
              intensity: [6, 0],
              tuning: { alphaMax: 0.3 },
            },
          },
        },
      } as never),
    ).toThrow(/palette\.shadow\.tuning\.alphaMax/);
    expect(() =>
      normalizeDocsConfig({
        theme: {
          palette: {
            "review-glow": {
              type: "glow",
              bg: "surface-3",
              intensity: [3, 0],
              tuning: { headroom: 1 },
            },
          },
        },
      }),
    ).toThrow(/review-glow\.tuning\.headroom/);
  });
});
