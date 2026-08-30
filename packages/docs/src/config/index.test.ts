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

  it("validates theme keys without rejecting public design tokens", () => {
    expect(() =>
      normalizeDocsConfig({ theme: { typo: true } } as never),
    ).toThrow(/theme\.typo/);
    expect(() =>
      normalizeDocsConfig({
        theme: {
          tokens: { $radius: "4px", "$card-radius": "8px" },
          presets: {
            body: { fontFamily: "Inter, sans-serif" },
            heading: { fontFamily: "Newsreader, serif" },
          },
        },
      }),
    ).not.toThrow();
  });

  it("preserves optional primary navigation tabs", () => {
    const config = normalizeDocsConfig({
      navigation: {
        items: ["/"],
        tabs: [
          {
            label: "Docs",
            link: "/",
            items: [
              {
                label: "Learn",
                items: [
                  {
                    label: "Foundations",
                    items: [{ label: "Home", link: "/" }],
                  },
                ],
              },
            ],
          },
          { label: "GitHub", link: "https://github.com/example/project" },
        ],
      },
    });

    expect(config.navigation.tabs).toEqual([
      {
        label: "Docs",
        link: "/",
        items: [
          {
            label: "Learn",
            items: [
              { label: "Foundations", items: [{ label: "Home", link: "/" }] },
            ],
          },
        ],
      },
      { label: "GitHub", link: "https://github.com/example/project" },
    ]);
  });
});
