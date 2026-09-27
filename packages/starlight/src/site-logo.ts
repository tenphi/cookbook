import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import type { SiteConfig } from "@tenphi/docs";

interface LogoImage {
  src: string;
  width: number;
  height: number;
}
interface ResolvedSiteLogo {
  light: LogoImage;
  dark?: LogoImage;
  alt: string;
  href?: string;
  decorative: boolean;
}
export interface SiteLogoSet {
  logo: ResolvedSiteLogo | false | undefined;
  sourcePaths: string[];
  assets: Array<{
    body: Buffer;
    contentType: string;
    outputPath: string;
    publicPath: string;
  }>;
}

export async function resolveSiteLogo(
  root: string,
  base: string,
  site: SiteConfig = {},
): Promise<SiteLogoSet> {
  if (site.logo === undefined || site.logo === false)
    return { logo: site.logo, sourcePaths: [], assets: [] };
  const config = typeof site.logo === "string" ? { src: site.logo } : site.logo;
  const assets: SiteLogoSet["assets"] = [];
  const sourcePaths: string[] = [];
  const image = async (source: string, role: string): Promise<LogoImage> => {
    const path = resolve(root, source);
    const body = await readFile(path).catch(() => {
      throw new Error(`site.logo.${role}: cannot read local image ${path}.`);
    });
    const metadata = await sharp(body, { animated: false })
      .metadata()
      .catch(() => {
        throw new Error(`site.logo.${role}: ${path} is not a supported image.`);
      });
    const format = metadata.format;
    if (
      !format ||
      !["svg", "png", "jpeg", "webp", "avif", "gif"].includes(format)
    )
      throw new Error(
        `site.logo.${role}: use an SVG, PNG, JPEG, WebP, AVIF, or GIF image.`,
      );
    const width =
      config.width ??
      (config.height && metadata.width && metadata.height
        ? (config.height * metadata.width) / metadata.height
        : metadata.width);
    const height =
      config.height ??
      (config.width && metadata.width && metadata.height
        ? (config.width * metadata.height) / metadata.width
        : metadata.height);
    if (!width || !height)
      throw new Error(
        `site.logo.${role}: provide intrinsic width and height for ${path}.`,
      );
    const hash = createHash("sha256").update(body).digest("hex").slice(0, 20);
    const outputPath = `_cookbook/logos/${hash}.${format === "jpeg" ? "jpg" : format}`;
    const publicPath = `${base.replace(/\/$/, "")}/${outputPath}`;
    sourcePaths.push(path);
    if (!assets.some((asset) => asset.outputPath === outputPath))
      assets.push({
        body,
        outputPath,
        publicPath,
        contentType: format === "svg" ? "image/svg+xml" : `image/${format}`,
      });
    return { src: publicPath, width, height };
  };
  const light = await image(
    config.src ?? config.light!,
    config.src ? "src" : "light",
  );
  const dark = config.dark ? await image(config.dark, "dark") : undefined;
  if (
    dark &&
    Math.abs(light.width / light.height - dark.width / dark.height) > 0.01
  )
    throw new Error(
      "site.logo: light and dark variants must have the same aspect ratio to prevent layout shifts. Set matching intrinsic dimensions or use matching artwork.",
    );
  return {
    logo: {
      light,
      ...(dark ? { dark } : {}),
      alt: config.alt || site.title || "Documentation",
      decorative: config.decorative ?? true,
      ...(config.href ? { href: config.href } : {}),
    },
    assets,
    sourcePaths,
  };
}
