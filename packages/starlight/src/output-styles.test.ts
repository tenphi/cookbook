import { describe, expect, it } from "vitest";
import { assertTastyOutput } from "./output-styles.js";
import { adaptPagefindUI } from "./pagefind-adapter.js";

describe("Tasty output contract", () => {
  it.each([
    '<p style="color:red">text</p>',
    "<p STYLE=color:red>text</p>",
    "<p\nstyle = 'color:red'>text</p>",
    "<STYLE>p{color:red}</STYLE>",
    '<template shadowrootmode="open"><style>p{color:red}</style></template>',
    '<link href="other.css" rel="stylesheet">',
    '<iframe srcdoc="&lt;p style=color:red&gt;text&lt;/p&gt;"></iframe>',
    '<iframe sandbox="allow-same-origin" srcdoc="&lt;p style=color:red&gt;text&lt;/p&gt;"></iframe>',
  ])("rejects non-Tasty presentation: %s", (html) => {
    expect(() => assertTastyOutput(html, "test.html")).toThrow(
      "Non-Tasty CSS found in test.html",
    );
  });
  it.each([
    '<pre>&lt;p style="color:red"&gt;</pre>',
    '<script>const example = `<p style="color:red">`;</script>',
    '<link rel="stylesheet" data-tasty-ssr href="tasty.page.hash.css">',
    '<iframe sandbox="" srcdoc="&lt;style&gt;p{color:red}&lt;/style&gt;"></iframe>',
    '<iframe sandbox="allow-scripts" srcdoc="&lt;p style=color:red&gt;test&lt;/p&gt;"></iframe>',
  ])("allows generated styling and isolated examples: %s", (html) => {
    expect(() => assertTastyOutput(html, "test.html")).not.toThrow();
  });
  it("adapts exactly the known Pagefind sizing assignment", () => {
    const source = "input_el.style.paddingRight = `${width + 2}px`";
    expect(adaptPagefindUI(source)).toBe("undefined");
    expect(() => adaptPagefindUI("unknown new behavior")).toThrow(
      "sizing changed",
    );
    expect(() => adaptPagefindUI(source + source)).toThrow("sizing changed");
  });
});
