import type { ThemeFont, ThemeFonts } from "@tenphi/docs";
import type { FontFaceDescriptors } from "@tenphi/tasty/core";

export interface ResolvedFontFace {
  family: string;
  descriptors: FontFaceDescriptors;
}

const sharedFonts = globalThis as typeof globalThis & {
  __tenphiCookbookFontFaces?: ResolvedFontFace[];
  __tenphiCookbookDefaultFontUsage?: { onest: boolean; mono: boolean };
};

const fallback = {
  body: "system-ui, sans-serif",
  heading: "system-ui, sans-serif",
  code: "ui-monospace, monospace",
} as const;

export function fontFamilies(
  fonts: ThemeFonts = {},
): Partial<Record<keyof ThemeFonts, string>> {
  return Object.fromEntries(
    (
      Object.entries(fonts).filter(([, font]) => font !== undefined) as [
        keyof ThemeFonts,
        ThemeFont,
      ][]
    ).map(([role, font]) => [
      role,
      `'${typeof font === "string" ? font : "google" in font ? font.google : font.family}', ${fallback[role]}`,
    ]),
  );
}

export function configureFontFaces(
  faces: ResolvedFontFace[],
  defaults: { onest: boolean; mono: boolean },
): void {
  sharedFonts.__tenphiCookbookFontFaces = faces;
  sharedFonts.__tenphiCookbookDefaultFontUsage = defaults;
}

export function getFontFaces(): ResolvedFontFace[] {
  return sharedFonts.__tenphiCookbookFontFaces ?? [];
}

export function getDefaultFontUsage(): { onest: boolean; mono: boolean } {
  return (
    sharedFonts.__tenphiCookbookDefaultFontUsage ?? { onest: true, mono: true }
  );
}

/** Resolve Google CSS at build time so the site emits only Tasty-generated CSS. */
export async function resolveThemeFontFaces(
  fonts: ThemeFonts = {},
  base = "/",
  fetchFontCss: typeof fetch = fetch,
): Promise<ResolvedFontFace[]> {
  const faces: ResolvedFontFace[] = [];
  const google = new Map<
    string,
    { defaultStyle: boolean; weights: Set<number> }
  >();
  for (const font of Object.values(fonts)) {
    if (!font) continue;
    if (typeof font === "string" || "google" in font) {
      const family = typeof font === "string" ? font : font.google;
      const weights: number[] | undefined =
        typeof font === "string" ? undefined : font.weights;
      const requested = google.get(family) ?? {
        defaultStyle: false,
        weights: new Set<number>(),
      };
      if (weights) weights.forEach((weight) => requested.weights.add(weight));
      else requested.defaultStyle = true;
      google.set(family, requested);
      continue;
    }
    for (const file of font.files) {
      const path = `${base.replace(/\/$/, "")}${file.src}`;
      const extension = file.src.split(".").at(-1);
      const format =
        extension === "ttf"
          ? "truetype"
          : extension === "otf"
            ? "opentype"
            : extension;
      faces.push({
        family: font.family,
        descriptors: {
          src: `url("${path}") format("${format}")`,
          fontWeight: file.weight ?? 400,
          fontStyle: file.style ?? "normal",
          fontDisplay: "swap",
        },
      });
    }
  }
  for (const [family, requested] of google) {
    const specs = [
      ...(requested.defaultStyle ? [family.replaceAll(" ", "+")] : []),
      ...(requested.weights.size
        ? [
            `${family.replaceAll(" ", "+")}:wght@${[...requested.weights].sort((a, b) => a - b).join(";")}`,
          ]
        : []),
    ];
    for (const spec of specs) {
      const url = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
      let response: Response;
      try {
        response = await fetchFontCss(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(15_000),
        });
      } catch (error) {
        throw new Error(
          `Could not load Google Font "${family}" during the Cookbook build: ${String(error)}`,
        );
      }
      if (!response.ok)
        throw new Error(
          `Google Fonts rejected "${family}" (${response.status}). Check the family name and available weights.`,
        );
      const parsed = parseGoogleFontCss(await response.text(), family);
      if (parsed.length === 0)
        throw new Error(
          `Google Fonts returned no usable font files for "${family}".`,
        );
      faces.push(...parsed);
    }
  }
  return [
    ...new Map(faces.map((face) => [JSON.stringify(face), face])).values(),
  ];
}

function parseGoogleFontCss(
  css: string,
  family: string,
): ResolvedFontFace[] {
  const faces: ResolvedFontFace[] = [];
  for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const declarations = Object.fromEntries(
      [...(block[1] ?? "").matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(
        (match) => [match[1], match[2]!.trim()],
      ),
    );
    const source = declarations.src?.match(
      /url\(['"]?(https:\/\/fonts\.gstatic\.com\/[^'"()\s]+)['"]?\)\s*format\(['"]?(woff2?|truetype|opentype)['"]?\)/,
    );
    if (
      !source ||
      declarations["font-family"]?.replaceAll(/["']/g, "") !== family
    )
      continue;
    faces.push({
      family,
      descriptors: {
        src: `url("${source[1]}") format("${source[2]}")`,
        fontWeight: declarations["font-weight"] ?? 400,
        fontStyle: declarations["font-style"] ?? "normal",
        fontDisplay: "swap",
        ...(declarations["unicode-range"]
          ? { unicodeRange: declarations["unicode-range"] }
          : {}),
      },
    });
  }
  return faces;
}
