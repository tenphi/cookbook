import { ESLint, Linter } from "eslint";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "@tenphi/docs";
import { readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
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
                      if (
                        ["defineComponent", "extendComponent"].includes(
                          node.callee.name,
                        )
                      ) {
                        const options = node.arguments.at(-1);
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
                        node.arguments.length === 1
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
  it("uses the released selector warning through Cookbook's lint configuration", async () => {
    const eslint = new ESLint({
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      fix: true,
    });
    const source = `import { defineComponent } from "../define-component.js";
export const Root = defineComponent("Hero", { styles: {
  ResponsiveWidth: { $: "img:not([width]), :where(picture)", inlineSize: "max 100%" },
  ResponsiveHeight: { $: "img:not([height])", blockSize: "auto" },
} });`;
    const [result] = await eslint.lintText(source, {
      filePath: fileURLToPath(
        new URL("../src/components/Hero.styles.js", import.meta.url),
      ),
    });
    expect(result.messages).toEqual([
      expect.objectContaining({
        ruleId: "tasty/no-state-in-selector",
        severity: 1,
      }),
      expect.objectContaining({
        ruleId: "tasty/no-state-in-selector",
        severity: 1,
      }),
    ]);
    expect(result.output).toBeUndefined();
    const [valid] = await eslint.lintText(
      `import { defineComponent } from "../define-component.js";
export const Root = defineComponent("Hero", { styles: {
  Media: { $: "img, :where(picture)", inlineSize: { "": null, "@own(![width] | :is(picture))": "max 100%" } },
  Before: { $: "&::before", content: '""' },
} });`,
      {
        filePath: fileURLToPath(
          new URL("../src/components/Hero.styles.js", import.meta.url),
        ),
      },
    );
    expect(valid.messages).toEqual([]);
  });

  it("fails the repository lint command when a warning is introduced", async () => {
    const root = new URL("../../../", import.meta.url);
    const { scripts } = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    const [command, ...args] = scripts.lint.split(/\s+/);
    expect(command).toBe("eslint");
    const require = createRequire(import.meta.url);
    const executable = new URL(
      "./bin/eslint.js",
      pathToFileURL(require.resolve("eslint/package.json")),
    );
    // Exercise the actual CLI warning gate without changing a workspace file.
    const child = promisify(execFile)(
      process.execPath,
      [
        fileURLToPath(executable),
        ...args,
        "--stdin",
        "--stdin-filename",
        "packages/renderer/src/components/Hero.styles.js",
      ],
      { cwd: fileURLToPath(root), encoding: "utf8" },
    );
    child.child.stdin!.end(
      'import { defineComponent } from "../define-component.js";\nexport const Root = defineComponent("Hero", { styles: { maxInlineSize: "100%" } });',
    );
    await expect(child).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining("tasty/prefer-shorthand-property"),
      stderr: expect.stringContaining("ESLint found too many warnings"),
    });
  });

  it("warns about both native padding edges in named sub-elements without autofixing them", async () => {
    const eslint = new ESLint({
      cwd: fileURLToPath(new URL("../../../", import.meta.url)),
      fix: true,
    });
    const [result] = await eslint.lintText(
      'import { defineComponent } from "../define-component.js";\nexport const Root = defineComponent("Hero", { styles: { MinimalAction: { $: ".minimal", paddingInlineStart: "0", paddingInlineEnd: "0" } } });',
      {
        filePath: fileURLToPath(
          new URL("../src/components/Hero.styles.js", import.meta.url),
        ),
      },
    );
    for (const property of ["paddingInlineStart", "paddingInlineEnd"]) {
      expect(result.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ruleId: "tasty/prefer-shorthand-property",
            severity: 1,
            message: expect.stringContaining(property),
          }),
        ]),
      );
    }
    expect(result.output).toBeUndefined();
  });

  it.each([
    [
      "Hero.styles.js",
      'import { tasty } from "@tenphi/tasty";\nexport const Root = tasty({ styles: { maxInlineSize: "100%" } });',
    ],
    [
      "Hero.styles.js",
      'import { defineComponent } from "../define-component.js";\nexport const Root = defineComponent("Hero", { styles: { maxInlineSize: "100%" } });',
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
      expect(source, file).not.toContain("customizeComponent");
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
      expect(document).toContain(`":is(h${level})": "h${level}"`);
    expect(document).not.toContain('"$bold-font-weight"');
    expect(document).toContain("@own(![width] | :is(picture))");
    expect(document).toContain("@own(![height] | :is(picture))");
    expect(document).toContain('$: "img, :where(picture), video, canvas, svg');
  });
});
