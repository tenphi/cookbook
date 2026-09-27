import { rm } from "node:fs/promises";
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
