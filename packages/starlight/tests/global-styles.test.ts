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
