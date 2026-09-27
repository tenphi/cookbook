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
  it("accepts native Glaze mix/shadow definitions with custom references", () => {
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
            fg: "textSoft",
            intensity: [20, 40],
            tuning: { alphaMax: 0.5 },
          },
        },
      },
    });
    const theme = resolveColorTheme(config.theme);
    expect(Object.values(theme.colorTokens["#review-fill"]!)).toHaveLength(4);
    expect(theme.colorTokens["#shadow"]).not.toEqual(
      resolveColorTheme().colorTokens["#shadow"],
    );
    expect(config.theme.palette?.shadow).toHaveProperty("fg", "textSoft");
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
          shadowTuning: { alphaMax: 0.5 },
        },
      },
    });
    expect(resolveColorTheme(custom.theme).colors.text.light).not.toBe(
      baseline.colors.text.light,
    );
    expect(resolveColorTheme(custom.theme).colorTokens["#shadow"]).not.toEqual(
      baseline.colorTokens["#shadow"],
    );
    expect(() =>
      normalizeDocsConfig({ theme: { glaze: { lightTone: [100, 0] } } }),
    ).toThrow(/ascending/);
  });
});
