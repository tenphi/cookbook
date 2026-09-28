class CookbookTableOfContents extends HTMLElement {
  #entries: Array<{ link: HTMLAnchorElement; heading: HTMLElement }> = [];
  #active?: HTMLAnchorElement;
  #listeners?: AbortController;
  #frame = 0;

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();
    this.#entries = Array.from(
      this.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]'),
    ).flatMap((link) => {
      const heading = document.getElementById(
        decodeURIComponent(link.hash.slice(1)),
      );
      return heading ? [{ link, heading }] : [];
    });
    if (this.#entries.length === 0) return;

    const options = { signal: this.#listeners.signal };
    window.addEventListener("scroll", this.#schedule, {
      ...options,
      passive: true,
    });
    window.addEventListener("resize", this.#schedule, options);
    window.addEventListener("hashchange", this.#schedule, options);
    this.#schedule();
  }

  disconnectedCallback() {
    this.#listeners?.abort();
    cancelAnimationFrame(this.#frame);
  }

  #schedule = () => {
    if (!this.#frame) this.#frame = requestAnimationFrame(this.#sync);
  };

  #sync = () => {
    this.#frame = 0;
    const header = document.querySelector<HTMLElement>(".header");
    const marker = (header?.getBoundingClientRect().bottom ?? 0) + 24;
    let current = this.#entries[0];
    for (const entry of this.#entries) {
      if (entry.heading.getBoundingClientRect().top > marker + 2) break;
      current = entry;
    }
    if (
      window.scrollY > 0 &&
      window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
    )
      current = this.#entries.at(-1);
    if (!current || current.link === this.#active) return;

    this.#active?.removeAttribute("aria-current");
    current.link.setAttribute("aria-current", "location");
    this.#active = current.link;

    const sidebar = this.closest<HTMLElement>(".right-sidebar");
    if (!sidebar || sidebar.getClientRects().length === 0) return;
    const sidebarRect = sidebar.getBoundingClientRect();
    const linkRect = current.link.getBoundingClientRect();
    if (linkRect.top < sidebarRect.top + 16)
      sidebar.scrollTop += linkRect.top - sidebarRect.top - 16;
    else if (linkRect.bottom > sidebarRect.bottom - 16)
      sidebar.scrollTop += linkRect.bottom - sidebarRect.bottom + 16;
  };
}

if (!customElements.get("cookbook-table-of-contents"))
  customElements.define("cookbook-table-of-contents", CookbookTableOfContents);
