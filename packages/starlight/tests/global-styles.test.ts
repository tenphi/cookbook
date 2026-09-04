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
    ["#starlight__sidebar", "Sidebar"],
    [".right-sidebar-panel", "TableOfContents"],
    ["mobile-starlight-toc .dropdown .isMobile", "MobileTableOfContents"],
  ])("customizes %s through theme.styles.%s", (selector, componentName) => {
    expect(source).toMatch(
      new RegExp(
        `useGlobalStyles\\(\\s*["']${escapeRegExp(selector)}["'],\\s*resolveComponentStyles\\(\\s*["']${componentName}["']`,
      ),
    );
  });

  it.each([
    "#starlight__sidebar .sidebar-content",
    "#starlight__sidebar ul",
    "#starlight__sidebar li",
    "#starlight__sidebar :where(summary, a)",
    "#starlight__sidebar summary",
    "#starlight__sidebar summary > .group-label",
    "#starlight__sidebar summary > .group-label > span:first-child",
    "#starlight__sidebar a",
    "#starlight__sidebar a > span:first-child",
    "#starlight__sidebar .group-label > .large",
    ".right-sidebar-panel h2",
    ".right-sidebar-panel ul",
    ".right-sidebar-panel li",
    ".right-sidebar-panel a",
    ".right-sidebar-panel a > span",
    "mobile-starlight-toc .dropdown .isMobile > li",
    "mobile-starlight-toc .dropdown .isMobile a",
    "mobile-starlight-toc .dropdown .isMobile a > span",
  ])("declares %s as a Tasty sub-element", (selector) => {
    expect(source).not.toMatch(
      new RegExp(`useGlobalStyles\\(\\s*["']${escapeRegExp(selector)}["']`),
    );
  });
});

describe("typography global style architecture", () => {
  it.each([
    ["body", "body"],
    [":where(h1, h2, h3, h4, h5, h6), .site-title", "heading"],
    ["h1", "h1"],
    ["h2", "h2"],
    ["h3", "h3"],
    ["h4", "h4"],
    ["h5", "h5"],
    ["h6", "h6"],
    [":where(code, kbd, samp, pre)", "code"],
  ])("applies the %s typography through its preset", (selector, preset) => {
    expect(source).toMatch(
      new RegExp(
        `useGlobalStyles\\("${escapeRegExp(selector)}", \\{[^}]*preset: "${preset}"`,
      ),
    );
  });

  it("uses the inherited strong modifier for semantic bold text", () => {
    expect(source).toMatch(
      /useGlobalStyles\(":where\(strong, b\)", \{\s+preset: "strong",\s+\}\);/,
    );
  });

  it("does not wire preset internals through custom properties", () => {
    expect(source).not.toContain('"$bold-font-weight"');
    expect(source).not.toContain('fontWeight: "$body-bold-font-weight"');
  });
});
