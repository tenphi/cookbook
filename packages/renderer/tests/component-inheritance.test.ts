import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  createServerStyleCollector,
  runWithCollector,
} from "@tenphi/tasty/ssr";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, extendComponent } from "../src/define-component.js";
import { configureComponentStyles } from "../src/components/component-styles.js";

afterEach(() => configureComponentStyles(undefined));

function render(component: Parameters<typeof createElement>[0], props = {}) {
  const collector = createServerStyleCollector();
  const html = runWithCollector(collector, () =>
    renderToString(createElement(component, props)),
  );
  return { html, css: collector.getCSS() };
}

describe("named component inheritance", () => {
  it("merges theme overrides, inherited states and parts without changing siblings", () => {
    configureComponentStyles({
      Base: { gap: "7px", Label: { radius: "9px" } },
      Derived: { gap: "13px", Label: { color: "#accent-text" } },
    });
    const Base = defineComponent("Base", {
      as: "button",
      elements: { Label: "span" },
      styles: {
        display: "flex",
        gap: "1px",
        inlineSize: { "": "11px", ":hover": "12px" },
        Label: { padding: "3px", color: "#text" },
      },
    });
    const Derived = extendComponent("Derived", Base, {
      type: "submit",
      styles: {
        gap: "5px",
        inlineSize: { ":hover": "26px" },
        Label: { padding: "17px" },
      },
    });
    const Child = extendComponent("Child", Derived, {
      styles: { radius: "19px" },
    });
    expect(Derived.Label).toBe(Base.Label);
    expect(Child.Label).toBe(Base.Label);
    const derived = render(Child, {
      children: createElement(Child.Label, null, "Inherited label"),
    });
    expect(derived.html).toContain('type="submit"');
    expect(derived.html).toContain("Inherited label");
    expect(derived.html).not.toMatch(/\sstyle=|<style/);
    expect(derived.css).toMatch(/gap:\s*13px/);
    expect(derived.css).toMatch(/inline-size:\s*11px/);
    expect(derived.css).toMatch(/:hover[^{}]*\{[^{}]*inline-size:\s*26px/);
    expect(derived.css).toMatch(/padding:\s*17px/);
    expect(derived.css).toMatch(/border-radius:\s*9px/);
    expect(derived.css).toContain("var(--accent-text-color)");
    const sibling = render(Base);
    expect(sibling.css).toMatch(/gap:\s*7px/);
    expect(sibling.css).toMatch(/:hover[^{}]*\{[^{}]*inline-size:\s*12px/);
    expect(sibling.css).not.toContain("26px");
  });

  it("preserves base variants and lets render-time styles override derived defaults", () => {
    const Base = defineComponent("VariantBase", {
      as: "button",
      styles: { display: "flex", padding: "3px" },
      variants: { primary: { padding: "5px", radius: "7px" } },
    });
    const Derived = extendComponent("VariantDerived", Base, {
      variant: "primary",
      styles: { padding: "11px" },
    });
    expect(render(Derived).css).toMatch(/padding:\s*11px/);
    const css = render(Derived, { styles: { padding: "17px" } }).css;
    expect(css).toMatch(/padding:\s*17px/);
    expect(css).toMatch(/border-radius:\s*7px/);
  });
});
