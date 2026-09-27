import { describe, expect, it } from "vitest";
import { glaze } from "@tenphi/glaze";
import { measureColorContrast } from "./contrast.js";
import { resolveColorTheme } from "./palette.js";

describe("semantic contrast diagnostics", () => {
  it.each([
    "#d97706",
    "#315efb",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#ffffff",
    "#000000",
    "#808080",
    "#f9a8d4",
    "#115e59",
  ])("keeps a simple %s brand usable in all appearance modes", (from) => {
    const theme = resolveColorTheme({ brand: { from } });
    expect(theme.diagnostics).toEqual([]);
    expect(theme.contrastChecks.every((check) => check.passed)).toBe(true);
    for (const mode of [
      "light",
      "dark",
      "lightContrast",
      "darkContrast",
    ] as const)
      expect(theme.contrast[mode]).toBeGreaterThanOrEqual(
        mode.includes("Contrast") ? 60 : 45,
      );
    expect(
      theme.contrastChecks.some(
        (check) =>
          check.foreground === "focus" && check.background === "surface-3",
      ),
    ).toBe(true);
    expect(
      theme.contrastChecks.some(
        (check) =>
          check.foreground === "warning-text" &&
          check.background === "warning-surface",
      ),
    ).toBe(true);
  });
  it("measures APCA in its own luminance basis and composites translucent text", () => {
    const color = (from: string) =>
      glaze.color({ from, mode: "static" }).resolve().light;
    const gray = color("#777777"),
      white = color("#ffffff"),
      black = color("#000000");
    expect(measureColorContrast(gray, white)).toBeCloseTo(71.11, 1);
    expect(measureColorContrast(gray, white, "wcag")).toBeCloseTo(4.478, 2);
    expect(measureColorContrast({ ...black, alpha: 0.5 }, white)).toBeCloseTo(
      measureColorContrast(color("rgb(127.5 127.5 127.5)"), white),
      2,
    );
  });
  it("names failing pairs, modes, targets and actionable configuration paths", () => {
    const result = resolveColorTheme({
      palette: {
        "accent-surface": {
          tone: 70,
          saturation: 0,
          mode: "static",
          contrast: { apca: 1 },
        },
        focus: {
          tone: 98,
          saturation: 0,
          mode: "static",
          contrast: { wcag: 1 },
        },
        "warning-text": {
          tone: 95,
          saturation: 0,
          opacity: 0.2,
          mode: "static",
        },
      },
    });
    expect(
      result.diagnostics.some((item) =>
        item.message.includes("accent-surface-text on accent-surface"),
      ),
    ).toBe(true);
    expect(
      result.diagnostics.some(
        (item) =>
          item.message.includes("focus on surface") &&
          item.message.includes("required 3"),
      ),
    ).toBe(true);
    expect(
      result.diagnostics.some((item) =>
        item.message.includes("warning-text on warning-surface"),
      ),
    ).toBe(true);
    expect(
      result.diagnostics.every((item) => item.hint?.includes("theme.palette[")),
    ).toBe(true);
  });
  it("checks custom role declarations and manual contrast interpolation", () => {
    const result = resolveColorTheme({
      contrastLevel: 50,
      palette: {
        "review-panel": { tone: 50, saturation: 0, mode: "static" },
        "review-ink": {
          base: "review-panel",
          contrast: { apca: [75, 90] },
          saturation: 0,
        },
      },
    });
    expect(
      result.contrastChecks.find(
        (check) => check.foreground === "review-ink" && check.mode === "light",
      )?.target,
    ).toBe(82.5);
    expect(
      result.diagnostics.some((item) =>
        item.message.includes("review-ink on review-panel"),
      ),
    ).toBe(true);
  });
});
