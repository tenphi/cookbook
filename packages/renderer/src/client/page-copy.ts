import { message } from "./messages.js";
class CookbookPageActions extends HTMLElement {
  #resetTimer: number | undefined;
  connectedCallback() {
    this.addEventListener("click", this.copy);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.copy);
    this.#resetCopyState();
  }
  copy = async (event: Event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-copy-page]")
        : null;
    if (
      !button ||
      !this.contains(button) ||
      button.getAttribute("aria-disabled") === "true"
    )
      return;
    const status = this.querySelector<HTMLElement>('[role="status"]');
    button.setAttribute("aria-disabled", "true");
    this.#resetCopyState();
    if (status) status.textContent = "";
    try {
      const response = await fetch(button.dataset.copyPage!, {
        credentials: "same-origin",
      });
      if (!response.ok) throw Error("Page text unavailable");
      const text = await response.text();
      if (!text.startsWith("---\n")) throw Error("Unexpected page response");
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = message("pageCopied");
      // Briefly confirm the copy on the control itself, as code blocks do.
      this.dataset.copyState = "copied";
      this.#resetTimer = window.setTimeout(() => this.#resetCopyState(), 2_000);
    } catch {
      if (status) status.textContent = message("pageCopyError");
    } finally {
      button.removeAttribute("aria-disabled");
    }
  };
  #resetCopyState() {
    window.clearTimeout(this.#resetTimer);
    this.#resetTimer = undefined;
    delete this.dataset.copyState;
  }
}
if (!customElements.get("cookbook-page-actions"))
  customElements.define("cookbook-page-actions", CookbookPageActions);
