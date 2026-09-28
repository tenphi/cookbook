import type {
  FontLoadingConfig,
  ThemeFonts,
  ThemeFont,
  TypographyPreset,
} from "@tenphi/docs";
import { fontFamilies, type ResolvedFontFace } from "./fonts.js";
import { resolveTypographyPresets } from "./defaults.js";
import { createFontFetcher, fontHash } from "./font-cache.js";

export interface FontAsset {
  publicPath: string;
  outputPath: string;
  contentType: string;
  body: Buffer;
}
type Weight = number | `${number} ${number}`;
type Span = [number, number];
type Options = {
  base?: string;
  cacheDir?: string;
  loading?: FontLoadingConfig;
  presets?: Record<string, TypographyPreset>;
  fetch?: typeof fetch;
  warn?: (message: string) => void;
};

/** Merge overlapping/touching ranges, as required by the Google CSS2 API. */
export function fontWeightSpans(weights: Weight[]): Span[] {
  const spans = weights
    .map((weight): Span =>
      typeof weight === "number"
        ? [weight, weight]
        : (weight.split(" ").map(Number) as Span),
    )
    .sort((a, b) => a[0] - b[0]);
  return spans.reduce<Span[]>((result, span) => {
    const previous = result.at(-1);
    if (previous && span[0] <= previous[1])
      previous[1] = Math.max(previous[1], span[1]);
    else result.push([...span]);
    return result;
  }, []);
}

function presetWeights(
  family: string,
  presets: Record<string, TypographyPreset>,
): number[] {
  const resolveValue = (value: unknown, seen = new Set<string>()): unknown => {
    if (typeof value !== "string") return value;
    const ref =
      /^var\(--(.+)-(font-family|bold-font-weight|font-weight)\)$/.exec(value);
    if (!ref || seen.has(value)) return value;
    seen.add(value);
    const key =
      ref[2] === "font-family"
        ? "fontFamily"
        : ref[2] === "font-weight"
          ? "fontWeight"
          : "boldFontWeight";
    return resolveValue(presets[ref[1]!]?.[key], seen);
  };
  const values = Object.values(presets)
    .flatMap((preset) => {
      const resolvedFamily = resolveValue(preset.fontFamily);
      if (
        typeof resolvedFamily !== "string" ||
        resolvedFamily
          .split(",")[0]
          ?.trim()
          .replace(/^['"]|['"]$/g, "") !== family
      )
        return [];
      return [
        resolveValue(preset.fontWeight),
        resolveValue(preset.boldFontWeight),
      ];
    })
    .map((value) =>
      value === "bold" ? 700 : value === "normal" ? 400 : Number(value),
    )
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 1000);
  return [...new Set(values.length ? values : [400, 700])];
}

/** Resolve CSS and optional font assets before rendering; all faces are emitted by Tasty. */
export async function resolveThemeFonts(
  fonts: ThemeFonts = {},
  options: Options = {},
): Promise<{ faces: ResolvedFontFace[]; assets: FontAsset[] }> {
  const base = (options.base ?? "/").replace(/\/$/, "");
  const loading = options.loading ?? {};
  const download = createFontFetcher(
    options.cacheDir,
    loading.cache,
    options.fetch,
  );
  const presets =
    options.presets ?? resolveTypographyPresets({}, fontFamilies(fonts));
  const faces: ResolvedFontFace[] = [];
  const assets = new Map<string, FontAsset>();
  const google = new Map<
    string,
    { explicit: Map<string, Weight[]>; inferred: Map<string, number[]> }
  >();
  for (const font of Object.values(fonts).filter(
    (font): font is ThemeFont => font !== undefined,
  )) {
    if (typeof font === "string" || "google" in font) {
      const family = typeof font === "string" ? font : font.google;
      const requested = google.get(family) ?? {
        explicit: new Map(),
        inferred: new Map(),
      };
      const weights = typeof font === "string" ? undefined : font.weights;
      const styles =
        typeof font === "string"
          ? ["normal", "italic"]
          : (font.styles ?? ["normal", "italic"]);
      for (const style of styles) {
        if (weights)
          requested.explicit.set(style, [
            ...(requested.explicit.get(style) ?? []),
            ...weights,
          ]);
        else
          requested.inferred.set(style, [
            ...(requested.inferred.get(style) ?? []),
            ...presetWeights(family, presets),
          ]);
      }
      google.set(family, requested);
    } else
      for (const file of font.files) {
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
            src: `url("${base}${file.src}") format("${format}")`,
            fontWeight: file.weight ?? 400,
            fontStyle: file.style ?? "normal",
            fontDisplay: loading.display ?? "swap",
          },
        });
      }
  }
  for (const [family, request] of google) {
    const fetchFaces = async (
      byStyle: Map<string, Weight[]>,
      strict: boolean,
    ): Promise<ResolvedFontFace[]> => {
      if (!byStyle.size) return [];
      const tuples = [...byStyle]
        .sort(([a], [b]) => (a === "normal" ? 0 : 1) - (b === "normal" ? 0 : 1))
        .flatMap(([style, weights]) =>
          fontWeightSpans(weights).map(
            ([min, max]) =>
              `${style === "italic" ? 1 : 0},${min === max ? min : `${min}..${max}`}`,
          ),
        );
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replaceAll("%20", "+")}:ital,wght@${tuples.join(";")}&display=${loading.display ?? "swap"}`;
      const response = await download(url);
      if (response.status === 400) {
        if (!strict) return [];
        throw new Error(
          `Google Fonts rejected "${family}" (400). Check theme.fonts weights/ranges/styles against the family's supported axes.`,
        );
      }
      const parsed = parseGoogleFontCss(
        response.body.toString("utf8"),
        family,
        loading.display ?? "swap",
      );
      if (!parsed.length)
        throw new Error(
          `Google Fonts returned no usable font files for "${family}".`,
        );
      if (strict) {
        for (const [style, weights] of byStyle)
          for (const [lo, hi] of fontWeightSpans(weights)) {
            const available = fontWeightSpans(
              parsed
                .filter((face) => face.descriptors.fontStyle === style)
                .map((face) =>
                  String(face.descriptors.fontWeight).includes(" ")
                    ? (String(face.descriptors.fontWeight) as Weight)
                    : Number(face.descriptors.fontWeight),
                ),
            );
            if (!available.some(([min, max]) => min <= lo && max >= hi))
              throw new Error(
                `Google Fonts did not provide ${family} ${style} weight ${lo === hi ? lo : `${lo} ${hi}`}. Choose supported theme.fonts weights/styles or use local font files.`,
              );
          }
      }
      return parsed;
    };
    const familyFaces = await fetchFaces(request.explicit, true);
    if (request.inferred.size) {
      const ranges = new Map(
        [...request.inferred].map(([style, weights]): [string, Weight[]] => [
          style,
          [
            Math.min(...weights) === Math.max(...weights)
              ? weights[0]!
              : (`${Math.min(...weights)} ${Math.max(...weights)}` as Weight),
          ],
        ]),
      );
      let inferred = await fetchFaces(ranges, false);
      if (!inferred.length) {
        // Static families can omit unavailable intermediate weights. Include the
        // two conventional neighbors so the browser can select a real face.
        const statics = new Map(
          [...request.inferred].map(([style, weights]): [string, Weight[]] => [
            style,
            [
              ...new Set(
                weights.flatMap((weight) => [
                  weight,
                  Math.max(100, Math.floor(weight / 100) * 100),
                  Math.min(900, Math.ceil(weight / 100) * 100),
                ]),
              ),
            ],
          ]),
        );
        inferred = await fetchFaces(statics, false);
        if (!inferred.length)
          throw new Error(
            `Google Fonts rejected "${family}". Check the family name or provide explicit supported theme.fonts weights/styles.`,
          );
      }
      for (const style of request.inferred.keys())
        if (!inferred.some((face) => face.descriptors.fontStyle === style))
          options.warn?.(
            `Google Font "${family}" has no ${style} face for these presets. Choose a family with that style, or set theme.fonts styles explicitly.`,
          );
      familyFaces.push(...inferred);
    }
    for (const face of familyFaces) {
      if (loading.google !== "remote") {
        const source = /url\("([^"]+)"\) format\("([^"]+)"\)/.exec(
          String(face.descriptors.src),
        )!;
        const response = await download(source[1]!);
        if (
          response.status !== 200 ||
          response.body.length < 12 ||
          ![
            "wOF2",
            "wOFF",
            "OTTO",
            "ttcf",
            "\u0000\u0001\u0000\u0000",
          ].includes(response.body.subarray(0, 4).toString("binary"))
        )
          throw new Error(
            `Could not download Google Font "${family}" from ${source[1]}.`,
          );
        const extension =
          source[2] === "truetype"
            ? "ttf"
            : source[2] === "opentype"
              ? "otf"
              : source[2];
        const outputPath = `_cookbook/fonts/${fontHash(response.body)}.${extension}`;
        const publicPath = `${base}/${outputPath}`;
        assets.set(outputPath, {
          outputPath,
          publicPath,
          body: response.body,
          contentType: `font/${extension}`,
        });
        face.descriptors.src = `url("${publicPath}") format("${source[2]}")`;
      }
      faces.push(face);
    }
  }
  return {
    faces: [
      ...new Map(faces.map((face) => [JSON.stringify(face), face])).values(),
    ],
    assets: [...assets.values()],
  };
}

function parseGoogleFontCss(
  css: string,
  family: string,
  display: NonNullable<FontLoadingConfig["display"]>,
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
      declarations["font-family"]?.replaceAll(/["']/g, "").toLowerCase() !==
        family.toLowerCase()
    )
      continue;
    faces.push({
      family,
      descriptors: {
        src: `url("${source[1]}") format("${source[2]}")`,
        fontWeight: declarations["font-weight"] ?? 400,
        fontStyle: declarations["font-style"] ?? "normal",
        fontDisplay: display,
        ...(declarations["unicode-range"]
          ? { unicodeRange: declarations["unicode-range"] }
          : {}),
      },
    });
  }
  return faces;
}
