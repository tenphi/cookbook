import { describe, expect, it } from "vitest";
import { rehypePageAffordances } from "./rehype-page-affordances.js";

describe("Markdown page affordances", () => {
  it("wraps ordinary code blocks with an accessible copy control", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: { dataLanguage: "ts" },
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {},
              children: [{ type: "text", value: "const answer = 42;" }],
            },
          ],
        },
      ],
    };

    rehypePageAffordances()(tree);

    expect(tree.children[0]).toMatchObject({
      tagName: "cookbook-code-block",
      properties: {
        className: ["td-code-block"],
        dataTastyAnatomy: "MarkdownCodeBlock",
      },
      children: [
        { tagName: "pre" },
        {
          tagName: "button",
          properties: {
            dataCopyCode: "",
            ariaLabel: "Copy code",
            title: "Copy code",
          },
          children: [
            {
              tagName: "span",
              properties: { dataCopyIcon: "", ariaHidden: "true" },
            },
          ],
        },
      ],
    });
  });

  it("does not add a copy control to rendered Mermaid input", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      properties: { dataLanguage: "mermaid" },
      children: [
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: "flowchart LR" }],
        },
      ],
    };
    const tree = { type: "root", children: [pre] };

    rehypePageAffordances()(tree);

    expect(tree.children[0]).toBe(pre);
  });
});
