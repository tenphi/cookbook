import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./index.js";

describe("Markdown metadata", () => {
  it("uses GitHub-compatible duplicate slugs and infers prose descriptions", () => {
    const parsed = parseMarkdown(
      "# API & usage\n\nThis paragraph is long enough to become the inferred page description.\n\n## API & usage\n",
    );
    expect(parsed.firstHeading).toBe("API & usage");
    expect(parsed.headings.map(({ slug }) => slug)).toEqual([
      "api--usage",
      "api--usage-1",
    ]);
    expect(parsed.description).toMatch(/^This paragraph/);
  });

  it("parses MDX imports without treating them as page prose", () => {
    const parsed = parseMarkdown(
      'import Demo from "./Demo.astro";\n\n# Component API\n\nA useful component description for the generated metadata.\n',
      { mdx: true },
    );

    expect(parsed.ast.children[0]?.type).toBe("mdxjsEsm");
    expect(parsed.firstHeading).toBe("Component API");
    expect(parsed.description).toMatch(/^A useful component/);
  });
});
