import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DocsConfigError, normalizeDocsConfig } from "./index.js";

const schema = JSON.parse(
  readFileSync(new URL("./schema.json", import.meta.url), "utf8"),
) as {
  properties: {
    navigation: { oneOf?: unknown[] };
    components: {
      properties: {
        overrides: { properties: { Footer: { oneOf?: unknown[] } } };
      };
    };
  };
  $defs: { componentStyleConfig: { anyOf?: unknown[] } };
};

describe("docs configuration", () => {
  it("keeps defaults and rejects unknown keys", () => {
    const config = normalizeDocsConfig();
    expect(config.build).toMatchObject({ strict: true, base: "/" });
    expect(config.markdown.rawHtml).toBe("sanitize");
    expect(() => normalizeDocsConfig({ typo: true } as never)).toThrow(
      DocsConfigError,
    );
  });

  it("preserves documented package metadata", () => {
    const config = normalizeDocsConfig({
      site: { title: "Example", version: "1.2.3" },
    });

    expect(config.site).toMatchObject({ title: "Example", version: "1.2.3" });
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

  it("preserves component style extension and replacement configuration", () => {
    const config = normalizeDocsConfig({
      theme: {
        styles: {
          StarlightHeader: { padding: "2x" },
          ThemeSelect: {
            mode: "replace",
            styles: { display: "grid" },
          },
        },
      },
    });

    expect(config.theme.styles).toEqual({
      StarlightHeader: { padding: "2x" },
      ThemeSelect: {
        mode: "replace",
        styles: { display: "grid" },
      },
    });
  });

  it("publishes component style replacement in the JSON schema", () => {
    expect(schema.properties.navigation.oneOf).toHaveLength(2);
    expect(schema.$defs.componentStyleConfig.anyOf).toHaveLength(2);
  });

  it("preserves replacement and disabled footer overrides", () => {
    expect(
      normalizeDocsConfig({
        components: { overrides: { Footer: false } },
      }).components.overrides,
    ).toEqual({ Footer: false });
    expect(
      normalizeDocsConfig({
        components: {
          overrides: { Footer: "./src/components/Footer.astro" },
        },
      }).components.overrides,
    ).toEqual({ Footer: "./src/components/Footer.astro" });
  });

  it("only accepts false as an override for the footer", () => {
    expect(() =>
      normalizeDocsConfig({
        components: { overrides: { Header: false } },
      }),
    ).toThrow(/components\.overrides\.Header/);
    expect(() =>
      normalizeDocsConfig({
        components: { overrides: { Footer: 1 } },
      } as never),
    ).toThrow(/component path or false/);
  });

  it("publishes the disabled footer option in the JSON schema", () => {
    expect(
      schema.properties.components.properties.overrides.properties.Footer.oneOf,
    ).toHaveLength(2);
  });

  it("rejects malformed component style replacement configuration", () => {
    expect(() =>
      normalizeDocsConfig({
        theme: {
          styles: {
            ThemeSelect: { mode: "replace" },
          },
        },
      } as never),
    ).toThrow(/ThemeSelect\.styles/);
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
