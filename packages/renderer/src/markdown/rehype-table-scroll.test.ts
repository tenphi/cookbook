import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import {
  rehypeTableScroll,
  satteriTableScroll,
} from "./rehype-table-scroll.js";

describe("Markdown table scrolling", () => {
  it("wraps a table without changing its semantic elements", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: false,
      rehypePlugins: [rehypeTableScroll],
    });
    const { code } = await renderer.render(
      "| Name | Value |\n| --- | --- |\n| A | B |",
      {
        frontmatter: {},
      },
    );

    expect(code).toMatch(/<div class="td-table-scroll">\s*<table>/);
    expect(code).toContain("<thead>");
    expect(code).toContain("<tbody>");
    expect(code).toContain("<th>Name</th>");
    expect(code).toContain("<td>B</td>");
  });

  it("provides the equivalent adapter for Astro's Sätteri processor", () => {
    const table = {
      type: "element",
      tagName: "table",
      properties: {},
      children: [],
    };
    let replacement:
      | {
          type: string;
          tagName?: string;
          properties?: Record<string, unknown>;
          children?: unknown[];
        }
      | undefined;

    satteriTableScroll.element.visit(table, {
      replaceNode: (_node, next) => {
        replacement = next;
      },
    });

    expect(replacement).toMatchObject({
      type: "element",
      tagName: "div",
      properties: { className: ["td-table-scroll"] },
    });
    expect(replacement?.children).toEqual([table]);
  });
});
