import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createServerStyleCollector,
  runWithCollector,
} from "@tenphi/tasty/ssr";
import { afterEach, describe, expect, it } from "vitest";
import { configureComponentStyles } from "./components/component-styles.js";
import {
  defineComponent,
  mergeStyles,
  resolveComponentStyles,
  tasty,
  useGlobalStyles,
  type Styles,
} from "./styling.js";

afterEach(() => configureComponentStyles(undefined));

describe("consumer styling", () => {
  it("merges custom component overrides while preserving anatomy and states", () => {
    const base = {
      display: "flex",
      alignItems: "center",
      Logo: {
        $: "> svg",
        color: "#accent-text",
        inlineSize: { "": "2rem", "@mobile": "1.75rem" },
      },
    } satisfies Styles;
    configureComponentStyles({
      ProjectTitle: {
        Logo: { inlineSize: { "@mobile": "1.625rem" } },
      },
    });

    const resolved = resolveComponentStyles("ProjectTitle", base);
    expect(resolved).toEqual({
      display: "flex",
      alignItems: "center",
      Logo: {
        $: "> svg",
        color: "#accent-text",
        inlineSize: { "": "2rem", "@mobile": "1.625rem" },
      },
    });
    expect(base.Logo.inlineSize["@mobile"]).toBe("1.75rem");

    const Root = defineComponent("ProjectTitle", { as: "a", styles: base });
    const collector = createServerStyleCollector();
    const html = runWithCollector(collector, () =>
      renderToStaticMarkup(
        createElement(Root, { href: "/docs/" }, createElement("svg")),
      ),
    );
    expect(html).toContain('href="/docs/"');
    expect(html).not.toContain("data-tasty-anatomy");
    expect(html).not.toContain("style=");
    const css = collector.getCSS();
    expect(css).toMatch(/align-items:\s*center/);
    expect(css).toContain("> svg");
    expect(css).toContain("2rem");
    expect(css).toContain("1.625rem");
    expect(css).not.toContain("1.75rem");
  });

  it.each([undefined, {}, { Label: { color: "#accent-text" } }])(
    "preserves generated subcomponents with theme override %j",
    (override) => {
      configureComponentStyles({ ProjectBadge: override });
      const Badge = defineComponent("ProjectBadge", {
        as: "a",
        elements: { Label: "span" },
        styles: { Label: { color: "#text" } },
      });
      const collector = createServerStyleCollector();
      const html = runWithCollector(collector, () =>
        renderToStaticMarkup(
          createElement(
            Badge,
            { href: "/docs/" },
            createElement(Badge.Label, {}, "Docs"),
          ),
        ),
      );
      expect(html).toContain('href="/docs/"');
      expect(html).toContain('<span data-element="Label">Docs</span>');
      expect(collector.getCSS()).toContain(
        override?.Label ? "var(--accent-text-color)" : "var(--text-color)",
      );
    },
  );

  it("allows direct Tasty composition without a theme configuration name", () => {
    const Base = tasty({ as: "a", styles: { color: "#text" } });
    const Link = tasty(Base, { styles: { color: "#accent-text" } });
    const collector = createServerStyleCollector();
    runWithCollector(collector, () =>
      renderToStaticMarkup(createElement(Link, { href: "/" })),
    );
    expect(collector.getCSS()).toContain("var(--accent-text-color)");
  });

  it.each([
    [{}, "accent-text"],
    [{ variant: "quiet" }, "text-muted"],
    [{ variant: "quiet", styles: { color: "#text-soft" } }, "text-soft"],
  ] as const)(
    "keeps Tasty's default, variant, and render style precedence for %j",
    (props, color) => {
      configureComponentStyles({ ProjectBadge: { color: "#accent-text" } });
      const Badge = defineComponent("ProjectBadge", {
        styles: { color: "#text" },
        variants: { quiet: { color: "#text-muted" } },
      });
      const collector = createServerStyleCollector();
      runWithCollector(collector, () =>
        renderToStaticMarkup(createElement(Badge, props)),
      );
      expect(collector.getCSS()).toContain(`color: var(--${color}-color)`);
    },
  );

  it("collects merged global style trees during server rendering", () => {
    configureComponentStyles({
      ProjectNote: { Label: { color: "#text" } },
    });
    const collector = createServerStyleCollector();
    runWithCollector(collector, () => {
      useGlobalStyles(
        ".project-note",
        resolveComponentStyles(
          "ProjectNote",
          mergeStyles(
            { display: "block" },
            { Label: { $: "> strong", color: "#text-soft", padding: "1rem" } },
          ),
        ),
      );
    });
    const css = collector.getCSS();
    expect(css).toContain(".project-note");
    expect(css).toContain("> strong");
    expect(css).toMatch(/padding:\s*1rem/);
    expect(css).toContain("var(--text-color)");
    expect(css).not.toContain("--text-soft-color");
  });
});
