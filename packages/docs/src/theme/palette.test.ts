import { describe, it, expect } from "vitest";
import {
  normalizeDocsConfig,
  mergeDocsConfig,
  validateConfig,
} from "../config/index.js";
import { resolveColorTheme } from "./palette.js";
import type { ThemePaletteConfig } from "../types.js";

describe("shared Glaze palette graph", () => {
  it("validates and renders forward references across custom and built-in roles", () => {
    const palette: ThemePaletteConfig = {
      text: { base: "header", tone: 0 },
      header: { base: "review-panel", tone: "+0", opacity: 1 },
      "review-ink": {
        base: "review-panel",
        tone: [4, 0],
        contrast: { wcag: [7, 10] },
        saturation: 0.05,
      },
      "review-panel": { base: "surface", tone: "-2", saturation: 0.05 },
      "syntax-comment": {
        base: "review-panel",
        tone: 15,
        contrast: { wcag: [4.5, 7] },
      },
      "review-focus": { base: "border", tone: "-10" },
      "review-overlay": { base: "overlay", tone: "+10" },
    };
    const config = normalizeDocsConfig({
      theme: { brand: { from: "#315efb" }, palette },
    });
    const resolved = resolveColorTheme(config.theme);
    const reversed = resolveColorTheme({
      ...config.theme,
      palette: Object.fromEntries(Object.entries(palette).reverse()),
    });
    expect(resolved.colorTokens).toEqual(reversed.colorTokens);
    for (const name of [
      "review-ink",
      "review-panel",
      "review-focus",
      "review-overlay",
    ])
      expect(Object.values(resolved.colorTokens[`#${name}`]!)).toHaveLength(4);
    expect(
      resolveColorTheme({ ...config.theme, brand: { from: "#db2777" } })
        .colorTokens["#review-panel"],
    ).not.toEqual(resolved.colorTokens["#review-panel"]);
  });
  it("resolves references only after layered palettes have been merged", () => {
    const merged = mergeDocsConfig(
      {
        theme: { palette: { "review-panel": { tone: 96, saturation: 0.05 } } },
      },
      {
        theme: { palette: { "review-ink": { base: "review-panel", tone: 0 } } },
      },
    );
    expect(resolveColorTheme(merged.theme).colorTokens).toHaveProperty(
      "#review-ink",
    );
  });
  it("reports missing references, cycles, invalid names and alias collisions", () => {
    for (const [palette, expected] of [
      [{ "review-ink": { base: "absent", tone: 0 } }, /absent/],
      [
        { a: { base: "b", tone: "-1" }, b: { base: "a", tone: "+1" } },
        /circular/i,
      ],
      [{ "Review Ink": { tone: 10 } }, /lowercase/],
      [{ current: { tone: 10 } }, /reserved/],
      [{ textSoft: { tone: 20 }, "text-soft": { tone: 30 } }, /duplicates/],
    ] as const) {
      const diagnostics = validateConfig({
        theme: { palette: palette as ThemePaletteConfig },
      });
      expect(diagnostics.map((item) => item.message).join("\n")).toMatch(
        expected,
      );
      expect(() =>
        resolveColorTheme({ palette: palette as ThemePaletteConfig }),
      ).toThrow(expected);
    }
  });
  it("accepts the public textSoft alias in dependencies", () => {
    const config = normalizeDocsConfig({
      theme: { palette: { quiet: { base: "textSoft", tone: "+1" } } },
    });
    expect(resolveColorTheme(config.theme).colorTokens).toHaveProperty(
      "#quiet",
    );
  });
});
