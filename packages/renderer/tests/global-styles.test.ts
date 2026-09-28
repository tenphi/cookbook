import { Linter } from "eslint";
import { COOKBOOK_COMPONENT_SUB_ELEMENTS } from "@tenphi/docs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const source = await readFile(
  new URL("../src/components/GlobalStyles.js", import.meta.url),
  "utf8",
);
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("navigation global style architecture", () => {
  it.each([
    ["#cookbook__sidebar", "Sidebar"],
    [".right-sidebar-panel", "TableOfContents"],
    [".right-sidebar-container", "TableOfContentsLayout"],
    ["body > .page > .header", "HeaderFrame"],
    ["site-search button[data-open-modal]", "SearchButton"],
    [":where(h1, h2, h3, h4, h5, h6, .site-title)", "Heading"],
  ])("customizes %s through theme.styles.%s", (selector, componentName) => {
    expect(source).toMatch(
      new RegExp(
        `useGlobalStyles\\(\\s*["']${escapeRegExp(selector)}["'],\\s*resolveComponentStyles\\(\\s*["']${componentName}["']`,
      ),
    );
  });

  it.each([
    "#cookbook__sidebar .sidebar-content",
    "#cookbook__sidebar ul",
    "#cookbook__sidebar li",
    "#cookbook__sidebar :where(summary, a)",
    "#cookbook__sidebar summary",
    "#cookbook__sidebar summary > .group-label",
    "#cookbook__sidebar summary > .group-label > span:first-child",
    "#cookbook__sidebar a",
    "#cookbook__sidebar a > span:first-child",
    "#cookbook__sidebar .group-label > .large",
    ".right-sidebar-panel h2",
    ".right-sidebar-panel ul",
    ".right-sidebar-panel li",
    ".right-sidebar-panel a",
    ".right-sidebar-panel a > span",
    "cookbook-mobile-toc .dropdown .isMobile > li",
    "cookbook-mobile-toc .dropdown .isMobile a",
    "cookbook-mobile-toc .dropdown .isMobile a > span",
  ])("declares %s as a Tasty sub-element", (selector) => {
    expect(source).not.toMatch(
      new RegExp(`useGlobalStyles\\(\\s*["']${escapeRegExp(selector)}["']`),
    );
  });
});

describe("typography global style architecture", () => {
  it.each([
    ["Body", "body"],
    ["Code", "code"],
    ["Strong", "strong"],
  ])("applies Document.%s through its semantic preset", (element, preset) => {
    expect(source).toMatch(
      new RegExp(`${element}: \\{[^}]*preset: "${preset}"`),
    );
  });

  it.each([1, 2, 3, 4, 5, 6])(
    "applies h%s through its named heading sub-element",
    (level) => {
      expect(source).toContain(
        `Level${level}: { $: "&:is(h${level})", preset: "h${level}" }`,
      );
    },
  );

  it("does not wire preset internals through custom properties", () => {
    expect(source).not.toContain('"$bold-font-weight"');
    expect(source).not.toContain('fontWeight: "$body-bold-font-weight"');
  });
});

describe("global style customization contract", () => {
  it("registers every style tree and every named sub-element exactly once", () => {
    const linter = new Linter();
    const names = new Set<string>();
    const selectors = new Set<string>();
    const failures: string[] = [];
    linter.verify(source, [
      {
        plugins: {
          inventory: {
            rules: {
              check: {
                create() {
                  return {
                    CallExpression(node: any) {
                      if (node.callee.name !== "useGlobalStyles") return;
                      const [selector, resolver] = node.arguments;
                      if (resolver?.callee?.name !== "resolveComponentStyles") {
                        failures.push(`Unregistered styles: ${selector.value}`);
                        return;
                      }
                      const [nameNode, styles] = resolver.arguments;
                      const name =
                        nameNode.value as keyof typeof COOKBOOK_COMPONENT_SUB_ELEMENTS;
                      if (names.has(name))
                        failures.push(`Split component: ${name}`);
                      if (selectors.has(selector.value))
                        failures.push(
                          `Duplicate global slot: ${selector.value}`,
                        );
                      names.add(name);
                      selectors.add(selector.value);
                      const actual = styles.properties
                        .map(
                          (property: any) =>
                            property.key.name ?? property.key.value,
                        )
                        .filter((key: string) => /^[A-Z]/.test(key))
                        .sort();
                      expect(actual, name).toEqual(
                        [...COOKBOOK_COMPONENT_SUB_ELEMENTS[name]].sort(),
                      );
                    },
                  };
                },
              },
            },
          },
        },
        rules: { "inventory/check": "error" },
      },
    ]);
    expect(failures).toEqual([]);
    expect(names.has("Search")).toBe(true);
    expect(names.has("SearchResults")).toBe(true);
    expect(names.has("Markdown")).toBe(true);
    expect(names.has("Pagination")).toBe(true);
  });
  it("keeps explicit media dimensions and generic media rules configurable", () => {
    expect(source).toContain("ResponsiveWidth: {");
    expect(source).toContain("img:not([width])");
    expect(source).toContain("video:not([width])");
    expect(source).toContain("ResponsiveHeight: {");
    expect(source).toContain("img:not([height])");
  });
});
