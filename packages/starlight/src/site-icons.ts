import { readFile } from "node:fs/promises";
import { extname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { HeadConfig, SiteConfig } from "@tenphi/docs";
import sharp from "sharp";

const ICON_DIRECTORY = "_cookbook/icons";
const DEFAULT_ICON_BACKGROUND = "#315efb";
const SUPPORTED_SOURCE_FORMATS = new Set([
  "avif",
  "gif",
  "heif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
]);

interface SiteIconAsset {
  body: Buffer;
  contentType: string;
  outputPath: string;
  publicPath: string;
}

export interface SiteIconSet {
  assets: SiteIconAsset[];
  faviconPath: string;
  head: HeadConfig[];
  sourcePath: string;
}

interface SiteIconOptions {
  base: string;
  root: string;
  site?: SiteConfig;
  themeColors: {
    dark: string;
    light: string;
  };
}

export async function createSiteIcons({
  base,
  root,
  site = {},
  themeColors,
}: SiteIconOptions): Promise<SiteIconSet> {
  const configured = site.favicon;
  const source =
    typeof configured === "string" ? configured : configured?.source;
  const sourcePath = source
    ? resolveSourcePath(source, root)
    : fileURLToPath(new URL("./icons/favicon.svg", import.meta.url));
  const background =
    typeof configured === "object" && configured?.background
      ? configured.background
      : DEFAULT_ICON_BACKGROUND;
  const input = await readFile(sourcePath).catch((error: unknown) => {
    throw new Error(
      `Unable to read site.favicon source at ${sourcePath}: ${errorMessage(error)}`,
    );
  });
  const metadata = await sharp(input, { animated: false }).metadata();
  const format = metadata.format?.toLowerCase();
  if (!format || !SUPPORTED_SOURCE_FORMATS.has(format)) {
    throw new Error(
      "site.favicon must point to an SVG, PNG, JPEG, WebP, AVIF, or GIF image.",
    );
  }

  const definitions = [
    await pngAsset(input, base, "favicon-32x32.png", 32),
    await safePngAsset(input, base, "apple-touch-icon.png", 180, background),
    await pngAsset(input, base, "icon-192x192.png", 192),
    await pngAsset(input, base, "icon-512x512.png", 512),
    await safePngAsset(
      input,
      base,
      "icon-192x192-maskable.png",
      192,
      background,
    ),
    await safePngAsset(
      input,
      base,
      "icon-512x512-maskable.png",
      512,
      background,
    ),
  ];

  const scalable =
    format === "svg"
      ? asset(base, "favicon.svg", input, "image/svg+xml")
      : undefined;
  const faviconPath = `/${ICON_DIRECTORY}/${scalable ? "favicon.svg" : "favicon-32x32.png"}`;
  const iconEntries = [
    {
      src: pathWithBase(base, `/${ICON_DIRECTORY}/icon-192x192.png`),
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: pathWithBase(base, `/${ICON_DIRECTORY}/icon-512x512.png`),
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: pathWithBase(base, `/${ICON_DIRECTORY}/icon-192x192-maskable.png`),
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: pathWithBase(base, `/${ICON_DIRECTORY}/icon-512x512-maskable.png`),
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
    ...(scalable
      ? [
          {
            src: scalable.publicPath,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ]
      : []),
  ];
  const manifest = asset(
    base,
    "site.webmanifest",
    Buffer.from(
      `${JSON.stringify(
        {
          name: site.title ?? "Documentation",
          short_name: site.title ?? "Documentation",
          ...(site.description ? { description: site.description } : {}),
          id: normalizedBase(base),
          start_url: normalizedBase(base),
          scope: normalizedBase(base),
          display: "standalone",
          background_color: background,
          theme_color: themeColors.light,
          icons: iconEntries,
        },
        null,
        2,
      )}\n`,
    ),
    "application/manifest+json",
  );
  const favicon32 = definitions[0];
  const appleTouchIcon = definitions[1];
  if (!favicon32 || !appleTouchIcon) {
    throw new Error("Cookbook failed to generate the required site icons.");
  }

  return {
    assets: [...definitions, ...(scalable ? [scalable] : []), manifest],
    faviconPath,
    head: [
      {
        tag: "link",
        attrs: {
          rel: "icon",
          href: favicon32.publicPath,
          sizes: "32x32",
          type: favicon32.contentType,
        },
      },
      ...(scalable
        ? [
            {
              tag: "link",
              attrs: {
                rel: "icon",
                href: scalable.publicPath,
                sizes: "any",
                type: scalable.contentType,
              },
            } satisfies HeadConfig,
          ]
        : []),
      {
        tag: "link",
        attrs: {
          rel: "apple-touch-icon",
          href: appleTouchIcon.publicPath,
          sizes: "180x180",
        },
      },
      {
        tag: "link",
        attrs: { rel: "manifest", href: manifest.publicPath },
      },
      {
        tag: "meta",
        attrs: {
          name: "theme-color",
          content: themeColors.light,
          media: "(prefers-color-scheme: light)",
        },
      },
      {
        tag: "meta",
        attrs: {
          name: "theme-color",
          content: themeColors.dark,
          media: "(prefers-color-scheme: dark)",
        },
      },
    ],
    sourcePath,
  };
}

async function pngAsset(
  input: Buffer,
  base: string,
  name: string,
  size: number,
): Promise<SiteIconAsset> {
  const body = await sharp(input, { animated: false, density: 512 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return asset(base, name, body, "image/png");
}

async function safePngAsset(
  input: Buffer,
  base: string,
  name: string,
  size: number,
  background: string,
): Promise<SiteIconAsset> {
  const safeSize = Math.round(size * 0.8);
  const foreground = await sharp(input, { animated: false, density: 512 })
    .resize(safeSize, safeSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const body = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: foreground, gravity: "center" }])
    .png()
    .toBuffer()
    .catch((error: unknown) => {
      throw new Error(
        `Unable to use site.favicon.background ${JSON.stringify(background)}: ${errorMessage(error)}`,
      );
    });
  return asset(base, name, body, "image/png");
}

function asset(
  base: string,
  name: string,
  body: Buffer,
  contentType: string,
): SiteIconAsset {
  const outputPath = `${ICON_DIRECTORY}/${name}`;
  return {
    body,
    contentType,
    outputPath,
    publicPath: pathWithBase(base, `/${outputPath}`),
  };
}

function resolveSourcePath(source: string, root: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(source)) {
    throw new Error("site.favicon must reference a local image path.");
  }
  return isAbsolute(source) ? source : resolve(root, source);
}

function pathWithBase(base: string, pathname: string): string {
  const prefix = normalizedBase(base);
  return `${prefix === "/" ? "" : prefix.replace(/\/$/, "")}${pathname}`;
}

function normalizedBase(base: string): string {
  const value = base.replace(/^\/+|\/+$/g, "");
  return value ? `/${value}/` : "/";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
