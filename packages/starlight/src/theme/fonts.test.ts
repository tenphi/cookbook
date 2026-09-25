import { describe, expect, it, vi } from "vitest";
import { fontFamilies, resolveThemeFontFaces } from "./fonts.js";

describe("theme fonts", () => {
  it("sets semantic families and resolves local public files with the Astro base", async () => {
    expect(
      fontFamilies({
        body: "Inter",
        heading: undefined,
        code: { family: "Acme Mono", files: [{ src: "/fonts/acme.woff2" }] },
      }),
    ).toEqual({
      body: "'Inter', system-ui, sans-serif",
      code: "'Acme Mono', ui-monospace, monospace",
    });
    const faces = await resolveThemeFontFaces(
      {
        code: {
          family: "Acme Mono",
          files: [
            { src: "/fonts/acme.woff2", weight: "100 900" },
            { src: "/fonts/acme-italic.woff2", weight: 400, style: "italic" },
          ],
        },
      },
      "/guide/",
    );
    expect(faces).toMatchObject([
      {
        family: "Acme Mono",
        descriptors: {
          src: 'url("/guide/fonts/acme.woff2") format("woff2")',
          fontWeight: "100 900",
        },
      },
      {
        family: "Acme Mono",
        descriptors: { fontWeight: 400, fontStyle: "italic" },
      },
    ]);
  });

  it("resolves Google names to Tasty font faces and combines shared family weights", async () => {
    const fetchCss = vi.fn(
      async () =>
        new Response(`
      @font-face {
        font-family: 'Inter'; font-style: normal; font-weight: 400;
        src: url(https://fonts.gstatic.com/s/inter/latin.woff2) format('woff2');
        unicode-range: U+0000-00FF;
      }
    `),
    );
    const faces = await resolveThemeFontFaces(
      {
        body: "Inter",
        heading: { google: "Inter", weights: [500, 700] },
      },
      "/",
      fetchCss as typeof fetch,
    );
    expect(fetchCss).toHaveBeenCalledTimes(2);
    expect(fetchCss.mock.calls[0]?.[0]).toContain("family=Inter&display=swap");
    expect(fetchCss.mock.calls[1]?.[0]).toContain("family=Inter:wght@500;700");
    expect(faces).toEqual([
      {
        family: "Inter",
        descriptors: {
          src: 'url("https://fonts.gstatic.com/s/inter/latin.woff2") format("woff2")',
          fontWeight: "400",
          fontStyle: "normal",
          fontDisplay: "swap",
          unicodeRange: "U+0000-00FF",
        },
      },
    ]);
  });

  it("requests only the default style for a Google family name", async () => {
    const urls: string[] = [];
    await resolveThemeFontFaces({ body: "Inter" }, "/", (async (
      url: string,
    ) => {
      urls.push(url);
      return new Response(
        `@font-face { font-family: 'Inter'; font-weight: 400; src: url(https://fonts.gstatic.com/s/inter/default.woff2) format('woff2'); }`,
      );
    }) as typeof fetch);
    expect(urls).toEqual([
      "https://fonts.googleapis.com/css2?family=Inter&display=swap",
    ]);
  });

  it("reports Google family errors before rendering", async () => {
    await expect(
      resolveThemeFontFaces(
        { body: "Missing Font" },
        "/",
        async () => new Response("Bad request", { status: 400 }),
      ),
    ).rejects.toThrow(/Missing Font.*400/);
  });
});
