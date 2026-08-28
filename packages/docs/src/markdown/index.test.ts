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
});
