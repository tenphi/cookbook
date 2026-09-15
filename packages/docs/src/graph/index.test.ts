import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createDocsFixture } from "../testing/index.js";
import { createDocsGraph } from "./index.js";

describe("content graph", () => {
  it("reports an empty documentation graph", async () => {
    const root = await createDocsFixture({ "package.json": "{}" });
    const graph = await createDocsGraph({ root });

    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({ code: "DOCS_NO_PAGES", severity: "error" }),
    );
  });

  it("discovers conventions and rewrites links and assets under a base path", async () => {
    const home =
      "# Fixture\n\nSee [the guide](docs/guide.md#same-heading) or [open it in the repository](https://github.com/example/fixture/blob/main/docs/guide.md#same-heading).\n";
    const root = await createDocsFixture({
      "README.md": home,
      "docs/guide.md":
        "# Guide\n\n![mark](assets/mark.svg)\n\n## Same heading\n\n## Same heading\n",
      "docs/assets/mark.svg": '<svg xmlns="http://www.w3.org/2000/svg"/>',
    });
    const external = await createDocsGraph({
      root,
      config: {
        site: { repository: "https://github.com/example/fixture" },
      },
    });
    expect(external.entryByRoute("/")?.transformedBody).toContain(
      "https://github.com/example/fixture/blob/main/docs/guide.md",
    );

    const graph = await createDocsGraph({
      root,
      base: "/manual",
      config: {
        site: { repository: "https://github.com/example/fixture" },
        content: { localizeRepositoryLinks: true },
      },
    });

    expect(graph.routes.map(({ route }) => route)).toEqual(["/", "/guide"]);
    expect(graph.entryByRoute("/")?.transformedBody).toContain(
      "/manual/guide#same-heading",
    );
    expect(graph.entryByRoute("/")?.transformedBody).not.toContain(
      "github.com/example/fixture",
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

  it("rewrites reference links, reference images, and downloadable files", async () => {
    const root = await createDocsFixture({
      "README.md":
        "# Fixture\n\nRead [the guide][guide] or [download][archive].\n\n![Mark][mark]\n\n[guide]: docs/guide.md\n[archive]: docs/files/example.zip\n[mark]: docs/assets/mark.svg\n",
      "docs/guide.md": "# Guide\n",
      "docs/files/example.zip": "fixture archive",
      "docs/assets/mark.svg": '<svg xmlns="http://www.w3.org/2000/svg"/>',
    });
    const graph = await createDocsGraph({ root });
    const body = graph.entryByRoute("/")?.transformedBody;

    expect(body).toContain("[guide]: /guide");
    expect(body).toMatch(
      /\[archive\]: \/_tasty-assets\/[a-f0-9]{12}-example\.zip/,
    );
    expect(body).toMatch(/\[mark\]: \/_tasty-assets\/[a-f0-9]{12}-mark\.svg/);
    expect(graph.assets).toHaveLength(2);
  });

  it("removes raw HTML from package Markdown safe mode", async () => {
    const integrity = "sha512-html-integrity";
    const root = await createDocsFixture({
      ".cookbook/vendor/package/.cookbook-integrity": `${integrity}\n`,
      ".cookbook/vendor/package/package.json": JSON.stringify({
        name: "fixture-package",
        version: "1.2.3",
      }),
      ".cookbook/vendor/package/README.md": `---
title: <strong>Package</strong>
hero:
  tagline: Safe <em>copy</em>
  image:
    html: <svg onload="alert('unsafe')"></svg>
banner:
  content: Read <b>carefully</b>
head:
  - tag: script
    content: alert('unsafe')
---

<script>alert("unsafe")</script>
`,
    });
    const graph = await createDocsGraph({
      root,
      config: {
        content: { sources: [{ package: "fixture-package" }] },
        markdown: { rawHtml: "allow" },
      },
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

    const entry = graph.entryByRoute("/");
    expect(entry?.transformedBody).not.toContain("script");
    expect(entry?.title).toBe("Package");
    expect(entry?.frontmatter.hero?.tagline).toBe("Safe copy");
    expect(entry?.frontmatter.hero?.image).toBeUndefined();
    expect(entry?.frontmatter.banner?.content).toBe("Read carefully");
    expect(entry?.frontmatter.head).toBeUndefined();
    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_UNTRUSTED_HTML",
        severity: "warning",
      }),
    );
  });

  it("applies the configured raw HTML policy to trusted Markdown", async () => {
    const root = await createDocsFixture({
      "README.md": "# Fixture\n\n<mark>Trusted HTML</mark>\n",
    });

    const allowed = await createDocsGraph({
      root,
      config: { markdown: { rawHtml: "allow" } },
    });
    expect(allowed.entryByRoute("/")?.transformedBody).toContain(
      "<mark>Trusted HTML</mark>",
    );

    const sanitized = await createDocsGraph({ root });
    expect(sanitized.entryByRoute("/")?.transformedBody).not.toContain(
      "<mark>",
    );
    expect(sanitized.diagnostics).toEqual([]);

    const rejected = await createDocsGraph({
      root,
      config: { markdown: { rawHtml: "reject" } },
    });
    expect(rejected.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_RAW_HTML_REJECTED",
        severity: "error",
        file: "README.md",
      }),
    );
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

  it("reports malformed frontmatter before rendering", async () => {
    const root = await createDocsFixture({
      "README.md": "---\ntitle:\n  nested: value\n---\n\nPage body.\n",
    });
    const graph = await createDocsGraph({ root });

    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_FRONTMATTER_INVALID",
        message: "title must be a string.",
      }),
    );
  });

  it("reports invalid YAML as a frontmatter diagnostic", async () => {
    const root = await createDocsFixture({
      "README.md": "---\ntitle: [unterminated\n---\n\nPage body.\n",
    });
    const graph = await createDocsGraph({ root });

    expect(graph.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_FRONTMATTER_INVALID",
        message: expect.stringContaining("Could not parse frontmatter"),
        file: "README.md",
      }),
    );
  });

  it("uses source navigation metadata when frontmatter does not override it", async () => {
    const root = await createDocsFixture({
      "README.md": "# Fixture\n",
    });
    const graph = await createDocsGraph({
      root,
      config: {
        content: {
          sources: [
            {
              file: "README.md",
              route: "/",
              navigation: { label: "Start here", order: 1, group: "Guides" },
            },
          ],
        },
      },
    });

    expect(graph.routes[0]?.sidebar).toEqual({
      label: "Start here",
      order: 1,
      group: "Guides",
    });
  });

  it("resolves edit links from original source paths and preserves page presentation", async () => {
    const root = await createDocsFixture({
      "docs/index.md": `---
title: Fixture
template: splash
hero:
  tagline: A focused landing page.
  image:
    file: assets/hero.svg
  actions:
    - text: Begin
      link: guide.md
lastUpdated: false
---

Welcome to the fixture documentation.
`,
      "docs/guide.md": "# Guide\n",
      "docs/assets/hero.svg":
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>',
    });
    const graph = await createDocsGraph({
      root,
      base: "/manual",
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
    expect(home?.frontmatter.hero?.actions?.[0]?.link).toBe("/manual/guide");
    expect(home?.frontmatter.hero?.image).toMatchObject({
      file: expect.stringMatching(
        /^\/manual\/_tasty-assets\/[a-f0-9]{12}-hero\.svg$/,
      ),
    });
    expect(graph.assets).toHaveLength(1);
    expect(home?.frontmatter.lastUpdated).toBe(false);
  });

  it("rejects malformed nested frontmatter before transformation", async () => {
    const root = await createDocsFixture({
      "README.md": `---
title: Fixture
hero:
  actions:
    - text: Missing link
banner: {}
---
`,
    });
    const graph = await createDocsGraph({ root });

    expect(graph.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "DOCS_FRONTMATTER_INVALID",
          message: "hero.actions[0].link must be a string.",
        }),
        expect.objectContaining({
          code: "DOCS_FRONTMATTER_INVALID",
          message: "banner.content must be a string.",
        }),
      ]),
    );
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

  it("localizes absolute repository links to packaged documentation", async () => {
    const integrity = "sha512-repository-links";
    const root = await createDocsFixture({
      ".cookbook/vendor/package/.cookbook-integrity": `${integrity}\n`,
      ".cookbook/vendor/package/package.json": JSON.stringify({
        name: "fixture-package",
        version: "1.2.3",
        repository: {
          type: "git",
          url: "git+ssh://git@github.com/example/monorepo.git",
          directory: "packages/fixture",
        },
      }),
      ".cookbook/vendor/package/README.md":
        "# Package\n\nRead the [API](https://github.com/example/monorepo/blob/main/packages/fixture/docs/api.md?plain=1#usage) and [guide](https://github.com/example/monorepo/tree/main/packages/fixture/docs/guide). Keep the [issue](https://github.com/example/monorepo/issues/42) external.\n",
      ".cookbook/vendor/package/docs/api.md": "# API\n\n## Usage\n",
      ".cookbook/vendor/package/docs/guide/index.md": "# Guide\n",
    });
    const graph = await createDocsGraph({
      root,
      base: "/manual",
      config: {
        content: {
          localizeRepositoryLinks: true,
          sources: [{ package: "fixture-package" }],
        },
      },
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

    expect(graph.entryByRoute("/")?.transformedBody).toContain(
      "[API](/manual/api?plain=1#usage)",
    );
    expect(graph.entryByRoute("/")?.transformedBody).toContain(
      "[guide](/manual/guide)",
    );
    expect(graph.entryByRoute("/")?.transformedBody).toContain(
      "[issue](https://github.com/example/monorepo/issues/42)",
    );
    expect(graph.diagnostics).toEqual([]);
  });
});
