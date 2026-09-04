import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createDocsFixture } from "../testing/index.js";
import { createDocsGraph } from "./index.js";

describe("content graph", () => {
  it("discovers conventions and rewrites links and assets under a base path", async () => {
    const home = "# Fixture\n\nSee [the guide](docs/guide.md#same-heading).\n";
    const root = await createDocsFixture({
      "README.md": home,
      "docs/guide.md":
        "# Guide\n\n![mark](assets/mark.svg)\n\n## Same heading\n\n## Same heading\n",
      "docs/assets/mark.svg": '<svg xmlns="http://www.w3.org/2000/svg"/>',
    });
    const graph = await createDocsGraph({
      root,
      config: { build: { base: "/manual" } },
    });

    expect(graph.routes.map(({ route }) => route)).toEqual(["/", "/guide"]);
    expect(graph.entryByRoute("/")?.transformedBody).toContain(
      "/manual/guide#same-heading",
    );
    expect(graph.entryByRoute("/guide")?.transformedBody).toMatch(
      /\/manual\/_tasty-assets\/[a-f0-9]{12}-mark\.svg/,
    );
    expect(
      graph.entryByRoute("/guide")?.headings.map(({ slug }) => slug),
    ).toContain("same-heading-1");
    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_HEADING_DUPLICATE",
        severity: "warning",
      }),
    );
    expect(await readFile(join(root, "README.md"), "utf8")).toBe(home);
  });

  it("reports broken internal references in strict mode", async () => {
    const root = await createDocsFixture({
      "README.md": "# Fixture\n\n[Missing](./nope.md)\n",
    });
    const graph = await createDocsGraph({ root });
    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_LINK_NOT_FOUND",
        severity: "error",
      }),
    );
  });

  it("resolves edit links from original source paths and preserves page presentation", async () => {
    const root = await createDocsFixture({
      "docs/index.md": `---
title: Fixture
template: splash
hero:
  tagline: A focused landing page.
  actions:
    - text: Begin
      link: /guide/
lastUpdated: false
---

Welcome to the fixture documentation.
`,
      "docs/guide.md": "# Guide\n",
    });
    const graph = await createDocsGraph({
      root,
      config: {
        editLink: {
          baseUrl: "https://github.com/example/project/edit/main/",
        },
        content: { sources: [{ glob: "docs/*.md", base: "docs" }] },
      },
    });
    const home = graph.entryByRoute("/");

    expect(home?.frontmatter.editUrl).toBe(
      "https://github.com/example/project/edit/main/docs/index.md",
    );
    expect(home?.frontmatter.template).toBe("splash");
    expect(home?.frontmatter.hero?.actions?.[0]?.text).toBe("Begin");
    expect(home?.frontmatter.lastUpdated).toBe(false);
  });

  it("validates internal primary navigation tabs", async () => {
    const root = await createDocsFixture({ "README.md": "# Fixture\n" });
    const graph = await createDocsGraph({
      root,
      config: {
        navigation: {
          tabs: [{ label: "Missing", link: "/missing" }],
        },
      },
    });

    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_NAV_TARGET_NOT_FOUND",
        message: "Navigation target does not exist: /missing.",
      }),
    );
  });

  it("validates deeply nested navigation owned by a tab", async () => {
    const root = await createDocsFixture({ "README.md": "# Fixture\n" });
    const graph = await createDocsGraph({
      root,
      config: {
        navigation: {
          tabs: [
            {
              label: "Guide",
              link: "/",
              items: [
                {
                  label: "Level one",
                  items: [
                    {
                      label: "Level two",
                      items: ["/missing-at-level-three"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    });

    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_NAV_TARGET_NOT_FOUND",
        message: "Navigation target does not exist: /missing-at-level-three.",
      }),
    );
  });

  it("rejects sources outside the repository unless explicitly enabled", async () => {
    const root = await createDocsFixture({ "README.md": "# Fixture\n" });
    const graph = await createDocsGraph({
      root,
      config: { content: { sources: [{ file: "../outside.md" }] } },
    });
    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_SOURCE_OUTSIDE_ROOT",
        severity: "error",
      }),
    );
  });

  it("builds package sources from an integrity-marked vendored artifact", async () => {
    const integrity = "sha512-test-integrity";
    const root = await createDocsFixture({
      ".cookbook/vendor/package/.cookbook-integrity": `${integrity}\n`,
      ".cookbook/vendor/package/package.json": JSON.stringify({
        name: "fixture-package",
        version: "1.2.3",
      }),
      ".cookbook/vendor/package/README.md": "# Vendored package\n",
      ".cookbook/vendor/package/docs/api.md": "# API\n",
    });
    const graph = await createDocsGraph({
      root,
      config: { content: { sources: [{ package: "fixture-package" }] } },
      lock: {
        schemaVersion: 1,
        sources: [
          {
            requested: "fixture-package",
            resolved: "fixture-package@1.2.3",
            registry: "https://registry.npmjs.org/",
            integrity,
            vendored: ".cookbook/vendor/package",
          },
        ],
      },
    });
    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map(({ route }) => route)).toEqual(["/", "/api"]);
  });
});
