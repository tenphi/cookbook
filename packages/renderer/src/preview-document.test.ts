import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createServerStyleCollector,
  runWithCollector,
} from "@tenphi/tasty/ssr";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PREVIEW_HEIGHT_MESSAGE } from "./client/preview-height.js";
import {
  PreviewRoot,
  previewHeightStyles,
} from "./components/Preview.styles.js";
import { buildPreview, previewHeightReporter } from "./preview-document.js";

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
    '<!doctype html><meta charset="utf-8">' +
      `<script>${previewHeightReporter}</script>` +
      "<style></style><button>Go</button>" +
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

it("adds the height reporter only to previews that run scripts", async () => {
  const markup = await build({ html: "<p>Hi</p>" });
  expect(markup.document).not.toContain("<script>");
  for (const [props, script] of [
    [{ javascript: "go();" }, "go();"],
    [{ scripts: ["/demo/lib.js"] }, "window.lib = 1;"],
  ] as const) {
    const preview = await build({ html: "<p>Hi</p>", ...props });
    // First, before the content and authored code; never in View source.
    expect(preview.document).toBe(
      `<!doctype html><meta charset="utf-8"><script>${previewHeightReporter}</script>` +
        `<style></style><p>Hi</p><script>${script}</script>`,
    );
    expect(preview.source).not.toContain(previewHeightReporter);
  }
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
  "keeps the CSS length %s as the frame height and buffer",
  async (length) => {
    expect((await build({ height: length })).height).toBe(length);
    const preview = await build({ buffer: length, javascript: "go();" });
    expect(preview.buffer).toBe(length);
  },
);

it("drops the buffer of a preview without scripts, which can't measure its content", async () => {
  expect((await build({ buffer: "12rem" })).buffer).toBeUndefined();
  expect(
    (await build({ buffer: "12rem", scripts: ["/demo/lib.js"] })).buffer,
  ).toBe("12rem");
});

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
])("rejects the frame height or buffer %j", async (length) => {
  for (const name of ["height", "buffer"])
    await expect(
      build({ [name]: length, javascript: "go();" }),
    ).rejects.toThrow(
      `Preview on /guide/: ${name} ${length} must be a CSS length, such as 18rem or 320px.`,
    );
  // Validated even where a buffer has no effect.
  await expect(build({ buffer: length })).rejects.toThrow("buffer");
});

const frameStyles = (styles?: ReturnType<typeof previewHeightStyles>) => {
  const collector = createServerStyleCollector();
  runWithCollector(collector, () =>
    renderToStaticMarkup(createElement(PreviewRoot, styles && { styles })),
  );
  return collector
    .getCSS()
    .match(/\[data-element="Frame"\]\s*\{([^}]*)\}/)?.[1];
};

it("lets a frame grow from its minimum height up to the window height", () => {
  const frame = frameStyles();
  expect(frame).toMatch(/min-height:\s*10rem/);
  expect(frame).toMatch(/max-height:\s*100vh/);
});

it("replaces the frame's minimum height and keeps its other styles", () => {
  const frame = frameStyles(previewHeightStyles("18rem"));
  expect(frame).toMatch(/min-height:\s*18rem/);
  expect(frame).toMatch(/max-height:\s*100vh/);
  expect(frame).toMatch(/display:\s*block/);
  expect(frame).not.toContain("10rem");
});

describe("preview frame reporter", () => {
  // Runs the reporter against stand-ins for the frame's globals.
  function runReporter(box: number, scrollbar = 0) {
    let observed: unknown;
    let resize = () => {};
    let onMessage = (_event: { data: unknown }) => {};
    const root = {
      getBoundingClientRect: () => ({ height: box }),
      clientHeight: 600 - scrollbar,
      // Never below the frame's own height, so it must not be reported.
      scrollHeight: box + 500,
    };
    const parent = { postMessage: vi.fn() };
    new Function(
      "document",
      "parent",
      "window",
      "ResizeObserver",
      "addEventListener",
      previewHeightReporter,
    )(
      { documentElement: root },
      parent,
      { innerHeight: 600 },
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe(target: unknown) {
          observed = target;
        }
      },
      (type: string, listener: typeof onMessage) => {
        if (type === "message") onMessage = listener;
      },
    );
    return {
      root,
      observed,
      resize: () => resize(),
      ask: (data: unknown) => onMessage({ data }),
      post: parent.postMessage,
    };
  }

  it("posts the root element's height to the page whenever it resizes", () => {
    const { root, observed, resize, post } = runReporter(345.5);
    expect(observed).toBe(root);
    expect(post).not.toHaveBeenCalled();
    resize();
    expect(post).toHaveBeenCalledExactlyOnceWith(
      { type: PREVIEW_HEIGHT_MESSAGE, height: 345.5 },
      "*",
    );
  });

  it("adds a horizontal scrollbar's height", () => {
    const { resize, post } = runReporter(300, 15);
    resize();
    expect(post).toHaveBeenCalledWith(
      { type: PREVIEW_HEIGHT_MESSAGE, height: 315 },
      "*",
    );
  });

  it("posts its height again when the page asks", () => {
    const { ask, post } = runReporter(200);
    ask({ type: "other" });
    ask(null);
    expect(post).not.toHaveBeenCalled();
    ask({ type: PREVIEW_HEIGHT_MESSAGE });
    expect(post).toHaveBeenCalledExactlyOnceWith(
      { type: PREVIEW_HEIGHT_MESSAGE, height: 200 },
      "*",
    );
  });
});
