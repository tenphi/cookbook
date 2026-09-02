import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import { rehypeMermaid, satteriMermaid } from "./rehype-mermaid.js";

describe("Mermaid Markdown rendering", () => {
  it("renders a Mermaid flowchart to an accessible, theme-responsive SVG", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: "shiki",
      rehypePlugins: [rehypeMermaid],
    });
    const markdown = [
      "```mermaid",
      "flowchart TD",
      "  accTitle: Dream cycle",
      "  A[Inspect evidence] --> B[Seal proposals]",
      "```",
    ].join("\n");
    const { code } = await renderer.render(markdown, { frontmatter: {} });

    expect(code).toContain(
      '<div class="td-mermaid" data-mermaid-state="ready"><svg role="img" aria-label="Dream cycle"',
    );
    expect(code).toContain("<title>Dream cycle</title>");
    expect(code).toContain("--bg:var(--surface-2-color)");
    expect(code).not.toContain("<style>");
  });

  it("drops diagram-authored style directives", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: "shiki",
      rehypePlugins: [rehypeMermaid],
    });
    const markdown = [
      "```mermaid",
      "flowchart TD",
      "  A[Safe] --> B[Still safe]",
      "  style A fill:url(javascript:alert(1))",
      "```",
    ].join("\n");
    const { code } = await renderer.render(markdown, { frontmatter: {} });

    expect(code).toContain('data-mermaid-state="ready"');
    expect(code).not.toContain("javascript:");
  });

  it("preserves class declarations in class diagrams", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: "shiki",
      rehypePlugins: [rehypeMermaid],
    });
    const markdown = [
      "```mermaid",
      "classDiagram",
      "  class Dream {",
      "    +String planId",
      "  }",
      "```",
    ].join("\n");
    const { code } = await renderer.render(markdown, { frontmatter: {} });

    expect(code).toContain('data-mermaid-state="ready"');
    expect(code).toContain("Dream");
    expect(code).toContain("planId");
  });

  it("leaves unsupported Mermaid diagram types as highlighted source", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: "shiki",
      rehypePlugins: [rehypeMermaid],
    });
    const markdown = ["```mermaid", "gantt", "  title Schedule", "```"].join(
      "\n",
    );
    const { code } = await renderer.render(markdown, { frontmatter: {} });

    expect(code).toContain('data-mermaid-state="error"');
    expect(code).not.toContain("<svg");
  });

  it("provides the equivalent adapter for Astro's Sätteri processor", () => {
    const node = {
      type: "element",
      tagName: "pre",
      properties: { dataLanguage: "mermaid" },
    };
    let replacement: { type: string; value?: string } | undefined;
    satteriMermaid.element.visit(node, {
      textContent: () => "flowchart TD\nA[Inspect] --> B[Apply]",
      replaceNode: (_node, next) => {
        replacement = next;
      },
      setProperty: () => undefined,
    });

    expect(replacement?.type).toBe("raw");
    expect(replacement?.value).toContain('data-mermaid-state="ready"');
    expect(replacement?.value).toContain("<svg");
  });
});
