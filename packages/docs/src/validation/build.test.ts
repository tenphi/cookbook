import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { createDocsFixture } from "../testing/index.js";
import { validateBuiltDocs } from "./build.js";
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function fixture() {
  const page = (draft = false) =>
    `<html><head><link rel="canonical" href="https://example.com/manual/${draft ? "draft/" : ""}">${draft ? '<meta name="robots" content="noindex, follow">' : ""}<link rel="stylesheet" href="/manual/theme.css"></head><body><h1 id="top">Guide</h1><a href="/manual/draft/#top">Direct draft</a><img src="/manual/logo.svg"></body></html>`;
  const root = await createDocsFixture({
    "index.html": page(),
    "draft/index.html": page(true),
    "theme.css": "@font-face{font-family:Example;src:url('font.woff2')}",
    "font.woff2": "wOF2",
    "logo.svg": "<svg/>",
    "llms.txt": "# Docs",
    "sitemap-0.xml":
      "<urlset><url><loc>https://example.com/manual/</loc></url></urlset>",
    "_cookbook/publishing.json": JSON.stringify({
      base: "/manual/",
      site: "https://example.com",
      pages: [
        {
          route: "/",
          url: "https://example.com/manual/",
          canonical: "https://example.com/manual/",
          index: true,
          sitemap: true,
        },
      ],
    }),
  });
  roots.push(root);
  return root;
}
it("validates emitted navigation, fonts, metadata and legitimate direct draft links", async () => {
  const directory = await fixture();
  expect(await validateBuiltDocs({ directory })).toMatchObject({
    ok: true,
    pages: 2,
    diagnostics: [],
  });
  await rm(join(directory, "font.woff2"));
  const broken = await validateBuiltDocs({ directory });
  expect(broken.ok).toBe(false);
  expect(broken.diagnostics).toContainEqual(
    expect.objectContaining({
      code: "DOCS_OUTPUT_LINK_MISSING",
      message: expect.stringContaining("font.woff2"),
    }),
  );
  await writeFile(
    join(directory, "index.html"),
    '<a href="/manual/draft/#absent">Missing heading</a>',
  );
  const metadata = await validateBuiltDocs({ directory });
  expect(metadata.diagnostics.map((d) => d.code)).toContain(
    "DOCS_CANONICAL_INVALID",
  );
  expect(metadata.diagnostics.map((d) => d.code)).toContain(
    "DOCS_OUTPUT_FRAGMENT_MISSING",
  );
});
it("reports a missing build separately from a successful preflight", async () => {
  expect(
    await validateBuiltDocs({ directory: "/nonexistent-cookbook-output" }),
  ).toMatchObject({
    ok: false,
    scope: "built-output",
    diagnostics: [expect.objectContaining({ code: "DOCS_BUILD_MISSING" })],
  });
});
it("checks deployed URLs and catches a host returning HTML for missing assets", async () => {
  const directory = await fixture();
  let broken = false;
  const server = createServer(async (req, res) => {
    const path = req.url!.replace(/^\/preview\//, "");
    const file = path.endsWith("/") || !path ? `${path}index.html` : path;
    if (broken && file === "font.woff2") {
      res.setHeader("content-type", "text/html");
      res.end("<html>Fallback</html>");
      return;
    }
    try {
      res.end(await readFile(join(directory, file)));
    } catch {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  try {
    const deployedUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/preview/`;
    expect(await validateBuiltDocs({ directory, deployedUrl })).toMatchObject({
      ok: true,
      scope: "deployment",
    });
    broken = true;
    expect(
      (await validateBuiltDocs({ directory, deployedUrl })).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "DOCS_DEPLOYMENT_ASSET_INVALID" }),
    );
  } finally {
    await new Promise<void>((done) => server.close(() => done()));
  }
});
