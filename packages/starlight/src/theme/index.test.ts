import { describe, expect, it } from "vitest";
import { resolveDocsTheme } from "./index.js";

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
    expect(theme.css).not.toContain("undefined");
    expect(theme.css).toContain("[data-theme=light]");
    expect(theme.css).toContain("prefers-contrast:more");
    expect(theme.css).toContain("--td-text:");
    expect(theme.css).toContain("--td-border:");
  });

  it("resolves Tasty tokens and typography presets into the shared theme", () => {
    const theme = resolveDocsTheme({
      palette: { surface: "#fffdf8", text: "#202020" },
      tokens: {
        $radius: "4px",
        "$card-radius": "10px",
        "$border-width": "2px",
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
    expect(theme.css).toContain("--radius:4px");
    expect(theme.css).toContain("--card-radius:10px");
    expect(theme.css).toContain("--border-width:2px");
    expect(theme.css).toContain("--legacy-token:3rem");
    expect(theme.css).toContain("--body-font-family:Inter, sans-serif");
    expect(theme.css).toContain("--heading-font-family:Newsreader, serif");
  });
});
