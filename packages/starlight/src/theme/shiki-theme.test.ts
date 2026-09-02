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

  it("loads the embedded TSX grammar used by MDX", async () => {
    const markdown = [
      "```mdx",
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
      '<span style="color:var(--syntax-value-color)">title</span>',
    );
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
    ]);
  });
});
