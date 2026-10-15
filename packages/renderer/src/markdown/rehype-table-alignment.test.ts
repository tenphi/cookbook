import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import {
  rehypeTableAlignment,
  satteriTableAlignment,
} from "./rehype-table-alignment.js";

type Cell = {
  type: string;
  tagName: string;
  properties: Record<string, unknown>;
  children: unknown[];
};

function satteriCell(properties: Record<string, unknown>): Cell | undefined {
  const cell = { type: "element", tagName: "td", properties, children: [] };
  let replacement: Cell | undefined;
  satteriTableAlignment.element.visit(cell, {
    replaceNode: (_node, next) => {
      replacement = next as Cell;
    },
  });
  return replacement;
}

describe("Markdown table alignment", () => {
  it("moves GFM column alignment into a data modifier", async () => {
    const renderer = await createMarkdownProcessor({
      syntaxHighlight: false,
      rehypePlugins: [rehypeTableAlignment],
    });
    const { code } = await renderer.render(
      "| A | B | C | D |\n| --- | :-- | :-: | --: |\n| 1 | 2 | 3 | 4 |",
      { frontmatter: {} },
    );

    expect(code).toContain("<th>A</th>");
    expect(code).toContain('<th data-align="left">B</th>');
    expect(code).toContain('<th data-align="center">C</th>');
    expect(code).toContain('<td data-align="right">4</td>');
    expect(code).not.toMatch(/\salign=|style=/);
  });

  it("replaces Sätteri's inline text-align style", () => {
    const replacement = satteriCell({
      id: "total",
      style: "text-align: right",
    });

    expect(replacement?.properties).toEqual({
      id: "total",
      dataAlign: "right",
    });
  });

  it("leaves other cell styles for the Tasty output check", () => {
    expect(satteriCell({})).toBeUndefined();
    expect(satteriCell({ style: "text-align: right; color: red" })).toBe(
      undefined,
    );
    expect(satteriCell({ style: "text-align: justify" })).toBeUndefined();
  });
});
