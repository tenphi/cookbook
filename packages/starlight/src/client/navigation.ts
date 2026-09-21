export {};

class CookbookSidebarPane extends HTMLElement {
  #listeners?: AbortController;
  #inert = new Map<HTMLElement, boolean>();
  #trigger: HTMLButtonElement | undefined;

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;
    this.#trigger =
      document.querySelector<HTMLButtonElement>(
        '.td-menu-button[popovertarget="starlight__sidebar"]',
      ) ?? undefined;
    const desktop = matchMedia("(min-width: 50rem)");
    const syncViewport = () => {
      if (desktop.matches) {
        if (this.matches(":popover-open")) this.hidePopover();
        this.#release();
        this.popover = null;
        this.removeAttribute("role");
        this.removeAttribute("aria-modal");
      } else {
        this.popover = "auto";
        this.setAttribute("role", "dialog");
        this.setAttribute("aria-modal", "true");
      }
    };
    syncViewport();
    desktop.addEventListener("change", syncViewport, { signal });
    this.addEventListener(
      "toggle",
      () => {
        const open = !desktop.matches && this.matches(":popover-open");
        this.#trigger?.setAttribute("aria-expanded", String(open));
        if (open) {
          for (const element of document.querySelectorAll<HTMLElement>(
            ".header, .main-frame, .sl-skip-link",
          )) {
            this.#inert.set(element, element.inert);
            element.inert = true;
          }
          this.querySelector<HTMLElement>("[autofocus]")?.focus();
        } else {
          const restoreFocus =
            this.contains(document.activeElement) ||
            document.activeElement === document.body;
          this.#release();
          if (restoreFocus && !desktop.matches) this.#trigger?.focus();
        }
      },
      { signal },
    );
    this.addEventListener(
      "keydown",
      (event) => {
        if (desktop.matches || !this.matches(":popover-open")) return;
        const sections = this.querySelector<HTMLDetailsElement>(
          ".td-mobile-tabs details[open]",
        );
        if (event.key === "Escape" && sections) {
          event.preventDefault();
          sections.open = false;
          sections.querySelector("summary")?.focus();
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          this.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), summary, [tabindex="0"]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 && element.getClientRects().length > 0,
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) {
          event.preventDefault();
          this.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === this)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      },
      { signal },
    );
    this.addEventListener(
      "click",
      (event) => {
        if (
          !event.defaultPrevented &&
          event.target instanceof Element &&
          event.target.closest("a[href]") &&
          this.matches(":popover-open")
        )
          this.hidePopover();
      },
      { signal },
    );
  }

  #release() {
    for (const [element, inert] of this.#inert) element.inert = inert;
    this.#inert.clear();
    this.#trigger?.setAttribute("aria-expanded", "false");
  }

  disconnectedCallback() {
    this.#listeners?.abort();
    this.#release();
  }
}

class CookbookHeaderLinks extends HTMLElement {
  #listeners?: AbortController;
  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;
    const panel = this.querySelector<HTMLElement>("[popover]");
    const desktop = matchMedia("(min-width: 50rem)");
    const close = () => {
      if (panel?.matches(":popover-open")) panel.hidePopover();
    };
    desktop.addEventListener(
      "change",
      () => {
        if (desktop.matches) close();
      },
      { signal },
    );
    panel?.addEventListener(
      "click",
      (event) => {
        if (event.target instanceof Element && event.target.closest("a[href]"))
          close();
      },
      { signal },
    );
  }
  disconnectedCallback() {
    this.#listeners?.abort();
  }
}

if (!customElements.get("cookbook-sidebar-pane"))
  customElements.define("cookbook-sidebar-pane", CookbookSidebarPane);
if (!customElements.get("cookbook-header-links"))
  customElements.define("cookbook-header-links", CookbookHeaderLinks);
