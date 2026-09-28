import { describe, expect, it } from "vitest";
import type { DocsEntry } from "@tenphi/docs";
import { validatePluginFrontmatter } from "./plugin-contract.js";

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
});
