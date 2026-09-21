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
        <details data-sidebar-group="child">
          <summary>Child</summary>
          <a href="/manual/page" ${current ? 'aria-current="page"' : ""}>Page</a>
        </details>
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
