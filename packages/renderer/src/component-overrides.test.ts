import { describe, expect, it } from "vitest";
import { resolveComponentOverrides } from "./component-overrides.js";

const defaults = {
  Footer: "/cookbook/Footer.astro",
  Header: "/cookbook/Header.astro",
};

describe("component overrides", () => {
  it("uses the Cookbook footer by default", () => {
    expect(
      resolveComponentOverrides(defaults, undefined, "/cookbook/Empty.astro"),
    ).toEqual(defaults);
  });

  it("replaces the footer with a configured component", () => {
    expect(
      resolveComponentOverrides(
        defaults,
        { Footer: "./src/Footer.astro" },
        "/cookbook/Empty.astro",
      ),
    ).toMatchObject({ Footer: "./src/Footer.astro" });
  });

  it("resolves a disabled footer to an empty component", () => {
    expect(
      resolveComponentOverrides(
        defaults,
        { Footer: false },
        "/cookbook/Empty.astro",
      ),
    ).toMatchObject({ Footer: "/cookbook/Empty.astro" });
  });
});
