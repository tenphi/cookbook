import { describe, expect, it } from "vitest";
import { DocsConfigError, normalizeDocsConfig } from "./index.js";

describe("docs configuration", () => {
  it("keeps defaults and rejects unknown keys", () => {
    const config = normalizeDocsConfig();
    expect(config.build).toMatchObject({ strict: true, base: "/" });
    expect(config.markdown.rawHtml).toBe("sanitize");
    expect(() => normalizeDocsConfig({ typo: true } as never)).toThrow(
      DocsConfigError,
    );
  });

  it("guards the normal-mode accessibility floor", () => {
    expect(() =>
      normalizeDocsConfig({
        theme: { brand: { from: "#fff", contrast: { apca: 44 } } },
      }),
    ).toThrow(/cannot be below 45/);
  });
});
