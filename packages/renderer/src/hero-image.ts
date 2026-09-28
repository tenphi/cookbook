import { stat } from "node:fs/promises";
import { extname } from "node:path";
import sharp from "sharp";
import type { DocsEntry } from "@tenphi/docs";

const metadataCache = new Map<
  string,
  Promise<{ width: number; height: number; format: string }>
>();
export async function resolveHeroMetadata(
  entry: Pick<DocsEntry, "frontmatter" | "assets" | "sourcePath">,
) {
  const hero = entry.frontmatter.hero;
  const image = hero?.image;
  if (!hero || !image || "html" in image) return hero;
  const read = async (src: string) => {
    const asset = entry.assets.find(
      (asset) => asset.resolved === src || asset.publicPath === src,
    );
    let dimensions: { width: number; height: number; format: string };
    if (asset?.sourcePath) {
      const file = await stat(asset.sourcePath);
      const key = `${asset.sourcePath}:${file.mtimeMs}:${file.size}`;
      if (!metadataCache.has(key))
        metadataCache.set(
          key,
          sharp(asset.sourcePath)
            .metadata()
            .then((meta) => {
              const { width, height } = meta.autoOrient ?? meta;
              if (!width || !height || !meta.format)
                throw Error(
                  `Cannot determine hero image dimensions for ${entry.sourcePath}.`,
                );
              return { width, height, format: meta.format };
            }),
        );
      dimensions = await metadataCache.get(key)!;
    } else if (image.width && image.height) {
      dimensions = {
        width: image.width,
        height: image.height,
        format:
          extname(src.split(/[?#]/, 1)[0] ?? src)
            .slice(1)
            .replace("jpg", "jpeg") || "png",
      };
    } else
      throw Error(
        `Hero image ${src} in ${entry.sourcePath} needs width and height, or a relative local file whose dimensions can be read.`,
      );
    if (
      image.width &&
      image.height &&
      Math.abs(
        image.width / image.height - dimensions.width / dimensions.height,
      ) > 0.01
    )
      throw Error(
        `hero.image width/height in ${entry.sourcePath} must preserve the source aspect ratio.`,
      );
    return { src, ...dimensions };
  };
  if ("file" in image)
    return { ...hero, image: { ...image, file: await read(image.file) } };
  const [dark, light] = await Promise.all([
    read(image.dark),
    read(image.light),
  ]);
  if (Math.abs(dark.width / dark.height - light.width / light.height) > 0.01)
    throw Error(
      `Hero light/dark images in ${entry.sourcePath} must have the same aspect ratio.`,
    );
  return { ...hero, image: { ...image, dark, light } };
}
