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
  });
});
