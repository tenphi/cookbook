// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import "./page-copy.js";
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});
function actions() {
  document.body.innerHTML =
    '<cookbook-page-actions><button data-copy-page="/page.md">Copy page</button><span role="status"></span></cookbook-page-actions>';
  return {
    button: document.querySelector("button")!,
    status: document.querySelector("[role=status]")!,
  };
}
describe("copy page", () => {
  it("retains keyboard focus and ignores repeated requests while pending", async () => {
    const { button, status } = actions();
    let finish!: (value: Response) => void;
    const fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    button.focus();
    button.click();
    button.click();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    finish(new Response('---\ntitle: "Guide"\n---\n# Guide'));
    await vi.waitFor(() => expect(status.textContent).toBe("Page copied"));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("# Guide"));
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(document.activeElement).toBe(button);
  });
  it("reports blocked clipboard or invalid page responses and allows retry", async () => {
    const { button, status } = actions();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>404</html>")),
    );
    const writeText = vi.fn().mockRejectedValue(Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    button.click();
    await vi.waitFor(() =>
      expect(status.textContent).toContain("Download Markdown"),
    );
    expect(writeText).not.toHaveBeenCalled();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("---\nTitle")),
    );
    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(status.textContent).toContain("Download Markdown");
    expect(button.hasAttribute("aria-disabled")).toBe(false);
  });
});
