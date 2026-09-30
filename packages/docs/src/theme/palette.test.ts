import { describe, it, expect } from "vitest";
import {
  normalizeDocsConfig,
  mergeDocsConfig,
  validateConfig,
} from "../config/index.js";
import { resolveColorTheme } from "./palette.js";
import type { ThemePaletteConfig } from "../types.js";

describe("shared Glaze palette graph", () => {
  it("tints the dark syntax surface with the brand while keeping light code white", () => {
    const blue = resolveColorTheme({ brand: { from: "#315efb" } });
    const orange = resolveColorTheme({ brand: { from: "#d97706" } });
    const blueBackground = blue.colorTokens["#syntax-bg"]!;
    const orangeBackground = orange.colorTokens["#syntax-bg"]!;
    const dark = Object.keys(blueBackground).find(
      (state) =>
        state.includes("theme=dark") && !state.includes("contrast=more"),
    )!;
    expect(blueBackground[""]).toBe("oklch(1 0 0)");
    expect(orangeBackground[""]).toBe("oklch(1 0 0)");
    expect(blueBackground[dark]).toMatch(/^oklch\(0\.\d+ 0\.\d+ 26\d/);
    expect(orangeBackground[dark]).toMatch(/^oklch\(0\.\d+ 0\.\d+ 5\d/);
    expect(blueBackground[dark]).not.toBe(orangeBackground[dark]);
    const reference = resolveColorTheme({
      brand: { from: "okhsl(266 68% 48%)" },
      palette: { surface: { tone: 98, saturation: 0.05 } },
    });
    const chroma = (value: string) =>
      Number(value.match(/^oklch\([^ ]+ ([^ ]+)/)![1]);
    expect(
      Math.abs(
        chroma(reference.colorTokens["#syntax-bg"]![dark]!) -
          chroma(reference.colorTokens["#surface"]![dark]!),
      ),
    ).toBeLessThan(0.002);
    expect(
      resolveColorTheme({
        brand: { from: "#315efb" },
        palette: { "syntax-bg": { from: "#3b1824" } },
      }).colorTokens["#syntax-bg"],
    ).not.toEqual(blueBackground);
  });

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
  it("reports missing references, cycles and invalid names", () => {
    for (const [palette, expected] of [
      [{ "review-ink": { base: "absent", tone: 0 } }, /absent/],
      [
        { a: { base: "b", tone: "-1" }, b: { base: "a", tone: "+1" } },
        /circular/i,
      ],
      [{ "Review Ink": { tone: 10 } }, /lowercase/],
      [{ current: { tone: 10 } }, /reserved/],
      [{ textSoft: { tone: 20 } }, /lowercase/],
      [{ textSoft: { tone: 20 }, "text-soft": { tone: 30 } }, /lowercase/],
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
  it("uses canonical names in palette declarations, dependencies and resolved colors", () => {
    const config = normalizeDocsConfig({
      theme: {
        palette: {
          "text-soft": { base: "surface", tone: 0, saturation: 0 },
          quiet: { base: "text-soft", tone: "+1" },
        },
      },
    });
    const resolved = resolveColorTheme(config.theme);
    expect(resolved.colorTokens).toHaveProperty("#quiet");
    expect(resolved.colors["text-soft"]).not.toEqual(
      resolveColorTheme().colors["text-soft"],
    );
    expect(
      Object.keys(resolved.colors).every((name) =>
        /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name),
      ),
    ).toBe(true);
  });
  it("rejects the removed camel-case name in every dependency field", () => {
    for (const definition of [
      { base: "textSoft", tone: "+1" },
      { type: "mix", base: "surface", target: "textSoft", value: 50 },
      { type: "shadow", bg: "textSoft", fg: "text", intensity: 20 },
      { type: "shadow", bg: "surface", fg: "textSoft", intensity: 20 },
    ] as const) {
      const config = { theme: { palette: { quiet: definition } } };
      expect(() => normalizeDocsConfig(config)).toThrow(/textSoft/);
      expect(() => resolveColorTheme(config.theme)).toThrow(/textSoft/);
    }
  });
});
