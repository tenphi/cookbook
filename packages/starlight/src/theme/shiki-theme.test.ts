import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import { cookbookShikiConfig } from "./shiki-theme.js";

async function render(markdown: string) {
  const renderer = await createMarkdownProcessor({
    syntaxHighlight: "shiki",
    shikiConfig: cookbookShikiConfig(),
  });
  return renderer.render(markdown, { frontmatter: {} });
}

describe("Cookbook Shiki theme", () => {
  it("colors complete Bash placeholder names consistently", async () => {
    const markdown = [
      "```bash",
      "akno plan show <plan-id>",
      "akno dream status --run <run-id>",
      "```",
    ].join("\n");
    const { code } = await render(markdown);

    expect(code).toMatch(
      /syntax-string-color\)\">plan-i<\/span><span style="color:var\(--syntax-string-color\)\">d<\/span>/,
    );
    expect(code).toMatch(
      /syntax-string-color\)\">run-i<\/span><span style="color:var\(--syntax-string-color\)\">d<\/span>/,
    );
  });

  it.each(["tsx", "mdx"])(
    "maps TSX markup in %s fences to distinct semantic colors",
    async (language) => {
      const markdown = [
        `\`\`\`${language}`,
        'import { Card } from "@tenphi/cookbook/components";',
        "",
        '<Card title="Package-first">Text</Card>',
        "```",
      ].join("\n");
      const { code } = await render(markdown);

      expect(code).toContain(
        '<span style="color:var(--syntax-keyword-color)">import</span>',
      );
      expect(code).toContain(
        '<span style="color:var(--syntax-string-color)">@tenphi/cookbook/components</span>',
      );
      expect(code).toContain(
        '<span style="color:var(--syntax-function-color)">Card</span>',
      );
      expect(code).toContain(
        '<span style="color:var(--syntax-property-color)"> title</span>',
      );
      expect(code).toContain(
        '<span style="color:var(--syntax-string-color)">Package-first</span>',
      );
      expect(code).toContain(
        '<span style="color:var(--syntax-punctuation-color)">&#x3C;</span>',
      );
    },
  );

  it("marks diff insertions and deletions without treating file headers as changes", async () => {
    const markdown = [
      "```diff",
      "--- a/colors.ts",
      "+++ b/colors.ts",
      '-const tone = "old";',
      '+const tone = "new";',
      " const stable = true;",
      "```",
    ].join("\n");
    const { code } = await render(markdown);

    expect(code).toContain('class="astro-code tasty-code td-diff"');
    expect(code).toMatch(/class="line td-diff-line--deleted"[^>]*>.*-.*old/);
    expect(code).toMatch(/class="line td-diff-line--inserted"[^>]*>.*\+.*new/);
    expect(code).not.toMatch(
      /class="line td-diff-line--(?:inserted|deleted)"[^>]*>.*(?:a|b)\/colors\.ts/,
    );
    expect(code).toContain("var(--red-text-color)");
    expect(code).toContain("var(--green-text-color)");
  });

  it("preserves consumer languages and transformers", () => {
    const transformer = { name: "consumer" };
    const config = cookbookShikiConfig({
      langs: ["yaml"],
      transformers: [transformer],
    });

    expect(config.langs).toEqual(["yaml", "tsx"]);
    expect(config.transformers).toEqual([
      transformer,
      expect.objectContaining({ name: "cookbook:bash-placeholders" }),
      expect.objectContaining({ name: "cookbook:diff-lines" }),
    ]);
  });
});
