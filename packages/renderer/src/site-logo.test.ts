import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSiteLogo } from "./site-logo.js";
const svg = (width: number, height: number, color = "blue") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`;

describe("site logo", () => {
  it("keeps the default mark and supports disabling both marks", async () => {
    expect((await resolveSiteLogo("/", "/")).logo).toBeUndefined();
    expect((await resolveSiteLogo("/", "/", { logo: false })).logo).toBe(false);
  });
  it("resolves variants with intrinsic dimensions, accessible text, stable hashes and base paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "cookbook-logo-"));
    try {
      await writeFile(join(root, "light.svg"), svg(240, 80));
      await writeFile(join(root, "dark.svg"), svg(480, 160, "white"));
      const site = {
        title: "Acme",
        logo: {
          light: "light.svg",
          dark: "dark.svg",
          alt: "Acme docs",
          href: "https://example.com",
          decorative: false,
        },
      };
      const result = await resolveSiteLogo(root, "/manual/", site);
      expect(result.logo).toMatchObject({
        light: { width: 240, height: 80 },
        dark: { width: 480, height: 160 },
        alt: "Acme docs",
        href: "https://example.com",
        decorative: false,
      });
      expect(result.assets).toHaveLength(2);
      expect(result.assets[0]!.publicPath).toMatch(
        /^\/manual\/_cookbook\/logos\/[a-f0-9]{20}\.svg$/,
      );
      expect(await resolveSiteLogo(root, "/manual/", site)).toEqual(result);
      const one = await resolveSiteLogo(root, "/", {
        title: "Acme",
        logo: { src: "light.svg", height: 40 },
      });
      expect(one.logo).toMatchObject({
        light: { width: 120, height: 40 },
        alt: "Acme",
        decorative: true,
      });
      await writeFile(join(root, "dark.svg"), svg(80, 80));
      await expect(resolveSiteLogo(root, "/", site)).rejects.toThrow(
        "same aspect ratio",
      );
      await expect(
        resolveSiteLogo(root, "/", { logo: "missing.svg" }),
      ).rejects.toThrow("cannot read local image");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
