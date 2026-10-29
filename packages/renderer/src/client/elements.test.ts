// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("registers cookbook-popover and cookbook-dialog once", async () => {
  await import("./elements.js");
  const popover = customElements.get("cookbook-popover");
  const dialog = customElements.get("cookbook-dialog");
  expect(popover).toBeDefined();
  expect(dialog).toBeDefined();
  for (const name of ["cb-popover", "cb-dialog", "uni-popover", "uni-dialog"])
    expect(customElements.get(name)).toBeUndefined();

  // A second copy of the module skips names that are already defined.
  vi.resetModules();
  await import("./elements.js");
  expect(customElements.get("cookbook-popover")).toBe(popover);
  expect(customElements.get("cookbook-dialog")).toBe(dialog);
});

it("imports without customElements, as during server rendering", async () => {
  vi.stubGlobal("customElements", undefined);
  await expect(import("./elements.js")).resolves.toBeDefined();
});
