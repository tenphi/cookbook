import { expect, it } from "vitest";
import { normalizeDocsConfig } from "./config/index.js";
it("validates optional contents policy and heading ranges", () => {
  expect(
    normalizeDocsConfig({
      tableOfContents: { mobile: true, minHeadingLevel: 2, maxHeadingLevel: 4 },
    }).tableOfContents,
  ).toEqual({ mobile: true, minHeadingLevel: 2, maxHeadingLevel: 4 });
  expect(normalizeDocsConfig({ tableOfContents: false }).tableOfContents).toBe(
    false,
  );
  for (const tableOfContents of [
    { mobile: "yes" },
    { minHeadingLevel: 0 },
    { maxHeadingLevel: 7 },
    { minHeadingLevel: 4, maxHeadingLevel: 2 },
  ])
    expect(() => normalizeDocsConfig({ tableOfContents } as never)).toThrow(
      /tableOfContents/,
    );
});
