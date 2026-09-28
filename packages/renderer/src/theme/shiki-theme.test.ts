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
      /td-syntax-string">plan-i<\/span><span class="td-syntax-string">d<\/span>/,
    );
    expect(code).toMatch(
      /td-syntax-string">run-i<\/span><span class="td-syntax-string">d<\/span>/,
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

      expect(code).toContain('<span class="td-syntax-keyword">import</span>');
      expect(code).toContain(
        '<span class="td-syntax-string">@tenphi/cookbook/components</span>',
      );
      expect(code).toContain('<span class="td-syntax-function">Card</span>');
      expect(code).toContain('<span class="td-syntax-property"> title</span>');
      expect(code).toContain(
        '<span class="td-syntax-string">Package-first</span>',
      );
      expect(code).toContain(
        '<span class="td-syntax-punctuation">&#x3C;</span>',
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

    expect(code).toContain("astro-code tasty-code td-diff");
    expect(code).toMatch(/class="line td-diff-line--deleted"[^>]*>.*-.*old/);
    expect(code).toMatch(/class="line td-diff-line--inserted"[^>]*>.*\+.*new/);
    expect(code).not.toMatch(
      /class="line td-diff-line--(?:inserted|deleted)"[^>]*>.*(?:a|b)\/colors\.ts/,
    );
    expect(code).toContain("td-red-text");
    expect(code).toContain("td-green-text");
  });

  it("emits classes for foreground, background and italic tokens without inline CSS", async () => {
    const { code } = await render(
      "```ts\n// commentary\nconst value = 2;\n```",
    );
    expect(code).not.toMatch(/\sstyle=/);
    expect(code).toContain("td-syntax-bg");
    expect(code).toContain("td-syntax-italic");
  });

  it("rejects custom transformer styles with a customization hint", async () => {
    const renderer = await createMarkdownProcessor({
      shikiConfig: cookbookShikiConfig({
        transformers: [
          {
            span(node: { properties: Record<string, unknown> }) {
              node.properties.style = "color:red";
            },
          },
        ],
      }),
    });
    await expect(
      renderer.render("```js\nconst x=1;\n```", { frontmatter: {} }),
    ).rejects.toThrow("theme.styles.SyntaxHighlight");
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
      expect.objectContaining({ name: "cookbook:tasty-classes" }),
    ]);
  });
});
