import { describe, expect, it } from "vitest";
import { pagePublishing, routeVersion, validateSeo } from "./publishing.js";
import { defineDocsConfig, mergeDocsConfig } from "./config/index.js";

const page = { route: "/guide", title: "Guide", frontmatter: {} };
describe("publishing policy", () => {
  it("deduplicates titles and supports templates/full page titles", () => {
    expect(
      pagePublishing(
        { ...page, title: "Cookbook" },
        { site: { title: "Cookbook" } },
      ).title,
    ).toBe("Cookbook");
    expect(
      pagePublishing(page, {
        site: { title: "Acme", seo: { titleTemplate: "{title} — {site}" } },
      }).title,
    ).toBe("Guide — Acme");
    expect(
      pagePublishing(
        { ...page, frontmatter: { seo: { title: "Standalone" } } },
        { site: { title: "Acme" } },
      ).title,
    ).toBe("Standalone");
  });
  it("keeps navigation distinct from index and canonical eligibility", () => {
    expect(
      pagePublishing(page, {
        site: { url: "https://example.com" },
        build: { base: "/manual/" },
      }),
    ).toMatchObject({
      canonical: "https://example.com/manual/guide/",
      sitemap: true,
      index: true,
    });
    expect(
      pagePublishing(
        {
          ...page,
          frontmatter: { seo: { canonical: "https://elsewhere.com/guide" } },
        },
        { site: { url: "https://example.com" } },
      ),
    ).toMatchObject({ sitemap: false, index: true });
    for (const frontmatter of [{ draft: true }, { seo: { index: false } }])
      expect(pagePublishing({ ...page, frontmatter }, {}).index).toBe(false);
    expect(
      pagePublishing(
        { ...page, frontmatter: { seo: { index: true } } },
        { site: { seo: { index: false } } },
      ).index,
    ).toBe(false);
  });
  it("selects the most specific version after the locale prefix", () => {
    const config = {
      site: {
        versions: [
          { label: "Current", routeBase: "/" },
          { label: "v1", routeBase: "/v1", index: false },
        ],
      },
      locales: { fr: { label: "Français" } },
    };
    expect(routeVersion("/fr/v1/guide", config)?.label).toBe("v1");
    expect(
      pagePublishing({ ...page, route: "/fr/v1/guide" }, config).index,
    ).toBe(false);
    expect(pagePublishing({ ...page, route: "/v10/guide" }, config).index).toBe(
      true,
    );
  });
  it.each([
    { canonical: "javascript:alert(1)" },
    { canonical: "https://example.com/#part" },
    { image: { src: "//example.com/a.png", alt: "Bad" } },
    { image: { src: "/a.png", alt: "", width: 3 } },
    { breadcrumbs: [{ name: "only", url: "https://example.com" }] },
    { index: "no" },
  ])("rejects invalid page publishing metadata", (value) =>
    expect(validateSeo(value, "page").length).toBeGreaterThan(0),
  );
  it("validates site settings and replaces image definitions across layers", () => {
    expect(() =>
      defineDocsConfig({ site: { seo: { titleTemplate: "{site}" } } }),
    ).toThrow("{title}");
    expect(() =>
      defineDocsConfig({
        site: {
          versions: [
            { label: "A", routeBase: "/" },
            { label: "B", routeBase: "/v1", index: "no" as never },
          ],
        },
      }),
    ).toThrow("index must");
    expect(
      mergeDocsConfig(
        {
          site: {
            seo: {
              image: { src: "/old.png", alt: "Old", width: 400, height: 200 },
            },
          },
        },
        { site: { seo: { image: { src: "/new.png", alt: "New" } } } },
      ).site?.seo?.image,
    ).toEqual({ src: "/new.png", alt: "New" });
  });
});
