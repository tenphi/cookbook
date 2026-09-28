import { message } from "./messages.js";
class CookbookPageActions extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this.copy);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.copy);
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
    } catch {
      if (status) status.textContent = message("pageCopyError");
    } finally {
      button.removeAttribute("aria-disabled");
    }
  };
}
if (!customElements.get("cookbook-page-actions"))
  customElements.define("cookbook-page-actions", CookbookPageActions);
