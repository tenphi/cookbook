import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HookParameters } from "astro";
import sitemap from "@astrojs/sitemap";
import {
  createDocsGraph,
  normalizeDocsConfig,
  type DocsGraph,
} from "@tenphi/docs";
import cookbook from "./integration.js";
import type { FrontmatterSchema } from "./plugin-contract.js";

vi.hoisted(() => {
  // Vitest's VM cannot run the native React import. Stub only that loader;
  // graph refresh still runs through Cookbook's real hooks and data plugin.
  vi.stubGlobal(
    "Function",
    new Proxy(globalThis.Function, {
      construct(target, args) {
        if (args[0] === "specifier" && args[1] === "return import(specifier)")
          return async () => ({
            default: () => ({ name: "react", hooks: {} }),
          });
        return Reflect.construct(target, args);
      },
    }),
  );
});

vi.mock("@tenphi/docs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tenphi/docs")>()),
  createDocsGraph: vi.fn(),
}));
vi.mock("@astrojs/sitemap", () => ({
  default: vi.fn(() => ({ name: "sitemap", hooks: {} })),
}));
vi.mock("@astrojs/mdx", () => ({
  default: () => ({ name: "mdx", hooks: {} }),
}));
vi.mock("./site-icons.js", () => ({
  createSiteIcons: async () => ({ assets: [], head: [] }),
}));
vi.mock("./social-image.js", () => ({
  createDefaultSocialImage: async () => undefined,
}));

let root: string;
beforeEach(async () => {
  vi.unstubAllGlobals();
  root = await mkdtemp(join(tmpdir(), "cookbook-graph-refresh-"));
  vi.mocked(createDocsGraph).mockReset();
  vi.mocked(sitemap).mockClear();
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function graph(name: string): DocsGraph {
  const route = `/${name}`;
  const config = normalizeDocsConfig();
  config.build.base = "/manual/";
  return {
    config,
    entries: ["first", "second"].map((id) => ({
      id,
      route,
      sourcePath: `${id}.mdx`,
      absolutePath: join(root, `${id}.mdx`),
      sourceRoot: root,
      trust: "mdx",
      frontmatter: {},
      metadata: { graph: name, id },
      assets: [],
      transformedBody: "# Guide",
    })),
    routes: [{ route, title: name }],
    diagnostics: [],
    assets: [],
    redirects: {},
    entryByRoute: () => undefined,
  } as unknown as DocsGraph;
}

async function setup(schema: FrontmatterSchema) {
  const updateConfig = vi.fn();
  const integration = cookbook({
    root,
    config: {},
    configFile: false,
    frontmatterSchema: schema,
  });
  await integration.hooks["astro:config:setup"]!({
    command: "build",
    config: {
      output: "static",
      root: pathToFileURL(`${root}/`),
      publicDir: pathToFileURL(`${root}/public/`),
      srcDir: pathToFileURL(`${root}/src/`),
      cacheDir: pathToFileURL(`${root}/.astro/`),
      base: "/manual/",
      integrations: [],
      image: {},
      markdown: {
        processor: { name: "unified", options: {} },
        shikiConfig: {},
      },
    },
    updateConfig,
    addWatchFile: vi.fn(),
    injectRoute: vi.fn(),
    addMiddleware: vi.fn(),
    addRenderer: vi.fn(),
    injectScript: vi.fn(),
    logger: { warn: vi.fn() },
  } as unknown as HookParameters<"astro:config:setup">);
  const plugin = updateConfig.mock.calls
    .flatMap(([update]) => update.vite?.plugins ?? [])
    .find((plugin) => plugin.name === "cookbook-data") as {
    load(
      this: { addWatchFile(path: string): void },
      id: string,
    ): Promise<string>;
    watchChange(id: string): void;
  };
  const load = () =>
    plugin.load.call({ addWatchFile: vi.fn() }, "\0virtual:cookbook/config");
  const invalidate = () => plugin.watchChange(join(root, "first.mdx"));
  const included = (name: string) =>
    vi.mocked(sitemap).mock.calls[0]![0]!.filter!(
      `https://example.com/manual/${name}/`,
    );
  return { integration, load, invalidate, included };
}

describe("graph refresh publication", () => {
  it("keeps the last graph visible while asynchronous schema validation is pending", async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const parseAsync = vi.fn(async (metadata: unknown) => {
      await pending;
      return { ...(metadata as object), reviewed: true };
    });
    vi.mocked(createDocsGraph)
      .mockResolvedValueOnce(graph("setup"))
      .mockResolvedValueOnce(graph("refreshed"));
    const { load, included } = await setup({ parseAsync });
    expect(parseAsync).not.toHaveBeenCalled();
    const loading = load();
    await vi.waitFor(() => expect(parseAsync).toHaveBeenCalledTimes(1));
    expect(included("setup")).toBe(true);
    expect(included("refreshed")).toBe(false);
    finish();
    expect(await loading).toContain('"reviewed":true');
    expect(parseAsync).toHaveBeenCalledTimes(2);
    expect(included("refreshed")).toBe(true);
    expect(included("setup")).toBe(false);
    expect(vi.mocked(createDocsGraph).mock.calls[1]![0]).toMatchObject({
      root,
      base: "/manual/",
      config: {},
    });
  });

  it.each(["core", "schema"])(
    "preserves the successful graph after %s validation fails and allows a retry",
    async (failure) => {
      const candidate = graph("rejected");
      if (failure === "core")
        candidate.diagnostics.push({
          code: "BROKEN_GRAPH",
          severity: "error",
          message: "broken graph",
        });
      const parse = vi.fn((metadata: unknown) => {
        const data = metadata as Record<string, unknown>;
        if (
          failure === "schema" &&
          data.graph === "rejected" &&
          data.id === "second"
        )
          throw Error("rejected metadata");
        return { ...data, reviewed: true };
      });
      vi.mocked(createDocsGraph)
        .mockResolvedValueOnce(graph("setup"))
        .mockResolvedValueOnce(graph("successful"))
        .mockResolvedValueOnce(candidate)
        .mockResolvedValueOnce(graph("recovered"));
      const { load, invalidate, included, integration } = await setup({
        parse,
      });
      await load();
      expect(included("successful")).toBe(true);
      invalidate();
      await expect(load()).rejects.toThrow(
        failure === "core" ? "broken graph" : "rejected metadata",
      );
      expect(included("successful")).toBe(true);
      expect(included("rejected")).toBe(false);
      await integration.hooks["astro:build:start"]!(
        {} as HookParameters<"astro:build:start">,
      );
      expect(createDocsGraph).toHaveBeenCalledTimes(3);
      expect(included("successful")).toBe(true);
      expect(await load()).toContain('"reviewed":true');
      expect(included("recovered")).toBe(true);
      expect(included("successful")).toBe(false);
    },
  );
});
