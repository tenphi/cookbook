import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createServerStyleCollector,
  runWithCollector,
} from "@tenphi/tasty/ssr";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  PreviewRoot,
  previewHeightStyles,
} from "./components/Preview.styles.js";
import { buildPreview } from "./preview-document.js";

let root: string;
let publicDir: string;
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "preview-"));
  publicDir = join(root, "public");
  await mkdir(join(publicDir, "demo"), { recursive: true });
  await writeFile(join(publicDir, "demo/lib.js"), "window.lib = 1;");
  await writeFile(
    join(publicDir, "demo/button.js"),
    'document.body.append("</script><SCRIPT>")',
  );
  await writeFile(join(root, "secret.js"), "secret();");
});
afterAll(() => rm(root, { recursive: true, force: true }));

const build = (props: Parameters<typeof buildPreview>[0]) =>
  buildPreview(props, publicDir, "/guide/");

it("keeps markup-only previews without scripts", async () => {
  expect(await build({ html: "<p>Hi</p>", css: "p{}" })).toEqual({
    document:
      '<!doctype html><meta charset="utf-8"><style>p{}</style><p>Hi</p>',
    source: '<!doctype html><meta charset="utf-8"><style>p{}</style><p>Hi</p>',
    sandbox: "allow-forms",
  });
  expect((await build({ scripts: [] })).sandbox).toBe("allow-forms");
});

it("inlines public scripts in order before the authored JavaScript", async () => {
  const preview = await build({
    html: "<button>Go</button>",
    scripts: ["/demo/lib.js", "/demo/button.js"],
    javascript: "lib.start();",
  });
  expect(preview.sandbox).toBe("allow-forms allow-scripts");
  expect(preview.document).toBe(
    '<!doctype html><meta charset="utf-8"><style></style><button>Go</button>' +
      "<script>window.lib = 1;</script>" +
      '<script>document.body.append("<\\/script><SCRIPT>")</script>' +
      "<script>lib.start();</script>",
  );
  expect(preview.source).toBe(
    '<!doctype html><meta charset="utf-8"><style></style><button>Go</button>' +
      '<script src="/demo/lib.js"></script>' +
      '<script src="/demo/button.js"></script>' +
      "<script>lib.start();</script>",
  );
  expect((await build({ scripts: ["/demo/lib.js"] })).sandbox).toBe(
    "allow-forms allow-scripts",
  );
});

it("escapes closing script tags in authored JavaScript", async () => {
  const preview = await build({ javascript: 'x = "</Script>";' });
  expect(preview.sandbox).toBe("allow-forms allow-scripts");
  expect(preview.document).toContain('<script>x = "<\\/Script>";</script>');
  expect(preview.source).toContain('<script>x = "<\\/Script>";</script>');
});

it.each([
  "/demo/missing.js",
  "/demo",
  "demo/lib.js",
  "/../secret.js",
  "/demo/../../secret.js",
  "/demo\\..\\..\\secret.js",
  "//cdn.example.com/lib.js",
  "https://cdn.example.com/lib.js",
])("rejects %s outside the public directory", async (src) => {
  await expect(build({ scripts: [src] })).rejects.toThrow(
    `Preview on /guide/: script ${src} must be a readable file in the site's public directory`,
  );
});

it("resolves site-root paths inside the public directory, not the filesystem root", async () => {
  await expect(
    build({ scripts: [join(publicDir, "demo/lib.js")] }),
  ).rejects.toThrow("must be a readable file");
});

it("lets forms submit while the frame keeps its opaque origin", async () => {
  // Without allow-same-origin or allow-top-navigation, a submission can only
  // navigate the frame itself.
  expect((await build({ html: "<form></form>" })).sandbox).toBe("allow-forms");
  expect(
    (await build({ html: "<form></form>", javascript: "submit();" })).sandbox,
  ).toBe("allow-forms allow-scripts");
});

it.each(["18rem", "320px", "1.5em", ".5in", "60dvh", "40vmin"])(
  "keeps the CSS length %s as the frame height",
  async (height) => {
    expect((await build({ height })).height).toBe(height);
  },
);

it.each([
  "",
  "18",
  "-18rem",
  "50%",
  "2x",
  " 18rem",
  "min 18rem",
  "calc(10rem + 1px)",
  "18rem; color: red",
])("rejects the frame height %j", async (height) => {
  await expect(build({ height })).rejects.toThrow(
    `Preview on /guide/: height ${height} must be a CSS length, such as 18rem or 320px.`,
  );
});

it("replaces the frame's minimum height and keeps its other styles", () => {
  const collector = createServerStyleCollector();
  runWithCollector(collector, () =>
    renderToStaticMarkup(
      createElement(PreviewRoot, { styles: previewHeightStyles("18rem") }),
    ),
  );
  const frame = collector
    .getCSS()
    .match(/\[data-element="Frame"\]\s*\{([^}]*)\}/)?.[1];
  expect(frame).toMatch(/min-height:\s*18rem/);
  expect(frame).toMatch(/display:\s*block/);
  expect(frame).not.toContain("10rem");
});
