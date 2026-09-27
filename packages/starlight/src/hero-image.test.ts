import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { resolveHeroMetadata } from "./hero-image.js";
it("reads non-square dimensions, checks variants and requires remote dimensions", async () => {
  const root = await mkdtemp(join(tmpdir(), "hero-"));
  try {
    const sourcePath = join(root, "hero.svg");
    await writeFile(
      sourcePath,
      '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"/>',
    );
    const entry = {
      sourcePath: "index.md",
      assets: [{ sourcePath, resolved: "/hero.svg" }],
      frontmatter: { hero: { image: { file: "/hero.svg", alt: "Preview" } } },
    };
    expect(await resolveHeroMetadata(entry as never)).toMatchObject({
      image: { file: { width: 720, height: 240 } },
    });
    await expect(
      resolveHeroMetadata({ ...entry, assets: [] } as never),
    ).rejects.toThrow("needs width and height");
    const remote = {
      ...entry,
      assets: [],
      frontmatter: {
        hero: {
          image: {
            file: "https://example.com/hero.png",
            width: 720,
            height: 240,
          },
        },
      },
    };
    expect(await resolveHeroMetadata(remote)).toMatchObject({
      image: { file: { width: 720, height: 240 } },
    });
    await expect(
      resolveHeroMetadata({
        ...entry,
        frontmatter: {
          hero: { image: { file: "/hero.svg", width: 400, height: 400 } },
        },
      } as never),
    ).rejects.toThrow("aspect ratio");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
