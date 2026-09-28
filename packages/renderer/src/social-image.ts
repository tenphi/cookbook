import type { SiteConfig, SocialImage } from "@tenphi/docs";
import { glaze } from "@tenphi/glaze";
import sharp from "sharp";
import type { ResolvedDocsTheme } from "./theme/index.js";

const OUTPUT_PATH = "_cookbook/social-preview.png";
const WIDTH = 1200;
const HEIGHT = 630;

export interface GeneratedSocialImage {
  body: Buffer;
  contentType: "image/png";
  image: SocialImage;
  outputPath: string;
  publicPath: string;
}

/** Create a static, theme-aware fallback for pages without a configured image. */
export async function createDefaultSocialImage(
  site: SiteConfig,
  base: string,
  colors: ResolvedDocsTheme["colors"],
): Promise<GeneratedSocialImage> {
  const title = compact(site.title) || "Documentation";
  const description = compact(site.description);
  const origin = site.url ? new URL(site.url).host : "";
  const surface = toHex(colors.surface.light);
  const heading = toHex(colors.heading.light);
  const soft = toHex(colors.textSoft.light);
  const accent = toHex(colors.accentText.light);
  const accentSurface = toHex(colors.accentSurface.light);

  const artwork = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${surface}"/>
      <rect width="14" height="${HEIGHT}" fill="${accent}"/>
      <rect x="986" y="76" width="128" height="128" rx="28" fill="${accentSurface}"/>
      <path d="M1016 112c17-3 30 1 35 7v54c-6-7-17-10-35-8zm68 0c-17-3-30 1-35 7v54c6-7 17-10 35-8z" fill="${surface}"/>
      <rect x="88" y="529" width="1024" height="2" fill="${accentSurface}"/>
    </svg>`,
  );
  const overlays = [
    {
      input: await textImage("DOCUMENTATION", "Sans Bold 23", accent, 430, 36),
      left: 88,
      top: 94,
    },
    {
      input: await textImage(title, "Sans Bold 75", heading, 1010, 220),
      left: 88,
      top: 202,
    },
    ...(description
      ? [
          {
            input: await textImage(
              truncate(description, 140),
              "Sans 31",
              soft,
              1010,
              86,
            ),
            left: 90,
            top: 425,
          },
        ]
      : []),
    ...(origin
      ? [
          {
            input: await textImage(origin, "Sans 24", soft, 1020, 42),
            left: 89,
            top: 555,
          },
        ]
      : []),
  ];
  const body = await sharp(artwork).composite(overlays).png().toBuffer();
  return {
    body,
    contentType: "image/png",
    image: {
      src: `/${OUTPUT_PATH}`,
      alt: `Preview card for ${title}`,
      width: WIDTH,
      height: HEIGHT,
    },
    outputPath: OUTPUT_PATH,
    publicPath: `${base.replace(/\/$/, "")}/${OUTPUT_PATH}`,
  };
}

async function textImage(
  value: string,
  font: string,
  color: string,
  width: number,
  height: number,
): Promise<Buffer> {
  const body = await sharp({
    text: {
      text: `<span foreground="${color}">${escapeMarkup(value)}</span>`,
      font,
      width,
      wrap: "word-char",
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  return sharp(body)
    .resize({ height, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}

function compact(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function truncate(value: string, limit: number): string {
  const characters = Array.from(value);
  return characters.length > limit
    ? `${characters
        .slice(0, limit - 1)
        .join("")
        .trimEnd()}…`
    : value;
}

function escapeMarkup(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Raster renderers need sRGB values; the site theme itself remains Glaze-authored. */
function toHex(color: string | undefined): string {
  if (!color)
    throw new Error("Cookbook could not resolve the social preview colors.");
  const rgb = glaze
    .color(color)
    .json({ format: "rgb" })
    .light?.match(/^rgb\((\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)\)$/);
  if (!rgb) throw new Error(`Cannot rasterize theme color ${color}.`);
  return `#${rgb
    .slice(1)
    .map((channel) => Math.round(Number(channel)).toString(16).padStart(2, "0"))
    .join("")}`;
}
