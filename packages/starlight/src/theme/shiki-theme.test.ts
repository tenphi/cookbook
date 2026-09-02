import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import { bashPlaceholderTransformer, tastyCodeTheme } from "./shiki-theme.js";

describe("Cookbook Shiki theme", () => {
  it("colors complete Bash placeholder names consistently", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: tastyCodeTheme,
        transformers: [bashPlaceholderTransformer],
      },
    });
    const markdown = [
      "```bash",
      "akno plan show <plan-id>",
      "akno dream status --run <run-id>",
      "```",
    ].join("\n");
    const { code } = await renderer.render(markdown, { frontmatter: {} });

    expect(code).toMatch(
      /syntax-string-color\)\">plan-i<\/span><span style="color:var\(--syntax-string-color\)\">d<\/span>/,
    );
    expect(code).toMatch(
      /syntax-string-color\)\">run-i<\/span><span style="color:var\(--syntax-string-color\)\">d<\/span>/,
    );
  });
});
