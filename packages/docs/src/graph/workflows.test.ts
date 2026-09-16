import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDocsGraph } from "./index.js";
import { defineDocsConfig } from "../config/index.js";
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function fixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), "cookbook-workflow-"));
  roots.push(root);
  for (const [path, body] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, body);
  }
  return root;
}
describe("repository authoring workflows", () => {
  it("mounts one tree twice, scopes slugs, and keeps relative links in their mount", async () => {
    const root = await fixture({
      "docs/index.md":
        "# Home\n\n[Guide](./guide.md)\n\n[Other](source:v2/docs/guide.md)",
      "docs/guide.md": "---\nslug: getting-started\n---\n# Guide",
    });
    const graph = await createDocsGraph({
      root,
      config: {
        content: {
          sources: [
            { id: "v1", glob: "docs/*.md", base: "docs", routeBase: "/v1" },
            { id: "v2", glob: "docs/*.md", base: "docs", routeBase: "/v2" },
          ],
        },
      },
    });
    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map((route) => route.route)).toEqual([
      "/v1",
      "/v1/getting-started",
      "/v2",
      "/v2/getting-started",
    ]);
    expect(graph.entryByRoute("/v1")?.transformedBody).toContain(
      "[Guide](/v1/getting-started)",
    );
    expect(graph.entryByRoute("/v1")?.transformedBody).toContain(
      "[Other](/v2/getting-started)",
    );
    expect(graph.entryBySource("docs/guide.md")).toBeUndefined();
    expect(graph.entryBySource("docs/guide.md", "v2")?.route).toBe(
      "/v2/getting-started",
    );
  });
  it("supports separate source roots and diagnoses duplicate IDs", async () => {
    const root = await fixture({
      "packages/api/README.md": "# API",
      "packages/ui/README.md": "# UI",
    });
    const config = {
      editLink: { baseUrl: "https://github.com/example/sdk/edit/main/" },
      content: {
        sources: [
          { id: "api", root: "packages/api", file: "README.md", route: "/" },
          {
            id: "ui",
            root: "packages/ui",
            file: "README.md",
            routeBase: "/ui",
          },
        ],
      },
    };
    const graph = await createDocsGraph({ root, config });
    expect(graph.entryByRoute("/ui")?.frontmatter.editUrl).toBe(
      "https://github.com/example/sdk/edit/main/packages/ui/README.md",
    );
    expect(graph.routes.map((route) => route.route)).toEqual(["/", "/ui"]);
    config.content.sources[1]!.id = "api";
    expect(
      (await createDocsGraph({ root, config })).diagnostics.some(
        (item) => item.code === "DOCS_DUPLICATE_SOURCE",
      ),
    ).toBe(true);
  });
  it("diagnoses ambiguous links instead of downloading a mounted Markdown file", async () => {
    const root = await fixture({
      "README.md": "# Home\n\n[Guide](./docs/guide.md)",
      "docs/guide.md": "# Guide",
    });
    const graph = await createDocsGraph({
      root,
      config: {
        content: {
          sources: [
            { file: "README.md", route: "/" },
            { id: "v1", glob: "docs/*.md", base: "docs", routeBase: "/v1" },
            { id: "v2", glob: "docs/*.md", base: "docs", routeBase: "/v2" },
          ],
        },
      },
    });
    expect(
      graph.diagnostics.some((item) => item.code === "DOCS_AMBIGUOUS_LINK"),
    ).toBe(true);
    expect(graph.assets).toHaveLength(0);
  });
  it("preserves unrelated metadata outside renderer frontmatter and supports strict opt-in", async () => {
    const root = await fixture({
      "README.md": "---\ntags: [guide]\n---\n# Home",
    });
    const graph = await createDocsGraph({ root });
    expect(graph.diagnostics).toEqual([]);
    expect(graph.entries[0]?.metadata).toEqual({ tags: ["guide"] });
    expect(graph.entries[0]?.frontmatter).not.toHaveProperty("tags");
    expect(
      (
        await createDocsGraph({
          root,
          config: { content: { frontmatter: "reject" } },
        })
      ).diagnostics[0]?.code,
    ).toBe("DOCS_FRONTMATTER_INVALID");
  });
  it("sanitizes useful HTML, strips executable attributes, and rewrites HTML links/assets", async () => {
    const root = await fixture({
      "README.md":
        '# Home\n\n<details><summary>More</summary>Useful prose <a href="./guide.md" onclick="bad()">Guide</a><img src="./mark.svg" onerror="bad()"><script>bad()</script></details>\n\nSome <strong>important</strong> text.',
      "docs/guide.md": "# Unused",
      "guide.md": "# Guide",
      "mark.svg": '<svg xmlns="http://www.w3.org/2000/svg"/>',
    });
    const graph = await createDocsGraph({
      root,
      config: {
        content: {
          sources: [{ file: "README.md", route: "/" }, { file: "guide.md" }],
        },
      },
    });
    const body = graph.entryByRoute("/")?.transformedBody ?? "";
    expect(graph.diagnostics).toEqual([]);
    expect(body).toContain("<details><summary>More</summary>Useful prose");
    expect(body).toContain('href="/guide"');
    expect(body).toContain("/_tasty-assets/");
    expect(body).toContain("<strong>important</strong>");
    expect(body).not.toMatch(/onclick|onerror|<script|bad\(\)/);
  });
  it("reports intentional stripping and rejects HTML on request", async () => {
    const root = await fixture({
      "README.md": "# Home\n\n<details>Useful prose</details>",
    });
    const stripped = await createDocsGraph({
      root,
      config: { markdown: { rawHtml: "strip" } },
    });
    expect(stripped.diagnostics[0]?.code).toBe("DOCS_RAW_HTML_STRIPPED");
    const rejected = await createDocsGraph({
      root,
      config: { markdown: { rawHtml: "reject" } },
    });
    expect(rejected.diagnostics[0]?.severity).toBe("error");
  });
  it("resolves alias chains and validates redirect cycles and collisions", async () => {
    const root = await fixture({
      "README.md": "---\naliases: [/welcome]\n---\n# Home",
    });
    const graph = await createDocsGraph({
      root,
      config: { redirects: { "/old": "/welcome" } },
    });
    expect(graph.redirects).toEqual({ "/old": "/", "/welcome": "/" });
    expect(graph.entryByRoute("/old")?.route).toBe("/");
    for (const redirects of [
      { "/a": "/b", "/b": "/a" },
      { "/": "/welcome" },
      { "/missing": "/absent" },
    ]) {
      expect(
        (
          await createDocsGraph({ root, config: { redirects } })
        ).diagnostics.some((item) => item.code === "DOCS_REDIRECT_INVALID"),
      ).toBe(true);
    }
  });
  it("rejects theme/component mistakes before rendering", () => {
    expect(() => defineDocsConfig({ theme: { brand: "not-a-color" } })).toThrow(
      /theme.brand/,
    );
    expect(() =>
      defineDocsConfig({ theme: { styles: { Sidebaar: {} } } } as never),
    ).toThrow(/Sidebaar/);
    expect(() =>
      defineDocsConfig({
        theme: { styles: { Sidebar: { LinkLable: {} } } },
      } as never),
    ).toThrow(/LinkLable/);
    expect(() =>
      defineDocsConfig({
        content: { sources: [{ package: "fixture", trust: "anything" }] },
      } as never),
    ).toThrow(/trust/);
  });
});
