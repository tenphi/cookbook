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
      if (group.querySelector(':scope > ul [aria-current="page"]'))
        group.open = true;
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
      const summary = group.querySelector<HTMLElement>(":scope > summary");
      const link = summary?.querySelector<HTMLAnchorElement>(
        "a[data-cookbook-group-link]",
      );
      let previousOpen = group.open;
      const syncExpanded = () =>
        link?.setAttribute("aria-expanded", String(group.open));
      const saveOpen = () => {
        previousOpen = group.open;
        saved[group.dataset.sidebarGroup!] = group.open;
        try {
          sessionStorage.setItem(key, JSON.stringify(saved));
        } catch {
          // Remembering expansion is optional.
        }
      };
      syncExpanded();
      window.addEventListener(
        "pageshow",
        (event) => {
          if (
            !event.persisted ||
            !group.querySelector(':scope > ul [aria-current="page"]')
          )
            return;
          // Back/Forward may restore the old DOM without reconnecting this
          // element. Reveal its current page without changing saved choices.
          previousOpen = true;
          group.open = true;
          syncExpanded();
        },
        { signal },
      );
      if (link && summary) {
        summary.addEventListener(
          "click",
          (event) => {
            if (
              event.defaultPrevented ||
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            // The entire row follows the link, including the summary's edges.
            if (
              !(event.target instanceof Node) ||
              !link.contains(event.target)
            ) {
              event.preventDefault();
              link.click();
              return;
            }
            const current = link.getAttribute("aria-current") === "page";
            group.open = current ? !group.open : true;
            syncExpanded();
            // Persist before navigation: the native toggle event is queued and
            // may never run before the browser unloads this document.
            saveOpen();
            if (current) event.preventDefault();
          },
          { signal },
        );
        link.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === " " &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.altKey &&
              !event.shiftKey
            ) {
              event.preventDefault();
              if (!event.repeat) link.click();
            }
          },
          { signal },
        );
      }
      group.addEventListener(
        "toggle",
        () => {
          syncExpanded();
          // Ignore queued events caused by parsing or restoring the markup.
          if (group.open === previousOpen) return;
          saveOpen();
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
