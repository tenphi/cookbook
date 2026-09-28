// @vitest-environment happy-dom
import { afterEach, expect, it } from "vitest";
import "./mobile-toc.js";
afterEach(() => document.body.replaceChildren());
it("closes on navigation and moves focus to the destination without trapping it", () => {
  document.body.innerHTML =
    '<cookbook-mobile-toc><details open><summary>On this page</summary><a href="#heading">Heading</a></details></cookbook-mobile-toc><h2 id="heading">Heading</h2><button>Next</button>';
  document.querySelector("a")!.click();
  expect(document.querySelector("details")!.open).toBe(false);
  expect(document.activeElement).toBe(document.querySelector("h2"));
  document.querySelector("button")!.focus();
  expect(document.querySelector("h2")!.hasAttribute("tabindex")).toBe(false);
});
it("preserves disclosure and focus for modified navigation", () => {
  document.body.innerHTML =
    '<cookbook-mobile-toc><details open><summary>Contents</summary><a href="#heading">Heading</a></details></cookbook-mobile-toc><h2 id="heading">Heading</h2>';
  document
    .querySelector("a")!
    .dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
  expect(document.querySelector("details")!.open).toBe(true);
});
