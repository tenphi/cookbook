import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
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
    sandbox: "",
  });
  expect((await build({ scripts: [] })).sandbox).toBe("");
});

it("inlines public scripts in order before the authored JavaScript", async () => {
  const preview = await build({
    html: "<button>Go</button>",
    scripts: ["/demo/lib.js", "/demo/button.js"],
    javascript: "lib.start();",
  });
  expect(preview.sandbox).toBe("allow-scripts");
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
    "allow-scripts",
  );
});

it("escapes closing script tags in authored JavaScript", async () => {
  const preview = await build({ javascript: 'x = "</Script>";' });
  expect(preview.sandbox).toBe("allow-scripts");
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
