// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./sidebar.js";

const key = "cookbook-sidebar:/manual/:guide";
let desktop = true;

function mount(current = false, storageKey = key) {
  const scroller = document.createElement("aside");
  scroller.id = "starlight__sidebar";
  scroller.innerHTML = `
    <cookbook-sidebar data-storage-key="${storageKey}">
      <details data-sidebar-group="parent">
        <summary>Parent</summary>
        <ul><li><details data-sidebar-group="child">
          <summary>Child</summary>
          <ul><li><a href="/manual/page" ${current ? 'aria-current="page"' : ""}>Page</a></li></ul>
        </details></li></ul>
      </details>
      <details data-sidebar-group="other"><summary>Other</summary></details>
    </cookbook-sidebar>`;
  document.body.append(scroller);
  const root = scroller.querySelector("cookbook-sidebar")!;
  const groups = Array.from(root.querySelectorAll("details"));
  return { scroller, root, groups };
}

beforeEach(() => {
  desktop = true;
  sessionStorage.clear();
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return desktop;
    },
  }));
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("sidebar persistence", () => {
  it("keeps unrelated groups closed and opens every current-page ancestor", () => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ parent: false, child: false }),
    );
    const { groups } = mount(true);
    expect(groups.map((group) => group.open)).toEqual([true, true, false]);
  });

  it("remembers independent disclosures without mixing navigation tabs", () => {
    const { root, groups } = mount();
    groups[0].open = true;
    groups[0].dispatchEvent(new Event("toggle"));
    root.remove();
    expect(mount().groups.map((group) => group.open)).toEqual([
      true,
      false,
      false,
    ]);
    expect(
      mount(false, `${key}:other-tab`).groups.map((group) => group.open),
    ).toEqual([false, false, false]);
  });

  it("does not turn restored or automatically opened groups into user choices", () => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ parent: false, child: false, other: true }),
    );
    const { groups } = mount(true);
    // Native details can emit queued toggle events after restoration.
    for (const group of groups) group.dispatchEvent(new Event("toggle"));
    expect(mount().groups.map((group) => group.open)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it.each(["{broken", "null", "[]", '"invalid"'])(
    "retains native disclosure defaults with malformed state: %s",
    (value) => {
      sessionStorage.setItem(key, value);
      const { groups } = mount();
      expect(groups.every((group) => !group.open)).toBe(true);
      groups[0].open = true;
      expect(() => groups[0].dispatchEvent(new Event("toggle"))).not.toThrow();
    },
  );

  it("keeps the sidebar usable when browser storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem() {
        throw new Error("Storage blocked");
      },
      setItem() {
        throw new Error("Storage blocked");
      },
    });
    const { groups, scroller } = mount();
    groups[0].open = true;
    expect(() => groups[0].dispatchEvent(new Event("toggle"))).not.toThrow();
    expect(() => scroller.dispatchEvent(new Event("scroll"))).not.toThrow();
    expect(groups[0].open).toBe(true);
  });

  it("restores desktop scroll without overwriting it from the mobile menu", () => {
    sessionStorage.setItem(`${key}:scroll`, "240");
    expect(mount().scroller.scrollTop).toBe(240);
    desktop = false;
    const { scroller } = mount();
    expect(scroller.scrollTop).toBe(0);
    scroller.scrollTop = 600;
    scroller.dispatchEvent(new Event("scroll"));
    expect(sessionStorage.getItem(`${key}:scroll`)).toBe("240");
  });

  it.each(["NaN", "Infinity", "-50"])(
    "ignores invalid saved scroll positions: %s",
    (value) => {
      sessionStorage.setItem(`${key}:scroll`, value);
      expect(mount().scroller.scrollTop).toBe(0);
    },
  );

  it("removes listeners when disconnected and attaches them once on reconnection", () => {
    const { root, groups, scroller } = mount();
    const save = vi.spyOn(sessionStorage, "setItem");
    root.remove();
    scroller.dispatchEvent(new Event("scroll"));
    groups[0].dispatchEvent(new Event("toggle"));
    expect(save).not.toHaveBeenCalled();
    scroller.append(root);
    save.mockClear();
    groups[0].open = true;
    groups[0].dispatchEvent(new Event("toggle"));
    expect(save).toHaveBeenCalledTimes(1);
  });
});

function mountLinked(current?: "parent" | "child" | "leaf") {
  const root = document.createElement("cookbook-sidebar");
  root.dataset.storageKey = key;
  root.innerHTML = `
    <details data-sidebar-group="parent" ${current ? "open" : ""}>
      <summary tabindex="-1"><a href="/manual/parent" data-cookbook-group-link
        ${current === "parent" ? 'aria-current="page"' : ""}>Parent<svg></svg></a></summary>
      <ul><li><details data-sidebar-group="child" ${current === "child" || current === "leaf" ? "open" : ""}>
        <summary tabindex="-1"><a href="/manual/child" data-cookbook-group-link
          ${current === "child" ? 'aria-current="page"' : ""}>Child</a></summary>
        <ul><li><a href="/manual/leaf" ${current === "leaf" ? 'aria-current="page"' : ""}>Leaf</a></li></ul>
      </details></li></ul>
    </details>`;
  document.body.append(root);
  const groups = Array.from(root.querySelectorAll("details"));
  // Happy DOM incorrectly toggles details for clicks on interactive descendants.
  // Bypass that simulated default action; native link/disclosure interaction is
  // also checked in the browser against the built reference site.
  for (const group of groups) {
    vi.spyOn(group, "dispatchEvent").mockImplementation((event) =>
      HTMLElement.prototype.dispatchEvent.call(group, event),
    );
  }
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>("summary > a"),
  );
  return { root, groups, links };
}

const activate = (element: Element, options: MouseEventInit = {}) => {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
};

describe("linked sidebar groups", () => {
  it("collapses the current parent without reloading and remembers it", () => {
    const { groups, links } = mountLinked("parent");
    expect(activate(links[0]).defaultPrevented).toBe(true);
    expect(groups[0].open).toBe(false);
    expect(links[0].getAttribute("aria-expanded")).toBe("false");
    expect(mountLinked("parent").groups[0].open).toBe(false);
    expect(activate(links[0]).defaultPrevented).toBe(true);
    expect(groups[0].open).toBe(true);
  });

  it("selects an open parent first and requires a second click to collapse it", () => {
    const { groups, links } = mountLinked("leaf");
    expect(activate(links[0]).defaultPrevented).toBe(false);
    expect(groups[0].open).toBe(true);
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual({ parent: true });
    const selected = mountLinked("parent");
    expect(selected.groups[0].open).toBe(true);
    expect(activate(selected.links[0]).defaultPrevented).toBe(true);
    expect(selected.groups[0].open).toBe(false);
    expect(mountLinked("parent").groups[0].open).toBe(false);
    // Back/direct navigation to the leaf must reveal it again.
    expect(mountLinked("leaf").groups.map((group) => group.open)).toEqual([
      true,
      true,
    ]);
  });

  it("reveals the current page when Back restores the cached document", () => {
    const { groups, links } = mountLinked("leaf");
    groups[0].open = false;
    groups[0].dispatchEvent(new Event("toggle"));
    expect(groups[0].open).toBe(false);
    window.dispatchEvent(
      Object.assign(new Event("pageshow"), { persisted: true }),
    );
    expect(groups.map((group) => group.open)).toEqual([true, true]);
    expect(links[0].getAttribute("aria-expanded")).toBe("true");
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual({ parent: false });
  });

  it("opens a linked group and follows its page when activated elsewhere", () => {
    const { groups, links } = mountLinked();
    expect(activate(links[0]).defaultPrevented).toBe(false);
    expect(groups[0].open).toBe(true);
    expect(mountLinked("parent").groups[0].open).toBe(true);
  });

  it("reveals a selected nested header but honors its own collapsed state", () => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ parent: false, child: false }),
    );
    const { groups, links } = mountLinked("child");
    expect(groups.map((group) => group.open)).toEqual([true, false]);
    expect(links.map((link) => link.getAttribute("aria-expanded"))).toEqual([
      "true",
      "false",
    ]);
  });

  it.each([
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])(
    "preserves normal link behavior for modified activation: %j",
    (options) => {
      const { groups, links } = mountLinked("parent");
      expect(activate(links[0], options).defaultPrevented).toBe(false);
      expect(groups[0].open).toBe(true);
      expect(sessionStorage.getItem(key)).toBeNull();
    },
  );

  it("treats the caret and the summary edge as the same linked control", () => {
    const { groups, links } = mountLinked("parent");
    activate(links[0].querySelector("svg")!);
    expect(groups[0].open).toBe(false);
    activate(groups[0].querySelector("summary")!);
    expect(groups[0].open).toBe(true);
  });

  it("supports Space without scrolling or repeated toggles while held", () => {
    const { groups, links } = mountLinked("parent");
    const space = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    links[0].dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(groups[0].open).toBe(false);
    links[0].dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", repeat: true }),
    );
    expect(groups[0].open).toBe(false);
  });

  it("updates the exposed expansion state after native toggles", () => {
    const { groups, links } = mountLinked();
    groups[0].open = true;
    groups[0].dispatchEvent(new Event("toggle"));
    expect(links[0].getAttribute("aria-expanded")).toBe("true");
  });
});
