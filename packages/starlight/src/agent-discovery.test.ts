import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDocsGraph } from "@tenphi/docs";
import { afterEach, describe, expect, it } from "vitest";
import {
  renderLlmsTxt,
  renderRobotsTxt,
  writeAgentDiscovery,
} from "./agent-discovery.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function fixture(base = "/") {
  const root = await mkdtemp(join(tmpdir(), "cookbook-agent-discovery-"));
  roots.push(root);
  await writeFile(join(root, "README.md"), "# Home\n\nWelcome to the docs.\n");
  await writeFile(
    join(root, "guide.md"),
    "---\ntitle: Guide [one]\ndescription: Install the package.\n---\n\n# Guide [one]\n",
  );
  await writeFile(
    join(root, "draft.md"),
    "---\ndraft: true\n---\n\n# Work in progress\n",
  );
  const graph = await createDocsGraph({
    root,
    config: {
      site: {
        title: "Example",
        description: "Example docs",
        url: "https://docs.example.com",
      },
      content: {
        sources: [
          { file: "README.md", route: "/" },
          { file: "guide.md" },
          { file: "draft.md" },
        ],
      },
    },
    base,
  });
  expect(graph.diagnostics.filter((item) => item.severity === "error")).toEqual(
    [],
  );
  return { root, graph };
}

describe("agent discovery", () => {
  it("lists published pages with canonical links and excludes drafts", async () => {
    const { graph } = await fixture("/project/");
    const body = renderLlmsTxt(graph);
    expect(body).toContain("# Example\n\n> Example docs");
    expect(body).toContain("[Home](https://docs.example.com/project/)");
    expect(body).toContain(
      "[Guide \\[one\\]](https://docs.example.com/project/guide/): Install the package.",
    );
    expect(body).not.toContain("Work in progress");
    graph.config.site.url = "https://docs.example.com/";
    expect(renderLlmsTxt(graph)).not.toContain("docs.example.com//project");
  });

  it("writes root discovery while preserving owner supplied files", async () => {
    const { root, graph } = await fixture();
    await writeFile(join(root, "robots.txt"), "User-agent: *\nDisallow: /\n");
    await writeFile(join(root, "llms.txt"), "# Curated index\n");
    await writeAgentDiscovery(root, graph);
    expect(await readFile(join(root, "robots.txt"), "utf8")).toBe(
      "User-agent: *\nDisallow: /\n",
    );
    expect(await readFile(join(root, "llms.txt"), "utf8")).toBe(
      "# Curated index\n",
    );
    expect(renderRobotsTxt("https://docs.example.com")).toContain(
      "Sitemap: https://docs.example.com/sitemap-index.xml",
    );
    expect(renderRobotsTxt("https://docs.example.com/")).toContain(
      "Sitemap: https://docs.example.com/sitemap-index.xml",
    );
  });

  it("does not emit a robots file below an origin path", async () => {
    const { root, graph } = await fixture("/project/");
    await writeAgentDiscovery(root, graph);
    await expect(readFile(join(root, "robots.txt"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});
