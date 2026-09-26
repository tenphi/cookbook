import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DocsConfigError,
  mergeDocsConfig,
  normalizeDocsConfig,
  COOKBOOK_COMPONENT_NAMES,
} from "./index.js";

const schema = JSON.parse(
  readFileSync(new URL("./schema.json", import.meta.url), "utf8"),
) as {
  properties: {
    site: {
      properties: { favicon: { oneOf?: unknown[] } };
    };
    navigation: { oneOf?: unknown[] };
    content: {
      properties: { localizeRepositoryLinks: { default?: boolean } };
    };
    markdown: {
      properties: { rawHtml: { enum?: string[]; default?: string } };
    };
    head: { items: { required?: string[] } };
    components: {
      properties: {
        overrides: { properties: { Footer: { oneOf?: unknown[] } } };
      };
    };
    locales: { additionalProperties?: { $ref?: string } };
    lastUpdated: { default?: boolean };
    theme: {
      properties: {
        brand: { $ref?: string };
        palette: { properties: { surface: { $ref?: string } } };
        fonts: unknown;
        styles: {
          properties: Record<string, unknown>;
          additionalProperties: {
            type?: string;
            propertyNames?: { not?: { const?: string } };
          };
        };
      };
    };
  };
};

describe("docs configuration", () => {
  it("validates version roots and OpenAPI sources", () => {
    expect(
      normalizeDocsConfig({
        site: {
          versions: [
            { label: "Latest", routeBase: "/" },
            { label: "v1", routeBase: "/v1" },
          ],
        },
        content: {
          sources: [{ openapi: "api/openapi.yaml", routeBase: "/api" }],
        },
      }).site.versions,
    ).toHaveLength(2);
    expect(() =>
      normalizeDocsConfig({
        site: { versions: [{ label: "v1", routeBase: "/v1" }] },
      }),
    ).toThrow(/at least two/);
    expect(() =>
      normalizeDocsConfig({
        site: {
          versions: [
            { label: "Latest", routeBase: "/" },
            { label: "Bad", routeBase: "/bad/" },
          ],
        },
      }),
    ).toThrow(/trailing slash/);
    expect(() =>
      normalizeDocsConfig({ content: { sources: [{ openapi: "" }] } }),
    ).toThrow(/openapi must be a non-empty string/);
  });

  it("keeps defaults and rejects unknown keys", () => {
    const config = normalizeDocsConfig();
    expect(config.build).toMatchObject({ strict: true, base: "/" });
    expect(config.head).toEqual([]);
    expect(config.markdown.rawHtml).toBe("sanitize");
    expect(() => normalizeDocsConfig({ typo: true } as never)).toThrow(
      DocsConfigError,
    );
  });

  it("normalizes implemented content policies and rejects malformed limits", () => {
    const config = normalizeDocsConfig({
      content: { localizeRepositoryLinks: true },
      markdown: { rawHtml: "sanitize" },
    });
    expect(config.content.localizeRepositoryLinks).toBe(true);
    expect(config.markdown.rawHtml).toBe("sanitize");
    expect(
      schema.properties.content.properties.localizeRepositoryLinks.default,
    ).toBe(false);
    expect(schema.properties.markdown.properties.rawHtml.enum).toEqual([
      "allow",
      "sanitize",
      "strip",
      "reject",
    ]);
    expect(schema.properties.markdown.properties.rawHtml.default).toBe(
      "sanitize",
    );
    expect(() =>
      normalizeDocsConfig({ markdown: { rawHtml: "escape" } } as never),
    ).toThrow(/markdown\.rawHtml/);
    expect(() => normalizeDocsConfig({ build: { maxFiles: 0 } })).toThrow(
      /build\.maxFiles must be a positive integer/,
    );
  });

  it("requires web URLs for public site metadata", () => {
    expect(() =>
      normalizeDocsConfig({ site: { url: "docs.example.com" } }),
    ).toThrow(/site\.url must be an absolute HTTP/);
    expect(() =>
      normalizeDocsConfig({ site: { repository: "javascript:alert(1)" } }),
    ).toThrow(/site\.repository must be an absolute HTTP/);
  });

  it("lists every configurable component in the public schema", () => {
    expect(
      Object.keys(schema.properties.theme.properties.styles.properties).sort(),
    ).toEqual([...COOKBOOK_COMPONENT_NAMES].sort());
  });

  it("preserves header buttons and their variants", () => {
    const headerLinks = [
      {
        label: "Guide",
        link: "/guide?lang=en#start",
        variant: "primary" as const,
      },
      { label: "Releases", link: "https://example.com/releases", newTab: true },
      { label: "Overview", link: "#overview" },
    ];
    expect(
      normalizeDocsConfig({ site: { headerLinks } }).site.headerLinks,
    ).toEqual(headerLinks);
    expect(
      normalizeDocsConfig({ site: { headerLinks: [] } }).site.headerLinks,
    ).toEqual([]);
    expect(
      normalizeDocsConfig({ theme: { palette: { header: "#fafafa" } } }).theme
        .palette?.header,
    ).toBe("#fafafa");
  });

  it("accepts a custom overlay color seed", () => {
    expect(
      normalizeDocsConfig({ theme: { palette: { overlay: "#131025" } } }).theme
        .palette?.overlay,
    ).toBe("#131025");
  });

  it("accepts Google names and local font files, and rejects malformed definitions", () => {
    expect(
      normalizeDocsConfig({
        theme: {
          fonts: {
            body: "Inter",
            heading: { google: "Newsreader", weights: [400, 700] },
            code: {
              family: "Acme Mono",
              files: [{ src: "/fonts/acme.woff2", weight: "100 900" }],
            },
          },
        },
      }).theme.fonts?.code,
    ).toEqual({
      family: "Acme Mono",
      files: [{ src: "/fonts/acme.woff2", weight: "100 900" }],
    });
    expect(schema.properties.theme.properties.fonts).toBeDefined();
    for (const fonts of [
      { body: "" },
      { body: { google: "Inter", weights: [] } },
      { body: { family: "Acme", files: [{ src: "../outside.woff2" }] } },
      {
        code: {
          family: "Acme",
          files: [{ src: "/fonts/acme.woff2", weight: "900 100" }],
        },
      },
      { typo: "Inter" },
    ]) {
      expect(() => normalizeDocsConfig({ theme: { fonts } } as never)).toThrow(
        /theme\.fonts/,
      );
    }
  });

  it("replaces each font role when composing theme presets", () => {
    expect(
      mergeDocsConfig(
        {
          theme: {
            fonts: {
              body: { google: "Inter", weights: [400, 700] },
              heading: "Newsreader",
            },
          },
        },
        {
          theme: {
            fonts: {
              body: {
                family: "Acme Sans",
                files: [{ src: "/fonts/acme.woff2" }],
              },
            },
          },
        },
      ).theme?.fonts,
    ).toEqual({
      body: { family: "Acme Sans", files: [{ src: "/fonts/acme.woff2" }] },
      heading: "Newsreader",
    });
    expect(
      mergeDocsConfig(
        { theme: { fonts: { body: "Inter" } } },
        { theme: { fonts: { body: undefined } } },
      ).theme?.fonts?.body,
    ).toBe("Inter");
  });

  it("replaces literal color seeds with Glaze declarations in layered themes", () => {
    const config = mergeDocsConfig(
      {
        theme: {
          brand: { from: "#315efb", contrast: { apca: 45 } },
          palette: {
            surface: "#fcfcff",
            text: { from: "#20232a", base: "surface" },
          },
        },
      },
      {
        theme: {
          brand: {
            hue: 266,
            saturation: 68,
            tone: 48,
            contrast: { apca: [45, 60] },
          },
          palette: {
            surface: { tone: 98, saturation: 0.05 },
            text: { base: "surface", contrast: { wcag: [7, 10] } },
          },
        },
      },
    );
    expect(config.theme?.brand).toEqual({
      hue: 266,
      saturation: 68,
      tone: 48,
      contrast: { apca: [45, 60] },
    });
    expect(config.theme?.palette).toEqual({
      surface: { tone: 98, saturation: 0.05 },
      text: { base: "surface", contrast: { wcag: [7, 10] } },
    });
  });

  it.each([
    "not an array",
    [null],
    [{ label: "", link: "/" }],
    [{ label: "Link", link: "javascript:alert(1)" }],
    [{ label: "Link", link: "//example.com" }],
    [{ label: "Link", link: "relative" }],
    [{ label: "Link", link: "/path with spaces" }],
    [{ label: "Link", link: "/", variant: "unknown" }],
    [{ label: "Link", link: "/", newTab: "yes" }],
    [{ label: "Link", link: "/", typo: true }],
  ])("rejects malformed header buttons: %j", (headerLinks) => {
    expect(() =>
      normalizeDocsConfig({ site: { headerLinks } } as never),
    ).toThrow(/site\.headerLinks/);
  });

  it("preserves documented package metadata", () => {
    const config = normalizeDocsConfig({
      site: {
        title: "Example",
        version: "1.2.3",
        favicon: { source: "./logo.svg", background: "#123456" },
      },
    });

    expect(config.site).toMatchObject({
      title: "Example",
      version: "1.2.3",
      favicon: { source: "./logo.svg", background: "#123456" },
    });
    expect(schema.properties.site.properties.favicon.oneOf).toHaveLength(2);
  });

  it("rejects malformed site icon configuration", () => {
    expect(() => normalizeDocsConfig({ site: { favicon: "" } })).toThrow(
      /non-empty local path/,
    );
    expect(() =>
      normalizeDocsConfig({
        site: { favicon: { source: "", typo: true } },
      } as never),
    ).toThrow(/site\.favicon/);
    expect(() =>
      normalizeDocsConfig({
        site: { favicon: { source: "./logo.svg", background: 123 } },
      } as never),
    ).toThrow(/background must be a non-empty color string/);
  });

  it("preserves custom head elements", () => {
    const head = [
      {
        tag: "script",
        attrs: {
          defer: true,
          src: "https://analytics.example.com/script.js",
          "data-website-id": "website-id",
        },
      },
    ];

    expect(normalizeDocsConfig({ head }).head).toEqual(head);
    expect(schema.properties.head.items.required).toContain("tag");
  });

  it("preserves source metadata and multilingual configuration", () => {
    const config = normalizeDocsConfig({
      editLink: {
        baseUrl: "https://github.com/example/project/edit/main/",
      },
      lastUpdated: true,
      locales: {
        root: { label: "English", lang: "en" },
        ar: { label: "العربية", dir: "rtl" },
      },
      defaultLocale: "root",
    });

    expect(config.editLink?.baseUrl).toContain("/edit/main/");
    expect(config.lastUpdated).toBe(true);
    expect(config.locales?.ar?.dir).toBe("rtl");
    expect(config.defaultLocale).toBe("root");
    expect(schema.properties.lastUpdated.default).toBe(false);
    expect(schema.properties.locales.additionalProperties?.$ref).toBe(
      "#/$defs/locale",
    );
  });

  it("rejects invalid multilingual configuration", () => {
    expect(() =>
      normalizeDocsConfig({
        locales: { en: { label: "English" } },
        defaultLocale: "fr",
      }),
    ).toThrow(/defaultLocale must match/);
    expect(() =>
      normalizeDocsConfig({
        locales: { ar: { label: "العربية", dir: "sideways" } },
      } as never),
    ).toThrow(/must be "ltr" or "rtl"/);
  });

  it("rejects malformed custom head elements", () => {
    expect(() => normalizeDocsConfig({ head: {} } as never)).toThrow(
      /head must be an array/,
    );
    expect(() =>
      normalizeDocsConfig({ head: [{ tag: "script", typo: true }] } as never),
    ).toThrow(/head\[0\]\.typo/);
    expect(() =>
      normalizeDocsConfig({
        head: [{ tag: "script", attrs: { defer: 1 } }],
      } as never),
    ).toThrow(/head\[0\]\.attrs\.defer/);
  });

  it("guards the normal-mode accessibility floor", () => {
    expect(() =>
      normalizeDocsConfig({
        theme: { brand: { from: "#fff", contrast: { apca: 44 } } },
      }),
    ).toThrow(/cannot be below 45/);
    expect(() =>
      normalizeDocsConfig({
        theme: {
          brand: {
            hue: 266,
            saturation: 68,
            tone: 48,
            contrast: { apca: [44, 60] },
          },
        },
      }),
    ).toThrow(/cannot be below 45/);
  });

  it("validates Glaze declarations in brand and palette roles", () => {
    expect(
      normalizeDocsConfig({
        theme: {
          brand: { hue: 266, saturation: 68, tone: 48 },
          palette: {
            surface: { tone: 98, saturation: 0.05 },
            text: { base: "surface", contrast: { wcag: [7, 10] } },
          },
        },
      }).theme.palette?.surface,
    ).toEqual({ tone: 98, saturation: 0.05 });
    expect(schema.properties.theme.properties.brand.$ref).toBe(
      "#/$defs/brandColor",
    );
    expect(
      schema.properties.theme.properties.palette.properties.surface.$ref,
    ).toBe("#/$defs/paletteColor");
    expect(() =>
      normalizeDocsConfig({
        theme: { palette: { surface: { tone: "invalid" } } },
      } as never),
    ).toThrow(/theme\.palette\.surface/);
    expect(() =>
      normalizeDocsConfig({
        theme: { palette: { text: { ton: 50 } } },
      } as never),
    ).toThrow(/theme\.palette\.text\.ton/);
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

  it("preserves component style overrides", () => {
    const config = normalizeDocsConfig({
      theme: {
        styles: {
          MobileTableOfContents: { Link: { padding: "1x" } },
          Sidebar: { Link: { padding: "1x" } },
          StarlightHeader: { padding: "2x" },
          TableOfContents: { LinkLabel: { whiteSpace: "normal" } },
          ThemeSelect: { Panel: { padding: "2x" } },
          SocialIcons: { Link: { radius: "999px" } },
          MarkdownInlineCode: { fontSize: "0.9em" },
        },
      },
    });

    expect(config.theme.styles).toEqual({
      MobileTableOfContents: { Link: { padding: "1x" } },
      Sidebar: { Link: { padding: "1x" } },
      StarlightHeader: { padding: "2x" },
      TableOfContents: { LinkLabel: { whiteSpace: "normal" } },
      ThemeSelect: { Panel: { padding: "2x" } },
      SocialIcons: { Link: { radius: "999px" } },
      MarkdownInlineCode: { fontSize: "0.9em" },
    });
  });

  it("publishes plain component style overrides in the JSON schema", () => {
    expect(schema.properties.navigation.oneOf).toHaveLength(2);
    const componentStyle =
      schema.properties.theme.properties.styles.properties.Sidebar;
    expect(componentStyle.type).toBe("object");
    expect(componentStyle.propertyNames?.not?.const).toBe("mode");
  });

  it("preserves custom and disabled footer component overrides", () => {
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

  it("rejects the removed component style mode wrapper", () => {
    expect(() =>
      normalizeDocsConfig({
        theme: {
          styles: {
            ThemeSelect: { mode: "replace" },
          },
        },
      } as never),
    ).toThrow(/without a mode wrapper/);
  });

  it("preserves optional page links on manual and generated groups", () => {
    const navigation = [
      { label: "Guides", link: "/guides", items: ["/guide"] },
      { label: "API", link: "/reference", autogenerate: { directory: "/api" } },
    ];
    expect(normalizeDocsConfig({ navigation }).navigation.items).toEqual(
      navigation,
    );
  });

  it.each([
    42,
    null,
    "https://example.com",
    "//example.com",
    "relative",
    "/page#heading",
    "/page?query",
    "/../page",
    "/page/./child",
    "/page//child",
    "/page with spaces",
    "/page\\child",
  ])("rejects invalid parent page links at any depth: %j", (link) => {
    expect(() =>
      normalizeDocsConfig({
        navigation: {
          tabs: [
            {
              label: "Guide",
              link: "/",
              items: [
                {
                  label: "Outer",
                  items: [
                    {
                      label: "Parent",
                      link,
                      autogenerate: { directory: "/" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      } as never),
    ).toThrow(".link must be a root-relative page route");
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
