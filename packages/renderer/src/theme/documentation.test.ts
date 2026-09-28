import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "@tenphi/docs";
import tasty from "@tenphi/eslint-plugin-tasty";
import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

const docsDirectory = fileURLToPath(
  new URL("../../../../docs/", import.meta.url),
);

function codeFences(markdown: string): string[] {
  return [
    ...markdown.matchAll(/```(?:js|jsx|ts|tsx|mdx)\n([\s\S]*?)\n```/g),
  ].map((match) => match[1]);
}

function firstStylesObject(source: string): string | undefined {
  const match = /\bstyles\s*:\s*\{/.exec(source);
  if (!match) return;

  const start = source.indexOf("{", match.index);
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}" && --depth === 0) {
      return source.slice(start, index + 1);
    }
  }
}

describe("Tasty documentation examples", () => {
  it("documents every configurable surface and named sub-element", async () => {
    const markdown = await readFile(
      `${docsDirectory}/theme-and-components.md`,
      "utf8",
    );
    const tableRows = markdown
      .split("\n")
      .filter((line) => line.startsWith("| `"));

    for (const name of COOKBOOK_COMPONENT_NAMES) {
      const row = tableRows.find((line) => line.startsWith(`| \`${name}\``));
      expect(row, `Missing documentation row for ${name}`).toBeDefined();
      const subElements = COOKBOOK_COMPONENT_SUB_ELEMENTS[name];
      if (subElements.length === 0) {
        expect(row).toContain("None");
      }
      for (const subElement of subElements) {
        expect(row).toContain(`\`${subElement}\``);
      }
    }
  });

  it("uses the recommended Tasty property forms in component styles", async () => {
    const linter = new Linter();
    const problems: string[] = [];
    const filenames = (await readdir(docsDirectory)).filter((filename) =>
      filename.endsWith(".md"),
    );

    for (const filename of filenames) {
      const markdown = await readFile(`${docsDirectory}/${filename}`, "utf8");
      for (const fence of codeFences(markdown)) {
        const styles = firstStylesObject(fence);
        if (!styles) continue;
        const source = [
          'import { tasty } from "@tenphi/tasty";',
          `tasty({ styles: ${styles} });`,
        ].join("\n");
        const messages = linter.verify(
          source,
          [
            {
              plugins: { tasty },
              rules: {
                "tasty/prefer-longhand-property": "error",
                "tasty/prefer-shorthand-property": "error",
              },
            },
          ],
          { filename: `${filename}.js` },
        );
        problems.push(
          ...messages.map(
            (message) =>
              `${filename}:${message.line}:${message.column} ${message.message}`,
          ),
        );
      }
    }

    expect(problems).toEqual([]);
  });
});
