class CookbookMobileToc extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this.navigate);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.navigate);
  }
  navigate = (event: MouseEvent) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
        : null;
    if (!link || !this.contains(link)) return;
    const target = document.getElementById(
      decodeURIComponent(link.hash.slice(1)),
    );
    if (!target) return;
    const details = this.querySelector("details");
    if (details) details.open = false;
    if (!target.hasAttribute("tabindex")) {
      target.tabIndex = -1;
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true },
      );
    }
    target.focus({ preventScroll: true });
  };
}
if (!customElements.get("cookbook-mobile-toc"))
  customElements.define("cookbook-mobile-toc", CookbookMobileToc);
