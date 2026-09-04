import { afterEach, describe, expect, it } from "vitest";
import {
  configureComponentStyles,
  resolveLegacyAnatomyStyles,
  resolveComponentStyleOverride,
  resolveComponentStyles,
} from "./component-styles.js";

const defaults = {
  color: "#text",
  padding: "2x",
  Label: { color: "#text-soft", fontWeight: 500 },
};

afterEach(() => configureComponentStyles(undefined));

describe("component style configuration", () => {
  it("extends defaults with a plain Tasty style object", () => {
    configureComponentStyles({
      Card: { padding: "3x", Label: { color: "#accent-text" } },
    });

    expect(resolveComponentStyles("Card", defaults)).toEqual({
      color: "#text",
      padding: "3x",
      Label: { color: "#accent-text", fontWeight: 500 },
    });
  });

  it("supports explicit extension and complete replacement", () => {
    configureComponentStyles({
      Card: { mode: "extend", styles: { radius: "1cr" } },
    });
    expect(resolveComponentStyles("Card", defaults)).toMatchObject({
      color: "#text",
      radius: "1cr",
    });

    configureComponentStyles({
      Card: { mode: "replace", styles: { display: "grid" } },
    });
    expect(resolveComponentStyles("Card", defaults)).toEqual({
      display: "grid",
    });
  });

  it("normalizes configured component overrides for Tasty composition", () => {
    expect(resolveComponentStyleOverride("Card")).toBeUndefined();

    configureComponentStyles({ Card: { padding: "3x" } });
    expect(resolveComponentStyleOverride("Card")).toEqual({
      mode: "extend",
      styles: { padding: "3x" },
    });

    configureComponentStyles({
      Card: { mode: "replace", styles: { display: "grid" } },
    });
    expect(resolveComponentStyleOverride("Card")).toEqual({
      mode: "replace",
      styles: { display: "grid" },
    });
  });

  it("exposes bridged component trees through the same style registry", () => {
    configureComponentStyles({
      MarkdownTable: { Table: { radius: "0" } },
      Mermaid: { Diagram: { maxInlineSize: "90%" } },
      MobileTableOfContents: { LinkLabel: { whiteSpace: "normal" } },
      Sidebar: { Link: { padding: "1x" } },
      TableOfContents: { Link: { color: "#text" } },
    });

    expect(
      resolveComponentStyles("MarkdownTable", {
        Table: { border: true, radius: "1cr" },
        Cell: { padding: "1.5x 2x" },
      }),
    ).toEqual({
      Table: { border: true, radius: "0" },
      Cell: { padding: "1.5x 2x" },
    });
    expect(
      resolveComponentStyles("Mermaid", {
        Diagram: { display: "block", maxInlineSize: "100%" },
      }),
    ).toEqual({
      Diagram: { display: "block", maxInlineSize: "90%" },
    });
    expect(
      resolveComponentStyles("Sidebar", {
        Link: { color: "#text-soft", padding: "2x" },
      }),
    ).toEqual({ Link: { color: "#text-soft", padding: "1x" } });
    expect(
      resolveComponentStyles("TableOfContents", {
        Link: { color: "#text-muted", preset: "small" },
      }),
    ).toEqual({ Link: { color: "#text", preset: "small" } });
    expect(
      resolveComponentStyles("MobileTableOfContents", {
        LinkLabel: { overflow: "hidden", whiteSpace: "nowrap" },
      }),
    ).toEqual({
      LinkLabel: { overflow: "hidden", whiteSpace: "normal" },
    });
  });

  it("keeps custom anatomy styles on the compatibility bridge", () => {
    expect(
      resolveLegacyAnatomyStyles({
        Footer: { color: "#text-muted" },
        ThemeSelect: { padding: "1x" },
        ProductBadge: { color: "#accent-text" },
      }),
    ).toEqual({
      '[data-tasty-anatomy="ProductBadge"]': { color: "#accent-text" },
    });
  });
});
