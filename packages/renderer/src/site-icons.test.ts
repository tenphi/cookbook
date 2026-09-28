import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import { createSiteIcons } from "./site-icons.js";

const temporaryDirectories: string[] = [];
const themeColors = {
  light: "oklch(0.99 0 0)",
  dark: "oklch(0.2 0 0)",
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { force: true, recursive: true })),
  );
});

describe("site icons", () => {
  it("generates a modern default icon set from the Cookbook logo", async () => {
    const root = await temporaryRoot();
    const result = await createSiteIcons({ base: "/", root, themeColors });

    expect(result.faviconPath).toBe("/_cookbook/icons/favicon.svg");
    expect(result.assets.map(({ outputPath }) => outputPath)).toEqual([
      "_cookbook/icons/favicon-32x32.png",
      "_cookbook/icons/apple-touch-icon.png",
      "_cookbook/icons/icon-192x192.png",
      "_cookbook/icons/icon-512x512.png",
      "_cookbook/icons/icon-192x192-maskable.png",
      "_cookbook/icons/icon-512x512-maskable.png",
      "_cookbook/icons/favicon.svg",
      "_cookbook/icons/site.webmanifest",
    ]);
    expect(result.head).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tag: "link",
          attrs: expect.objectContaining({
            rel: "apple-touch-icon",
            sizes: "180x180",
          }),
        }),
        expect.objectContaining({
          tag: "link",
          attrs: expect.objectContaining({ rel: "manifest" }),
        }),
        expect.objectContaining({
          tag: "meta",
          attrs: expect.objectContaining({
            name: "theme-color",
            media: "(prefers-color-scheme: dark)",
          }),
        }),
      ]),
    );
  });

  it("respects the base path and custom source artwork", async () => {
    const root = await temporaryRoot();
    await writeFile(
      join(root, "brand.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="100" height="50" fill="#fff"/></svg>',
    );
    const result = await createSiteIcons({
      base: "/docs/",
      root,
      site: {
        title: "Example",
        description: "Example documentation",
        favicon: { source: "brand.svg", background: "#123456" },
      },
      themeColors,
    });
    const manifestAsset = result.assets.find(({ outputPath }) =>
      outputPath.endsWith("site.webmanifest"),
    );
    const manifest = JSON.parse(manifestAsset?.body.toString() ?? "{}") as {
      background_color?: string;
      icons?: Array<{ src: string; purpose: string }>;
      start_url?: string;
    };

    expect(result.head).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attrs: expect.objectContaining({
            href: "/docs/_cookbook/icons/favicon.svg",
          }),
        }),
      ]),
    );
    expect(manifest.start_url).toBe("/docs/");
    expect(manifest.background_color).toBe("#123456");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/docs/_cookbook/icons/icon-512x512-maskable.png",
          purpose: "maskable",
        }),
      ]),
    );
    const appleIcon = result.assets.find(({ outputPath }) =>
      outputPath.endsWith("apple-touch-icon.png"),
    );
    await expect(sharp(appleIcon?.body).metadata()).resolves.toMatchObject({
      width: 180,
      height: 180,
      format: "png",
    });
  });

  it("uses a PNG fallback when the source is not scalable", async () => {
    const root = await temporaryRoot();
    await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: "#abcdef",
      },
    })
      .png()
      .toFile(join(root, "brand.png"));

    const result = await createSiteIcons({
      base: "/",
      root,
      site: { favicon: "brand.png" },
      themeColors,
    });

    expect(result.faviconPath).toBe("/_cookbook/icons/favicon-32x32.png");
    expect(result.assets).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          outputPath: expect.stringMatching(/\.svg$/),
        }),
      ]),
    );
  });

  it("rejects remote and missing source paths", async () => {
    const root = await temporaryRoot();
    await expect(
      createSiteIcons({
        base: "/",
        root,
        site: { favicon: "https://example.com/icon.svg" },
        themeColors,
      }),
    ).rejects.toThrow(/local image path/);
    await expect(
      createSiteIcons({
        base: "/",
        root,
        site: { favicon: "missing.svg" },
        themeColors,
      }),
    ).rejects.toThrow(/Unable to read site\.favicon source/);
  });
});

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "cookbook-icons-"));
  temporaryDirectories.push(root);
  return root;
}
