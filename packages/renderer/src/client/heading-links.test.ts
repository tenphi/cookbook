// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initializeHeadingLinks } from "./heading-links.js";

const writeText = vi.fn<(value: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue();
  vi.spyOn(navigator, "clipboard", "get").mockReturnValue({
    writeText,
  } as unknown as Clipboard);
  document.execCommand = vi.fn();
  window.history.replaceState(null, "", "/docs/guide/?lang=en#previous");
  document.body.innerHTML =
    '<div class="sl-markdown-content"><div class="sl-heading-wrapper"><h2 id="install">Install &amp; configure</h2><a class="sl-anchor-link" href="#install"><span class="sl-anchor-icon">#</span></a></div></div>';
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "execCommand");
  vi.useRealTimers();
});

function mount() {
  initializeHeadingLinks();
  return document.querySelector<HTMLAnchorElement>(".sl-anchor-link")!;
}

async function click(link: HTMLElement, options: MouseEventInit = {}) {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  link.dispatchEvent(event);
  await Promise.resolve();
  await Promise.resolve();
  return event;
}

describe("heading link copying", () => {
  it("copies the full section URL without navigating and briefly confirms success", async () => {
    const link = mount();
    const previousUrl = window.location.href;
    expect(link.getAttribute("role")).toBe("button");
    expect(link.getAttribute("aria-label")).toBe(
      "Copy link to “Install & configure”",
    );
    const event = await click(link);
    expect(event.defaultPrevented).toBe(true);
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/docs/guide/?lang=en#install`,
    );
    expect(window.location.href).toBe(previousUrl);
    expect(link.dataset.copyState).toBe("copied");
    expect(link.title).toBe("Link copied");
    expect(document.querySelector('[role="status"]')?.textContent).toBe(
      "Link copied: Install & configure",
    );
    vi.advanceTimersByTime(2_000);
    expect(link.dataset.copyState).toBeUndefined();
    expect(link.getAttribute("aria-label")).toBe(
      "Copy link to “Install & configure”",
    );
  });

  it("keeps native links for modified clicks and ignores already handled clicks", async () => {
    const link = mount();
    expect(link.getAttribute("href")).toBe("#install");
    for (const options of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      expect((await click(link, options)).defaultPrevented).toBe(false);
    }
    const event = new MouseEvent("click", { cancelable: true });
    event.preventDefault();
    link.dispatchEvent(event);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("supports Space activation and initializes each link only once", async () => {
    const link = mount();
    initializeHeadingLinks();
    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    link.dispatchEvent(event);
    await Promise.resolve();
    await Promise.resolve();
    expect(event.defaultPrevented).toBe(true);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1);
    link.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", repeat: true }),
    );
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("reports clipboard failures without showing a success indicator", async () => {
    writeText.mockRejectedValue(new Error("Permission denied"));
    const link = mount();
    await click(link);
    expect(link.dataset.copyState).toBe("error");
    expect(link.title).toBe("Could not copy link");
    expect(document.querySelector('[role="status"]')?.textContent).toContain(
      "Could not copy link",
    );
    vi.advanceTimersByTime(2_000);
    expect(link.title).toBe("Copy link to “Install & configure”");
  });

  it("ignores stale clipboard completions after a newer copy", async () => {
    let rejectFirst!: (error: Error) => void;
    writeText.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectFirst = reject;
        }),
    );
    const link = mount();
    await click(link);
    await click(link);
    rejectFirst(new Error("Old request failed"));
    await Promise.resolve();
    await Promise.resolve();
    expect(link.dataset.copyState).toBe("copied");
  });

  it.each([true, false])(
    "falls back without Clipboard API and restores focus and selection (copy=%s)",
    async (copied) => {
      vi.spyOn(navigator, "clipboard", "get").mockReturnValue(
        undefined as unknown as Clipboard,
      );
      const execCommand = vi
        .spyOn(document, "execCommand")
        .mockImplementation(() => {
          expect(document.querySelector("textarea")?.value).toBe(
            `${window.location.origin}/docs/guide/?lang=en#install`,
          );
          return copied;
        });
      const link = mount();
      link.focus();
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("h2")!);
      window.getSelection()!.addRange(range);
      await click(link);
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(document.activeElement).toBe(link);
      expect(window.getSelection()!.toString()).toBe("Install & configure");
      expect(document.querySelector("textarea")).toBeNull();
      expect(link.dataset.copyState).toBe(copied ? "copied" : "error");
    },
  );
});
