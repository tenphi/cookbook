import { describe, expect, it } from "vitest";
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
    expect(theme.colors.surface2.dark).toBe("oklch(0.2708 0.0004 0)");
    expect(theme.colors.surface3.dark).toBe("oklch(0.287 0.0004 0)");
    expect(tokens["#surface-2-hover"]).toContain("color-mix");
    expect(tokens["#surface-2-pressed"]).toContain("color-mix");
    expect(tokens["#surface-3-hover"]).toContain("color-mix");
    expect(tokens["#surface-3-pressed"]).toContain("color-mix");
    expect(tokens.$radius).toBe("6px");
    expect(tokens["$card-radius"]).toBe("10px");
    expect(tokens["$layout-width"]).toBe("87.5rem");
    expect(theme.presets.body?.fontFamily).toContain("'Onest Variable'");
    expect(theme.presets.heading?.fontFamily).toContain("'Onest Variable'");
    expect(theme.presets.code?.fontFamily).toContain(
      "'JetBrains Mono Variable'",
    );
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
});
