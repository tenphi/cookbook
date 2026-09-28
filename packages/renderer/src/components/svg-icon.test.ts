import { describe, expect, it } from "vitest";
import { svgIconUrl } from "./svg-icon.js";

describe("svgIconUrl", () => {
  it("preserves case-sensitive SVG data when Tasty lowercases the style", () => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M1 2H3Z"/></svg>';
    const [, payload] = svgIconUrl(svg).toLowerCase().split(",", 2);

    expect(decodeURIComponent(payload ?? "")).toBe(svg);
  });
});
