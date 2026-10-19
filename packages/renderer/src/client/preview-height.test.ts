// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PREVIEW_HEIGHT_MESSAGE,
  initializePreviewHeight,
} from "./preview-height.js";

afterEach(() => document.body.replaceChildren());

describe("preview frame sizing", () => {
  function mount() {
    document.body.innerHTML =
      '<figure data-element="Preview"><div data-element="Stage"><iframe></iframe></div></figure>' +
      '<figure data-element="Preview"><div data-element="Stage"><iframe></iframe></div></figure>' +
      "<iframe></iframe>";
    const [first, second, other] = [...document.querySelectorAll("iframe")].map(
      (frame) => {
        const contentWindow = { postMessage: vi.fn() };
        Object.defineProperty(frame, "contentWindow", { value: contentWindow });
        return { frame, contentWindow };
      },
    );
    return { first: first!, second: second!, other: other! };
  }

  const report = (source: unknown, data: unknown) =>
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        source: source as MessageEventSource,
      }),
    );

  it("asks each preview frame for its height", () => {
    const { first, second, other } = mount();
    initializePreviewHeight();
    for (const { contentWindow } of [first, second])
      expect(contentWindow.postMessage).toHaveBeenCalledExactlyOnceWith(
        { type: PREVIEW_HEIGHT_MESSAGE },
        "*",
      );
    expect(other.contentWindow.postMessage).not.toHaveBeenCalled();
  });

  it("sets the reporting frame's height and follows it up and down", () => {
    const { first, second } = mount();
    initializePreviewHeight();
    report(first.contentWindow, {
      type: PREVIEW_HEIGHT_MESSAGE,
      height: 344.2,
    });
    expect(first.frame.style.height).toBe("345px");
    expect(second.frame.style.height).toBe("");
    report(first.contentWindow, { type: PREVIEW_HEIGHT_MESSAGE, height: 120 });
    expect(first.frame.style.height).toBe("120px");
  });

  it("adds the frame's buffer below the content", () => {
    const { first } = mount();
    first.frame.dataset.buffer = "12rem";
    initializePreviewHeight();
    report(first.contentWindow, {
      type: PREVIEW_HEIGHT_MESSAGE,
      height: 344.2,
    });
    expect(first.frame.style.height).toBe("calc(345px + 12rem)");
  });

  it("ignores messages from other windows", () => {
    const { first, other } = mount();
    initializePreviewHeight();
    for (const source of [other.contentWindow, window, null])
      report(source, { type: PREVIEW_HEIGHT_MESSAGE, height: 600 });
    expect(first.frame.style.height).toBe("");
    expect(other.frame.style.height).toBe("");
  });

  it.each([
    { type: "other", height: 600 },
    { type: PREVIEW_HEIGHT_MESSAGE },
    { type: PREVIEW_HEIGHT_MESSAGE, height: "600" },
    { type: PREVIEW_HEIGHT_MESSAGE, height: -1 },
    { type: PREVIEW_HEIGHT_MESSAGE, height: Number.NaN },
    { type: PREVIEW_HEIGHT_MESSAGE, height: Number.POSITIVE_INFINITY },
    "600",
    null,
  ])("ignores the message %j", (data) => {
    const { first } = mount();
    initializePreviewHeight();
    report(first.contentWindow, data);
    expect(first.frame.style.height).toBe("");
  });
});
