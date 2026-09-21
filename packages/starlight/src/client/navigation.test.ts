// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./navigation.js";

let desktop: boolean;
let media: EventTarget & { readonly matches: boolean };

beforeEach(() => {
  desktop = false;
  media = Object.assign(new EventTarget(), {
    get matches() {
      return desktop;
    },
  });
  Object.defineProperty(media, "matches", { get: () => desktop });
  vi.stubGlobal("matchMedia", () => media);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue({
    length: 1,
  } as DOMRectList);
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function popover(element: HTMLElement) {
  let open = false;
  const matches = element.matches.bind(element);
  vi.spyOn(element, "matches").mockImplementation((selector) =>
    selector === ":popover-open" ? open : matches(selector),
  );
  const toggle = (value: boolean) => {
    open = value;
    element.dispatchEvent(new Event("toggle"));
  };
  element.hidePopover = vi.fn(() => toggle(false));
  return { toggle, isOpen: () => open };
}

function mount() {
  document.body.innerHTML =
    '<a class="sl-skip-link" href="#main">Skip</a><header class="header"><button class="td-menu-button" popovertarget="starlight__sidebar">Open</button></header><main class="main-frame" id="main"></main>';
  const pane = document.createElement("cookbook-sidebar-pane");
  pane.id = "starlight__sidebar";
  pane.innerHTML =
    '<a href="/">Home</a><button autofocus>Close</button><nav class="td-mobile-tabs"><details><summary>Sections</summary><a href="/guide">Guide</a></details></nav><a href="/next">Next</a>';
  const state = popover(pane);
  document.body.append(pane);
  return {
    pane,
    ...state,
    trigger: document.querySelector<HTMLButtonElement>(".td-menu-button")!,
    main: document.querySelector<HTMLElement>(".main-frame")!,
    header: document.querySelector<HTMLElement>(".header")!,
    close: pane.querySelector("button")!,
  };
}

describe("responsive navigation", () => {
  it("isolates the mobile drawer and restores prior inert state and focus on close", () => {
    const { pane, toggle, trigger, main, header, close } = mount();
    main.inert = true;
    toggle(true);
    expect(pane.hasAttribute("data-open")).toBe(true);
    expect(pane.getAttribute("role")).toBe("dialog");
    expect(header.inert).toBe(true);
    expect(document.activeElement).toBe(close);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    toggle(false);
    expect(pane.hasAttribute("data-open")).toBe(false);
    expect(header.inert).toBe(false);
    expect(main.inert).toBe(true);
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("wraps keyboard focus inside the open drawer", () => {
    const { pane, toggle } = mount();
    toggle(true);
    const first = pane.querySelector("a")!;
    const last = pane.querySelector<HTMLAnchorElement>('a[href="/next"]')!;
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(first);
  });

  it("closes the section selector first on Escape", () => {
    const { pane, toggle, isOpen } = mount();
    toggle(true);
    const details = pane.querySelector("details")!;
    details.open = true;
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    details.dispatchEvent(escape);
    expect(details.open).toBe(false);
    expect(escape.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(details.querySelector("summary"));
    expect(isOpen()).toBe(true);
  });

  it("dismisses page links while preserving prevented disclosure clicks", () => {
    const { pane, toggle, isOpen } = mount();
    const link = pane.querySelector<HTMLAnchorElement>('a[href="/next"]')!;
    toggle(true);
    const prevented = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    prevented.preventDefault();
    link.dispatchEvent(prevented);
    expect(isOpen()).toBe(true);
    link.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(isOpen()).toBe(false);
  });

  it("releases the page when resizing to desktop or removing the drawer", () => {
    const { pane, toggle, header, main } = mount();
    toggle(true);
    desktop = true;
    media.dispatchEvent(new Event("change"));
    expect(pane.popover).toBeNull();
    expect(pane.hasAttribute("data-open")).toBe(false);
    expect(pane.hasAttribute("role")).toBe(false);
    expect(header.inert).toBe(false);
    expect(main.inert).toBe(false);
    desktop = false;
    media.dispatchEvent(new Event("change"));
    expect(pane.popover).toBe("auto");
    toggle(true);
    pane.remove();
    expect(pane.hasAttribute("data-open")).toBe(false);
    expect(header.inert).toBe(false);
    expect(main.inert).toBe(false);
  });

  it("dismisses More on navigation and desktop resize, including pages without a sidebar", () => {
    const menu = document.createElement("cookbook-header-links");
    menu.innerHTML = '<div popover="auto"><a href="/next">Next</a></div>';
    const panel = menu.querySelector("div")!;
    const { toggle, isOpen } = popover(panel);
    document.body.append(menu);
    toggle(true);
    panel
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(isOpen()).toBe(false);
    toggle(true);
    desktop = true;
    media.dispatchEvent(new Event("change"));
    expect(isOpen()).toBe(false);
  });
});
