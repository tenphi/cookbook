import { describe, expect, it, vi } from "vitest";
import type { DocsEntry } from "@tenphi/docs";
import {
  compatiblePlugins,
  validatePluginFrontmatter,
} from "./plugin-contract.js";

const entry = () =>
  ({
    sourcePath: "docs/guide.md",
    frontmatter: { draft: true },
    metadata: { owner: "team" },
  }) as unknown as DocsEntry;
describe("plugin metadata boundary", () => {
  it("preserves custom metadata and asynchronous schema defaults without changing routing", async () => {
    const page = entry();
    await validatePluginFrontmatter([page], {
      parseAsync: async (data) => ({ ...(data as object), reviewed: true }),
    });
    expect(page.metadata).toEqual({ owner: "team", reviewed: true });
    expect(page.frontmatter).toEqual({ draft: true });
  });
  it.each(["draft", "slug", "title", "aliases"])(
    "rejects reserved %s even when the source omitted it",
    async (key) => {
      await expect(
        validatePluginFrontmatter([entry()], {
          parse: () => ({ [key]: "new" }),
        }),
      ).rejects.toThrow(/docs\/guide.md.*reserved field/);
    },
  );
  it.each([new Date(), undefined, NaN, () => {}, 1n])(
    "rejects metadata which cannot survive serialization",
    async (value) => {
      await expect(
        validatePluginFrontmatter([entry()], { parse: () => ({ value }) }),
      ).rejects.toThrow("JSON values");
    },
  );
  it("protects the original graph when a schema mutates then fails", async () => {
    const page = entry();
    await expect(
      validatePluginFrontmatter([page], {
        parse(data) {
          (data as Record<string, unknown>).owner = "changed";
          throw Error("invalid owner");
        },
      }),
    ).rejects.toThrow("docs/guide.md: invalid owner");
    expect(page.metadata.owner).toBe("team");
  });
  it("names the plugin that adds incompatible CSS", () => {
    const [plugin] = compatiblePlugins([
      {
        name: "external-theme",
        hooks: {
          "config:setup"({ updateConfig }) {
            updateConfig({ customCss: ["theme.css"] });
          },
        },
      },
    ]);
    expect(() =>
      plugin!.hooks["config:setup"]!({ updateConfig: vi.fn() } as never),
    ).toThrow(/external-theme.*customCss/);
  });
  it("passes content and translation hooks through", () => {
    const updateConfig = vi.fn();
    const injectTranslations = vi.fn();
    const [plugin] = compatiblePlugins([
      {
        name: "content",
        hooks: {
          "i18n:setup"({ injectTranslations }) {
            injectTranslations({ en: { "custom.label": "Label" } });
          },
          "config:setup"({ updateConfig }) {
            updateConfig({ description: "custom" });
          },
        },
      },
    ]);
    plugin!.hooks["config:setup"]!({
      updateConfig,
      i18n: { injectTranslations },
    } as never);
    expect(updateConfig).toHaveBeenCalledWith({ description: "custom" });
    plugin!.hooks["i18n:setup"]!({ injectTranslations } as never);
    expect(injectTranslations).toHaveBeenCalled();
  });
});
