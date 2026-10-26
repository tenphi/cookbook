// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("registers cb-popover and cb-dialog once", async () => {
  await import("./elements.js");
  const popover = customElements.get("cb-popover");
  const dialog = customElements.get("cb-dialog");
  expect(popover).toBeDefined();
  expect(dialog).toBeDefined();
  expect(customElements.get("uni-popover")).toBeUndefined();

  // A second copy of the module skips names that are already defined.
  vi.resetModules();
  await import("./elements.js");
  expect(customElements.get("cb-popover")).toBe(popover);
  expect(customElements.get("cb-dialog")).toBe(dialog);
});

it("imports without customElements, as during server rendering", async () => {
  vi.stubGlobal("customElements", undefined);
  await expect(import("./elements.js")).resolves.toBeDefined();
});
