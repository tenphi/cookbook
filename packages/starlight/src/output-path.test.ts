import { describe, expect, it } from "vitest";
import { outputPathForPublicAsset } from "./output-path.js";

describe("outputPathForPublicAsset", () => {
  it("maps root-relative asset URLs into the build output", () => {
    expect(outputPathForPublicAsset("/_tasty-assets/hero.svg", "/")).toBe(
      "_tasty-assets/hero.svg",
    );
  });

  it("removes the Astro base from the filesystem destination", () => {
    expect(
      outputPathForPublicAsset("/manual/_tasty-assets/hero.svg", "/manual/"),
    ).toBe("_tasty-assets/hero.svg");
    expect(
      outputPathForPublicAsset("manual/_tasty-assets/hero.svg", "/manual"),
    ).toBe("_tasty-assets/hero.svg");
  });

  it("rejects paths outside the configured base or with traversal", () => {
    expect(() =>
      outputPathForPublicAsset("/_tasty-assets/hero.svg", "/manual/"),
    ).toThrow(/outside the configured base/);
    expect(() =>
      outputPathForPublicAsset("/manual/../hero.svg", "/manual/"),
    ).toThrow(/not safe to emit/);
  });
});
