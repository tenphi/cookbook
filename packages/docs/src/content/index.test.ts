import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDocsLoader } from "./index.js";

const cleanups: string[] = [];

afterEach(async () => {
  await Promise.all(
    cleanups.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

describe("createDocsLoader", () => {
  it("renders Markdown and exposes a Starlight-compatible virtual file path", async () => {
    const root = await mkdtemp(join(tmpdir(), "tasty-docs-loader-"));
    cleanups.push(root);
    await mkdir(join(root, "docs"));
    await writeFile(
      join(root, "docs", "index.md"),
      "# Home\n\nWelcome to the rendered documentation.\n\n## Start here\n",
    );

    const set = vi.fn();
    const renderMarkdown = vi.fn(async () => ({
      html: "<p>Welcome to the rendered documentation.</p>",
      metadata: { imagePaths: [], headings: [] },
    }));
    const srcDir = pathToFileURL(`${join(root, "site", "src")}/`);
    const loader = createDocsLoader(undefined, { root });

    await loader.load({
      store: { clear: vi.fn(), set },
      config: { root: pathToFileURL(`${join(root, "site")}/`), srcDir },
      parseData: async ({ data }) => data,
      renderMarkdown,
      generateDigest: () => "digest",
    });

    expect(renderMarkdown).toHaveBeenCalledWith(
      expect.stringContaining("Welcome to the rendered documentation."),
      { fileURL: pathToFileURL(join(root, "docs", "index.md")) },
    );
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "index",
        filePath: "src/content/docs/index.md",
        digest: "digest",
        rendered: expect.objectContaining({
          html: "<p>Welcome to the rendered documentation.</p>",
        }),
      }),
    );
  });
});
