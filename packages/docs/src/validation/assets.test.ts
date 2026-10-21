import { rm } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";
import { createDocsFixture } from "../testing/index.js";
import { createDocsGraph } from "../graph/index.js";
import { validateProjectAssets } from "./assets.js";
it("diagnoses absent configured fonts logos social images and components before building", async () => {
  const root = await createDocsFixture({ "README.md": "# Guide" });
  try {
    const config = {
      theme: {
        fonts: {
          body: { family: "Acme", files: [{ src: "/fonts/missing.woff2" }] },
        },
      },
      site: {
        logo: "missing.svg",
        seo: { image: { src: "/missing.png", alt: "Preview" } },
      },
      components: { overrides: { Footer: "./Footer.astro" } },
    };
    const project = { root, config };
    const graph = await createDocsGraph(project);
    const errors = await validateProjectAssets(project, graph);
    expect(errors).toHaveLength(4);
    expect(errors.every((e) => e.code === "DOCS_CONFIG_ASSET_MISSING")).toBe(
      true,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("resolves component overrides from the Astro project directory like the build", async () => {
  const root = await createDocsFixture({
    "content/README.md": "# Guide",
    "app/src/Header.astro": "<header />",
    "app/node_modules/fixture-components/package.json": JSON.stringify({
      name: "fixture-components",
    }),
    "app/node_modules/fixture-components/Sidebar.astro": "<nav />",
  });
  try {
    const project = {
      root: join(root, "content"),
      directory: join(root, "app"),
      config: {
        components: {
          overrides: {
            Header: "./src/Header.astro",
            Sidebar: "fixture-components/Sidebar.astro",
            Footer: "src/Footer.astro",
          },
        },
      },
    };
    const graph = await createDocsGraph(project);
    expect(await validateProjectAssets(project, graph)).toEqual([
      expect.objectContaining({
        code: "DOCS_COMPONENT_UNRESOLVED",
        message: "components.overrides.Footer cannot resolve src/Footer.astro.",
      }),
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
