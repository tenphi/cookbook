export {};

class CookbookSidebar extends HTMLElement {
  #listeners: AbortController | undefined;

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;
    const key = this.dataset.storageKey;
    if (!key) return;
    const desktop = matchMedia("(min-width: 50rem)");
    const groups = this.querySelectorAll<HTMLDetailsElement>(
      "details[data-sidebar-group]",
    );
    const scroller = this.closest<HTMLElement>("#starlight__sidebar");
    let saved: Record<string, boolean> = {};
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(key) || "{}");
      if (value && typeof value === "object" && !Array.isArray(value)) {
        saved = Object.fromEntries(
          Object.entries(value).filter(([, open]) => typeof open === "boolean"),
        );
      }
    } catch {
      // Native disclosures still work when session storage is unavailable.
    }
    for (const group of groups) {
      const savedOpen = saved[group.dataset.sidebarGroup!];
      // Always reveal the current page, even if its branch was closed before.
      if (group.querySelector('[aria-current="page"]')) group.open = true;
      else if (typeof savedOpen === "boolean") group.open = savedOpen;
    }
    try {
      if (scroller && desktop.matches) {
        const scroll = Number(sessionStorage.getItem(`${key}:scroll`));
        if (Number.isFinite(scroll) && scroll >= 0) scroller.scrollTop = scroll;
      }
    } catch {
      // Native disclosures still work when session storage is unavailable.
    }
    for (const group of groups) {
      let previousOpen = group.open;
      group.addEventListener(
        "toggle",
        () => {
          // Ignore queued events caused by parsing or restoring the markup.
          if (group.open === previousOpen) return;
          previousOpen = group.open;
          saved[group.dataset.sidebarGroup!] = group.open;
          try {
            sessionStorage.setItem(key, JSON.stringify(saved));
          } catch {
            // Remembering expansion is optional.
          }
        },
        { signal },
      );
    }
    scroller?.addEventListener(
      "scroll",
      () => {
        if (!desktop.matches) return;
        try {
          sessionStorage.setItem(`${key}:scroll`, String(scroller.scrollTop));
        } catch {
          // Scroll restoration is optional too.
        }
      },
      { passive: true, signal },
    );
  }

  disconnectedCallback() {
    this.#listeners?.abort();
  }
}
if (!customElements.get("cookbook-sidebar")) {
  customElements.define("cookbook-sidebar", CookbookSidebar);
}
