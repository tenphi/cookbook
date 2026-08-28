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
      ".tasty-docs/vendor/package/.tasty-docs-integrity": `${integrity}\n`,
      ".tasty-docs/vendor/package/package.json": JSON.stringify({
        name: "fixture-package",
        version: "1.2.3",
      }),
      ".tasty-docs/vendor/package/README.md": "# Vendored package\n",
      ".tasty-docs/vendor/package/docs/api.md": "# API\n",
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
            vendored: ".tasty-docs/vendor/package",
          },
        ],
      },
    });
    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map(({ route }) => route)).toEqual(["/", "/api"]);
  });
});
