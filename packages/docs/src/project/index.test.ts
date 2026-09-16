import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveDocsProject } from "./index.js";
import { mergeDocsConfig } from "../config/index.js";
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "cookbook-project-"));
  roots.push(root);
  return root;
}
describe("project resolution", () => {
  it("discovers configuration and resolves the content root from its directory", async () => {
    const root = await fixture();
    await mkdir(join(root, "site"));
    await writeFile(
      join(root, "site/docs.config.ts"),
      'export default { root: "..", site: { title: "Repository" } };',
    );
    const project = await resolveDocsProject({ root: join(root, "site") });
    expect(project.root).toBe(root);
    expect(project.config.site?.title).toBe("Repository");
    expect(project.configFile).toBe(join(root, "site/docs.config.ts"));
  });
  it("supports explicit config paths and rejects missing paths", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "manual.mjs"),
      'export default { site: { title: "Manual" } };',
    );
    expect(
      (await resolveDocsProject({ root, configFile: "manual.mjs" })).config.site
        ?.title,
    ).toBe("Manual");
    await expect(
      resolveDocsProject({ root, configFile: "missing.ts" }),
    ).rejects.toThrow(/does not exist/);
  });
  it.each(["ts", "mjs"])(
    "reloads changed %s configuration",
    async (extension) => {
      const root = await fixture();
      const path = join(root, `docs.config.${extension}`);
      await writeFile(path, 'export default { site: { title: "Before" } };');
      expect((await resolveDocsProject({ root })).config.site?.title).toBe(
        "Before",
      );
      await writeFile(path, 'export default { site: { title: "After" } };');
      expect((await resolveDocsProject({ root })).config.site?.title).toBe(
        "After",
      );
    },
  );
  it("gives inline configuration precedence and can disable discovery", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "docs.config.mjs"),
      'throw new Error("must not load");',
    );
    expect(
      (
        await resolveDocsProject({
          root,
          config: { site: { title: "Inline" } },
        })
      ).config.site?.title,
    ).toBe("Inline");
    expect(
      (await resolveDocsProject({ root, configFile: false })).config,
    ).toEqual({});
  });
  it("composes presets without mutating them; source arrays replace", () => {
    const preset = {
      site: { title: "Base", description: "Shared" },
      content: { sources: [{ file: "README.md" }] },
      theme: { styles: { Sidebar: { LinkLabel: { whiteSpace: "normal" } } } },
    } as const;
    const result = mergeDocsConfig(structuredClone(preset), {
      site: { title: "Site" },
      content: { sources: [{ file: "GUIDE.md" }] },
      theme: { styles: { Sidebar: { LinkLabel: { color: "#text" } } } },
    });
    expect(result.site).toEqual({ title: "Site", description: "Shared" });
    expect(result.content?.sources).toEqual([{ file: "GUIDE.md" }]);
    expect(result.theme?.styles?.Sidebar?.LinkLabel).toEqual({
      whiteSpace: "normal",
      color: "#text",
    });
    expect(preset.site.title).toBe("Base");
  });
  it("keeps the preset default when overriding a conditional Tasty style", () => {
    const result = mergeDocsConfig(
      { theme: { styles: { Tabs: { padding: "2x" } } } },
      { theme: { styles: { Tabs: { padding: { "@mobile": "1x" } } } } },
    );
    expect(result.theme?.styles?.Tabs?.padding).toEqual({
      "": "2x",
      "@mobile": "1x",
    });
  });
});
