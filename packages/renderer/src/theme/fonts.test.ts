import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { fontFamilies } from "./fonts.js";
import { fontWeightSpans, resolveThemeFonts } from "./font-loading.js";
import { resolveTypographyPresets } from "./defaults.js";

function css(family: string, weight: string, style = "normal") {
  return `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight}; src: url(https://fonts.gstatic.com/s/test/${style}.woff2) format('woff2'); unicode-range: U+0000-00FF; }`;
}
const mockGoogle = async (input: string | URL | Request) => {
  const url = String(input);
  if (url.startsWith("https://fonts.gstatic.com"))
    return new Response(`wOF2${url}`);
  const spec = new URL(url).searchParams.get("family")!;
  const [family, axes] = spec.split(":");
  return new Response(
    axes!
      .split("@")[1]!
      .split(";")
      .map((tuple) => {
        const [style, weight] = tuple.split(",");
        return css(
          family!,
          weight!.replace("..", " "),
          style === "1" ? "italic" : "normal",
        );
      })
      .join("\n"),
  );
};

describe("theme fonts", () => {
  it("keeps local files, ranges, italics and base paths without network", async () => {
    const fonts = {
      code: {
        family: "Acme Mono",
        files: [
          { src: "/fonts/acme.woff2", weight: "100 900" as const },
          {
            src: "/fonts/acme-italic.woff2",
            weight: 400,
            style: "italic" as const,
          },
        ],
      },
    };
    expect(fontFamilies({ body: "Inter", ...fonts })).toEqual({
      body: "'Inter', system-ui, sans-serif",
      code: "'Acme Mono', ui-monospace, monospace",
    });
    const fetch = vi.fn();
    const result = await resolveThemeFonts(fonts, {
      base: "/guide/",
      loading: { display: "optional" },
      fetch,
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(result.assets).toEqual([]);
    expect(result.faces).toMatchObject([
      {
        family: "Acme Mono",
        descriptors: {
          src: 'url("/guide/fonts/acme.woff2") format("woff2")',
          fontWeight: "100 900",
          fontDisplay: "optional",
        },
      },
      { descriptors: { fontWeight: 400, fontStyle: "italic" } },
    ]);
  });

  it("infers shorthand weights through preset references, strong modifiers and custom presets", async () => {
    const fonts = { body: "Inter", heading: "Inter" };
    const fetch = vi.fn(mockGoogle);
    const presets = resolveTypographyPresets(
      {
        special: { fontFamily: "var(--heading-font-family)", fontWeight: 810 },
      },
      fontFamilies(fonts),
    );
    const result = await resolveThemeFonts(fonts, {
      base: "/manual/",
      presets,
      fetch,
    });
    expect(fetch.mock.calls[0]?.[0]).toContain(
      "family=Inter:ital,wght@0,400..810;1,400..810",
    );
    expect(fetch).toHaveBeenCalledTimes(3); // one CSS request, two unique binary files
    expect(result.faces).toHaveLength(2);
    expect(result.faces[0]!.descriptors).toMatchObject({
      fontWeight: "400 810",
      unicodeRange: "U+0000-00FF",
      fontDisplay: "swap",
    });
    expect(result.faces[0]!.descriptors.src).toMatch(
      /^url\("\/manual\/_cookbook\/fonts\/[a-f0-9]{64}\.woff2/,
    );
    expect(result.assets).toHaveLength(2);
  });

  it("merges explicit overlapping ranges and styles into valid sorted tuples", async () => {
    expect(fontWeightSpans([400, "500 800", "300 500", 900])).toEqual([
      [300, 800],
      [900, 900],
    ]);
    const fetch = vi.fn(mockGoogle);
    await resolveThemeFonts(
      {
        body: {
          google: "Inter",
          weights: ["300 700", 400],
          styles: ["italic", "normal"],
        },
        heading: { google: "Inter", weights: ["650 850"], styles: ["normal"] },
      },
      { loading: { google: "remote" }, fetch },
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0]?.[0]).toContain(
      "ital,wght@0,300..850;1,300..700",
    );
  });

  it("falls back from variable ranges to real static neighboring weights", async () => {
    const fetch = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("..")
        ? new Response("unsupported range", { status: 400 })
        : new Response(
            css("Lato", "400") +
              css("Lato", "700") +
              css("Lato", "400", "italic") +
              css("Lato", "700", "italic"),
          ),
    );
    const result = await resolveThemeFonts(
      { body: "Lato" },
      { fetch, loading: { google: "remote" } },
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]?.[0]).toContain("0,600;0,640;0,700");
    expect(result.faces).toHaveLength(4);
  });

  it("rejects explicit missing styles or weights even when Google silently omits them", async () => {
    await expect(
      resolveThemeFonts(
        { body: { google: "Lato", weights: [610], styles: ["normal"] } },
        {
          fetch: async () => new Response(css("Lato", "400")),
          loading: { google: "remote" },
        },
      ),
    ).rejects.toThrow("did not provide Lato normal weight 610");
    await expect(
      resolveThemeFonts(
        { body: { google: "Missing", weights: [400] } },
        { fetch: async () => new Response("Bad request", { status: 400 }) },
      ),
    ).rejects.toThrow(/Missing.*400/);
  });

  it("reuses verified cached CSS and assets for an identical offline build; refresh fetches anew", async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), "cookbook-fonts-"));
    try {
      const fetch = vi.fn(mockGoogle);
      const online = await resolveThemeFonts(
        { body: "Inter" },
        { cacheDir, fetch },
      );
      const failNetwork = vi.fn(async () => {
        throw new Error("network forbidden");
      });
      const offline = await resolveThemeFonts(
        { body: "Inter" },
        { cacheDir, fetch: failNetwork, loading: { cache: "offline" } },
      );
      expect(offline).toEqual(online);
      expect(failNetwork).not.toHaveBeenCalled();
      await resolveThemeFonts(
        { body: "Inter" },
        { cacheDir, fetch, loading: { cache: "refresh" } },
      );
      expect(fetch).toHaveBeenCalledTimes(6);
      const entries = await readdir(cacheDir);
      const path = join(cacheDir, entries[0]!);
      const cached = JSON.parse(await readFile(path, "utf8"));
      await writeFile(path, JSON.stringify({ ...cached, body: "corrupted" }));
      await expect(
        resolveThemeFonts(
          { body: "Inter" },
          { cacheDir, fetch: failNetwork, loading: { cache: "offline" } },
        ),
      ).rejects.toThrow("cache is missing or corrupt");
    } finally {
      await rm(cacheDir, { recursive: true, force: true });
    }
  });

  it("keeps remote delivery opt-in and reports unavailable italic faces", async () => {
    const warn = vi.fn();
    const result = await resolveThemeFonts(
      { body: "No Italics" },
      {
        fetch: async () => new Response(css("No Italics", "400 700")),
        warn,
        loading: { google: "remote" },
      },
    );
    expect(result.assets).toHaveLength(0);
    expect(result.faces[0]!.descriptors.src).toContain(
      "https://fonts.gstatic.com/",
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("no italic face"),
    );
  });
});
