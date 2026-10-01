import { ESLint, Linter } from "eslint";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "@tenphi/docs";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { selectPopoverStyles } from "../src/components/select-popover-styles.js";

const components = new URL("../src/components/", import.meta.url);
const sources = new Map(
  await Promise.all(
    (await readdir(components))
      .filter((name) => name.endsWith(".styles.js"))
      .map(
        async (name) =>
          [name, await readFile(new URL(name, components), "utf8")] as const,
      ),
  ),
);
const globalOwners = new Set([
  "Layout",
  "Document",
  "Heading",
  "Markdown",
  "MarkdownInlineCode",
  "MarkdownCodeBlock",
  "MarkdownHeading",
  "MarkdownAlert",
  "MarkdownTable",
  "SyntaxHighlight",
  "Mermaid",
  "MermaidSource",
]);

// Inspect the authoring boundary without executing styling outside a page collector.
function inventory(source: string) {
  const surfaces: { name: string; global: boolean; parts: string[] }[] = [];
  const failures: string[] = [];
  const messages = new Linter().verify(
    source,
    [
      {
        plugins: {
          ownership: {
            rules: {
              inspect: {
                create() {
                  function parts(styles: any): string[] {
                    const names = new Set<string>();
                    for (const property of styles.properties) {
                      if (property.type === "SpreadElement") {
                        if (property.argument.name !== "versionSelectStyles") {
                          failures.push(
                            "Unknown style composition; extend the anatomy inventory",
                          );
                          continue;
                        }
                        for (const key of Object.keys(
                          selectPopoverStyles({
                            option: "Link",
                            hoverOption: "HoverLink",
                            currentOption: "CurrentLink",
                          }),
                        ))
                          if (/^[A-Z]/.test(key)) names.add(key);
                      } else {
                        const key = property.key.name ?? property.key.value;
                        if (/^[A-Z]/.test(key)) names.add(key);
                      }
                    }
                    return [...names].sort();
                  }
                  return {
                    CallExpression(node: any) {
                      if (node.callee.name === "useGlobalStyles") {
                        const resolver = node.arguments[1];
                        if (
                          resolver?.callee?.name !== "resolveComponentStyles"
                        ) {
                          failures.push(
                            "Global styles must resolve a named customization surface",
                          );
                          return;
                        }
                        let owner = node.parent;
                        while (owner && !/Function/.test(owner.type))
                          owner = owner.parent;
                        if (!owner)
                          failures.push(
                            "Global styles must register during rendering",
                          );
                        surfaces.push({
                          name: resolver.arguments[0].value,
                          global: true,
                          parts: parts(resolver.arguments[1]),
                        });
                      }
                      if (node.callee.name === "customizeComponent") {
                        const factory = node.arguments[1];
                        const options = factory.arguments.at(-1);
                        const styles = options.properties.find(
                          (p: any) => p.key?.name === "styles",
                        ).value;
                        surfaces.push({
                          name: node.arguments[0].value,
                          global: false,
                          parts: parts(styles),
                        });
                      }
                      if (
                        node.callee.name === "tasty" &&
                        node.arguments.length === 1 &&
                        node.parent?.callee?.name !== "customizeComponent"
                      )
                        failures.push(
                          "A built-in root must expose named theme customization",
                        );
                    },
                  };
                },
              },
            },
          },
        },
        rules: { "ownership/inspect": "error" },
      },
    ],
    { allowInlineConfig: false },
  );
  failures.push(...messages.map((message) => message.message));
  return { surfaces, failures };
}

describe("component style ownership", () => {
  it.each([
    [
      "Hero.styles.js",
      'import { tasty } from "@tenphi/tasty";\nexport const Root = tasty({ styles: { maxInlineSize: "100%" } });',
    ],
    [
      "Document.styles.js",
      'import { useGlobalStyles } from "@tenphi/tasty";\nimport { resolveComponentStyles } from "./component-styles.js";\nexport function CollectStyles() { useGlobalStyles(".test", resolveComponentStyles("Document", { maxInlineSize: "100%" })); }',
    ],
    [
      "SearchButton.styles.js",
      'import { extendComponent } from "../define-component.js";\nconst Button = () => null;\nexport const Root = extendComponent("ProjectButton", Button, { styles: { maxInlineSize: "100%" } });',
    ],
  ])(
    "reports native size constraints in %s with the actual lint configuration",
    async (file, source) => {
      const eslint = new ESLint({
        cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      });
      const [result] = await eslint.lintText(source, {
        filePath: fileURLToPath(
          new URL(`../src/components/${file}`, import.meta.url),
        ),
      });
      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ruleId: "tasty/prefer-shorthand-property",
            message: expect.stringContaining("maxInlineSize"),
          }),
        ]),
      );
    },
  );

  it("registers the complete public anatomy once, in component-owned modules", () => {
    const actual = [];
    for (const [file, source] of sources) {
      expect(source, file).not.toContain("@media(prefers-color-scheme:");
      const { surfaces, failures } = inventory(source);
      expect(failures, file).toEqual([]);
      for (const surface of surfaces) {
        const name =
          surface.name as keyof typeof COOKBOOK_COMPONENT_SUB_ELEMENTS;
        expect(surface.parts, `${file}: ${name}`).toEqual(
          [...COOKBOOK_COMPONENT_SUB_ELEMENTS[name]].sort(),
        );
        expect(surface.global, name).toBe(globalOwners.has(name));
        actual.push(name);
      }
    }
    expect(actual.sort()).toEqual([...COOKBOOK_COMPONENT_NAMES].sort());
  });

  it("initializes document foundations from the common shell", async () => {
    const page = await readFile(
      new URL("../src/routes/Page.astro", import.meta.url),
      "utf8",
    );
    const header = await readFile(
      new URL("../src/overrides/Header.astro", import.meta.url),
      "utf8",
    );
    expect(page).toContain("<DocumentStyles />");
    expect(header).not.toMatch(/DocumentStyles|GlobalStyles/);
  });

  it("keeps generated media dimensions and semantic typography configurable", () => {
    const document = sources.get("Document.styles.js")!;
    for (const [element, preset] of [
      ["Body", "body"],
      ["Code", "code"],
      ["Strong", "strong"],
    ])
      expect(document).toMatch(
        new RegExp(`${element}: \\{[^}]*preset: "${preset}"`),
      );
    for (const level of [1, 2, 3, 4, 5, 6])
      expect(document).toContain(
        `Level${level}: { $: "&:is(h${level})", preset: "h${level}" }`,
      );
    expect(document).not.toContain('"$bold-font-weight"');
    for (const selector of [
      "img:not([width])",
      "video:not([width])",
      "img:not([height])",
    ])
      expect(document).toContain(selector);
  });
});
