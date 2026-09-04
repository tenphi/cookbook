import { describe, expect, it } from "vitest";
import {
  contrastRatioFromLuminance,
  glaze,
  okhslToLinearSrgb,
  relativeLuminanceFromLinearRgb,
  variantToOkhsl,
} from "@tenphi/glaze";
import { resolveDocsTheme } from "./index.js";
import { tastyTokens } from "./tasty-config.js";

describe("Glaze theme adapter", () => {
  it("emits all appearance modes at the configured APCA floors", () => {
    const theme = resolveDocsTheme({
      brand: { from: "#315efb", contrast: { apca: 45 } },
    });
    expect(theme.diagnostics).toEqual([]);
    expect(theme.contrast.light).toBeGreaterThanOrEqual(44.95);
    expect(theme.contrast.dark).toBeGreaterThanOrEqual(44.95);
    expect(theme.contrast.lightContrast).toBeGreaterThanOrEqual(59.95);
    expect(theme.contrast.darkContrast).toBeGreaterThanOrEqual(59.95);
    const tokens = tastyTokens(theme);
    expect(Object.values(tokens["#surface"] ?? {})).toEqual(
      expect.arrayContaining([
        theme.colors.surface.dark,
        theme.colors.surface.light,
        theme.colors.surface.darkContrast,
        theme.colors.surface.lightContrast,
      ]),
    );
    expect(Object.values(tokens["#text"] ?? {})).toEqual(
      expect.arrayContaining([
        theme.colors.text.dark,
        theme.colors.text.light,
        theme.colors.text.darkContrast,
        theme.colors.text.lightContrast,
      ]),
    );
    expect(theme.colors.surface2.light).toBe("oklch(0.9789 0 0)");
    expect(theme.colors.surface3.light).toBe("oklch(0.9581 0 0)");
    expect(theme.colors.surface2.dark).toBe("oklch(0.2708 0.0003 0)");
    expect(theme.colors.surface3.dark).toBe("oklch(0.287 0.0003 0)");
    for (const [name, states] of Object.entries(tokens).filter(([name]) =>
      name.startsWith("#"),
    )) {
      const colorStates = states as Record<string, string>;
      expect(name).not.toBe("#current");
      expect(Object.keys(colorStates)).toHaveLength(4);
      expect(Object.values(colorStates)).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^oklch\(/),
          expect.stringMatching(/^oklch\(/),
          expect.stringMatching(/^oklch\(/),
          expect.stringMatching(/^oklch\(/),
        ]),
      );
      expect(Object.values(colorStates).join(" ")).not.toContain("color-mix");
      const highContrastStates = Object.keys(colorStates).filter((state) =>
        state.includes("contrast=more"),
      );
      expect(highContrastStates).toHaveLength(2);
      expect(highContrastStates).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "@media(prefers-contrast: more) & :not([data-contrast])",
          ),
          expect.stringContaining("theme=dark"),
        ]),
      );
    }
    const borderStates = tokens["#border"] as Record<string, string>;
    const lightHighContrast = Object.keys(borderStates).find(
      (state) =>
        state.includes("contrast=more") && !state.includes("theme=dark"),
    );
    const dark = Object.keys(borderStates).find(
      (state) =>
        state.includes("theme=dark") && !state.includes("contrast=more"),
    );
    const darkHighContrast = Object.keys(borderStates).find(
      (state) =>
        state.includes("theme=dark") && state.includes("contrast=more"),
    );
    expect(lightHighContrast).toBeDefined();
    expect(dark).toBeDefined();
    expect(darkHighContrast).toBeDefined();
    expect(borderStates[lightHighContrast ?? ""]).not.toBe(borderStates[""]);
    expect(borderStates[darkHighContrast ?? ""]).not.toBe(
      borderStates[dark ?? ""],
    );
    const brandStates = tokens["#accent-surface"] as Record<string, string>;
    for (const tokenName of ["#border", "#border-strong"] as const) {
      const borderRoleStates = tokens[tokenName] as Record<string, string>;
      for (const [state, border] of Object.entries(borderRoleStates)) {
        const brandColor = brandStates[state];
        expect(brandColor).toBeDefined();
        const saturationRatio =
          colorSaturation(border) / colorSaturation(brandColor ?? "#315efb");
        expect(saturationRatio).toBeGreaterThanOrEqual(0.2);
        expect(saturationRatio).toBeLessThanOrEqual(0.3);
      }
    }
    expect(tokens).toHaveProperty("#surface-2-hover");
    expect(tokens).toHaveProperty("#surface-2-pressed");
    expect(tokens).toHaveProperty("#surface-3-hover");
    expect(tokens).toHaveProperty("#surface-3-pressed");
    expect(tokens).toHaveProperty("#accent-surface-subtle");
    expect(tokens).toHaveProperty("#orange-surface");
    expect(tokens).toHaveProperty("#green-text");
    expect(tokens).toHaveProperty("#blue");
    expect(tokens).toHaveProperty("#purple-surface");
    expect(tokens).toHaveProperty("#red-text");
    expect(tokens).toHaveProperty("#syntax-bg");
    expect(tokens).toHaveProperty("#syntax-text");
    expect(tokens).toHaveProperty("#syntax-comment");
    expect(tokens).toHaveProperty("#syntax-keyword");
    expect(tokens).toHaveProperty("#syntax-string");
    expect(tokens).toHaveProperty("#syntax-token");
    expect(tokens).toHaveProperty("#syntax-property");
    expect(tokens).toHaveProperty("#syntax-number");
    expect(tokens).toHaveProperty("#syntax-function");
    expect(tokens).toHaveProperty("#syntax-value");
    expect(tokens).toHaveProperty("#syntax-operator");
    const syntaxKeywordStates = tokens["#syntax-keyword"] as Record<
      string,
      string
    >;
    expect(syntaxKeywordStates[""]).not.toBe(
      syntaxKeywordStates[
        "contrast=more | (@media(prefers-contrast: more) & :not([data-contrast]))"
      ],
    );
    const syntaxDark = Object.keys(syntaxKeywordStates).find(
      (state) =>
        state.includes("theme=dark") && !state.includes("contrast=more"),
    );
    const syntaxDarkHighContrast = Object.keys(syntaxKeywordStates).find(
      (state) =>
        state.includes("theme=dark") && state.includes("contrast=more"),
    );
    expect(syntaxDark).toBeDefined();
    expect(syntaxDarkHighContrast).toBeDefined();
    expect(syntaxKeywordStates[syntaxDark ?? ""]).not.toBe(
      syntaxKeywordStates[syntaxDarkHighContrast ?? ""],
    );
    const syntaxBackgroundStates = tokens["#syntax-bg"] as Record<
      string,
      string
    >;
    for (const [state, background] of Object.entries(syntaxBackgroundStates)) {
      const requiredRatio = state.includes("contrast=more") ? 7 : 4.5;
      for (const tokenName of [
        "#syntax-text",
        "#syntax-comment",
        "#syntax-punctuation",
        "#syntax-keyword",
        "#syntax-string",
        "#syntax-token",
        "#syntax-property",
        "#syntax-number",
        "#syntax-function",
        "#syntax-value",
        "#syntax-operator",
      ]) {
        const syntaxStates = tokens[tokenName] as Record<string, string>;
        const tokenRequiredRatio =
          tokenName === "#syntax-punctuation" && requiredRatio < 6
            ? 6
            : requiredRatio;
        expect(
          contrastRatioFromLuminance(
            colorLuminance(syntaxStates[state] ?? ""),
            colorLuminance(background),
          ),
        ).toBeGreaterThanOrEqual(tokenRequiredRatio - 0.01);
      }
    }
    for (const tokenName of [
      "#syntax-keyword",
      "#syntax-string",
      "#syntax-token",
      "#syntax-property",
      "#syntax-number",
      "#syntax-function",
      "#syntax-value",
      "#syntax-operator",
    ]) {
      const syntaxStates = tokens[tokenName] as Record<string, string>;
      for (const color of Object.values(syntaxStates)) {
        expect(colorSaturation(color)).toBeGreaterThanOrEqual(0.8);
      }
    }
    expect(tokens.$radius).toBe("6px");
    expect(tokens["$card-radius"]).toBe("10px");
    expect(tokens["$layout-width"]).toBe("87.5rem");
    expect(theme.presets.body?.fontFamily).toContain("'Onest Variable'");
    expect(theme.presets.heading?.fontFamily).toContain("'Onest Variable'");
    expect(theme.presets.code?.fontFamily).toContain(
      "'JetBrains Mono Variable'",
    );
    expect(theme.presets.body?.lineHeight).toBe(1.65);
    expect(theme.presets.body?.letterSpacing).toBe("0");
    expect(theme.presets.body?.boldFontWeight).toBe(640);
    expect(theme.presets.heading?.letterSpacing).toBe("-0.01em");
    expect(theme.presets.heading?.boldFontWeight).toBe(720);
    expect(theme.presets.h1?.letterSpacing).toBe("-0.025em");
    expect(theme.presets.h6?.letterSpacing).toBe("0");
    expect(theme.presets).not.toHaveProperty("strong");
    expect(theme.presets.navigation?.fontSize).toBe("0.9375rem");
    expect(theme.presets.navigation?.fontWeight).toBe(540);
    expect(theme.colors.shadow.light).toMatch(/^oklch\(/);
    expect(theme.colors.shadow.dark).toMatch(/^oklch\(/);
    expect(theme.colors.shadow.dark).not.toBe(theme.colors.shadow.light);
  });

  it("resolves Tasty tokens and typography presets into the shared theme", () => {
    const theme = resolveDocsTheme({
      palette: { surface: "#fffdf8", text: "#202020" },
      tokens: {
        $radius: "4px",
        "$card-radius": "10px",
        "$border-width": "2px",
        "$layout-width": "72rem",
        "--legacy-token": "3rem",
      },
      presets: {
        body: { fontFamily: "Inter, sans-serif" },
        heading: { fontFamily: "Newsreader, serif", fontWeight: 600 },
      },
    });

    expect(theme.tokens.$radius).toBe("4px");
    expect(theme.presets.body?.fontFamily).toBe("Inter, sans-serif");
    expect(theme.presets.heading?.fontFamily).toBe("Newsreader, serif");
    expect(theme.presets.h1?.fontFamily).toBe("var(--heading-font-family)");
    const tokens = tastyTokens(theme);
    expect(tokens.$radius).toBe("4px");
    expect(tokens["$card-radius"]).toBe("10px");
    expect(tokens["$border-width"]).toBe("2px");
    expect(tokens["$layout-width"]).toBe("72rem");
    expect(tokens).not.toHaveProperty("--legacy-token");
  });

  it("builds restrained surface colors in two-tone steps", () => {
    const theme = resolveDocsTheme({
      palette: { surface: "#fcfcff" },
    });

    expect(theme.colors.surface.light).toBe("oklch(0.9919 0.004 286.33)");
    expect(theme.colors.surface2.light).toBe("oklch(0.9709 0.0123 286.33)");
    expect(theme.colors.surface3.light).toBe("oklch(0.9503 0.0191 286.33)");
    expect(theme.colors.surface2.lightContrast).toBe(
      theme.colors.surface2.light,
    );
    expect(theme.colors.surface3.lightContrast).toBe(
      theme.colors.surface3.light,
    );
  });
});

function colorSaturation(color: string): number {
  return variantToOkhsl(
    glaze.color({ from: color, mode: "fixed" }).resolve().light,
  ).s;
}

function colorLuminance(color: string): number {
  const variant = glaze.color({ from: color, mode: "fixed" }).resolve().light;
  const { h, s, l } = variantToOkhsl(variant);
  return relativeLuminanceFromLinearRgb(
    okhslToLinearSrgb(h, s, l, variant.pastel),
  );
}
