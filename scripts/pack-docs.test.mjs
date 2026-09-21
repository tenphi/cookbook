import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  packDocs,
  rewriteDocumentation,
  validateDocumentation,
} from "./pack-docs.mjs";

const temporary = [];
async function directory() {
  const path = await mkdtemp(join(tmpdir(), "cookbook-docs-test-"));
  temporary.push(path);
  return path;
}
afterEach(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("packaged documentation", () => {
  it("rewrites Markdown references and HTML assets without rewriting code or frontmatter", () => {
    const markdown = `---
title: Reference
description: https://example.com/guide
---

[Guide](https://example.com/guide#intro)

[Reference][guide]
![Image][image]

[guide]: https://example.com/guide
[image]: logo.svg

<img src = 'logo.svg'><a href = "https://example.com/guide">Guide</a>

\`https://example.com/guide\`

\`\`\`md
[Example](https://example.com/guide)
<img src="logo.svg">
\`\`\`
`;
    const result = rewriteDocumentation(markdown, (url, image) =>
      image
        ? `https://assets.example.com/${url}`
        : url.replace("https://example.com/guide", "./guide.md"),
    );
    expect(result).toContain("description: https://example.com/guide");
    expect(result).toContain("[Guide](./guide.md#intro)");
    expect(result).toContain("[guide]: ./guide.md");
    expect(result).toContain("[image]: https://assets.example.com/logo.svg");
    expect(result).toContain('src="https://assets.example.com/logo.svg"');
    expect(result).toContain('href="./guide.md"');
    expect(result).toContain("`https://example.com/guide`");
    expect(result).toContain(
      '[Example](https://example.com/guide)\n<img src="logo.svg">',
    );
  });

  it("rewrites static MDX destinations while preserving expressions", () => {
    const source =
      'import { Card } from "example";\n\n<Card href="https://example.com" src={image} />\n';
    const result = rewriteDocumentation(source, () => "./guide.md", true);
    expect(result).toContain('href="./guide.md"');
    expect(result).toContain("src={image}");
    expect(result).toContain('import { Card } from "example"');
  });

  it("rejects missing files, escaping paths, and missing headings, but ignores code examples", async () => {
    const root = await directory();
    await writeFile(join(root, "guide.md"), "# Guide\n\n## Details\n");
    for (const target of [
      "missing.md",
      "../outside.md",
      "guide.md#missing",
      "#missing",
    ]) {
      await writeFile(join(root, "index.md"), `# Home\n\n[Read](${target})\n`);
      await expect(validateDocumentation(root)).rejects.toThrow(
        /Missing documentation/,
      );
    }
    await writeFile(
      join(root, "index.md"),
      "# Home\n\n[Read](guide.md?view=full#details)\n\n[Home](#home)\n\n```md\n[Example](missing.md)\n```\n",
    );
    await expect(validateDocumentation(root)).resolves.toBeUndefined();
  });

  it("ships local references, release provenance, licenses, and a fresh deterministic snapshot", async () => {
    const root = await directory();
    await writeFile(join(root, "obsolete.md"), "stale output");
    await packDocs(root);
    const files = await readdir(root, { recursive: true });
    expect(files).not.toContain("obsolete.md");
    for (const file of [
      "index.md",
      "authoring.mdx",
      "upstream/tasty/README.md",
      "upstream/tasty/LICENSE",
      "upstream/glaze/README.md",
      "upstream/glaze/LICENSE",
    ])
      expect(files).toContain(file);
    const guide = await readFile(join(root, "customization-rules.md"), "utf8");
    expect(guide).toContain("./upstream/tasty/docs/ai-agents.md");
    expect(guide).toContain("./upstream/glaze/docs/methodology.md");
    const metadata = await readFile(
      join(root, "upstream/manifest.json"),
      "utf8",
    );
    expect(JSON.parse(metadata).map((entry) => entry.name)).toEqual([
      "@tenphi/tasty",
      "@tenphi/glaze",
    ]);
    expect(metadata).not.toContain(process.cwd());
    const tasty = await readFile(
      join(root, "upstream/tasty/README.md"),
      "utf8",
    );
    expect(tasty).toMatch(
      /https:\/\/raw\.githubusercontent\.com\/tenphi\/tasty\/[^/]+\/assets\/tasty.svg/,
    );
    expect(
      await readFile(join(root, "upstream/glaze/README.md"), "utf8"),
    ).toMatch(/https:\/\/github\.com\/tenphi\/glaze\/blob\/[^/]+\/AGENTS.md/);
    await packDocs(root);
    expect(await readFile(join(root, "upstream/manifest.json"), "utf8")).toBe(
      metadata,
    );
    expect(await readFile(join(root, "customization-rules.md"), "utf8")).toBe(
      guide,
    );
  }, 30000);
});
