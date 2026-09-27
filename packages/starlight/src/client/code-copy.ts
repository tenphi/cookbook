import { message } from "./messages.js";

class CookbookCodeBlock extends HTMLElement {
  #resetTimer: number | undefined;

  connectedCallback() {
    const button = this.querySelector<HTMLButtonElement>("[data-copy-code]");
    if (button) {
      button.setAttribute("aria-label", message("copyCode"));
      button.title = message("copyCode");
    }
    this.addEventListener("click", this.#copy);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#copy);
    if (this.#resetTimer !== undefined) {
      window.clearTimeout(this.#resetTimer);
    }
  }

  #copy = async (event: MouseEvent) => {
    const target = event.target;
    const button =
      target instanceof Element
        ? target.closest<HTMLButtonElement>("[data-copy-code]")
        : undefined;
    const code = this.querySelector<HTMLElement>("pre code");
    if (!button || !this.contains(button) || !code) return;

    try {
      await writeClipboard(code);
    } catch {
      button.dataset.copyState = "error";
      button.setAttribute("aria-label", message("codeCopyError"));
      button.title = message("codeCopyError");
      return;
    }

    button.dataset.copyState = "copied";
    button.setAttribute("aria-label", message("codeCopied"));
    button.title = message("codeCopied");

    if (this.#resetTimer !== undefined) {
      window.clearTimeout(this.#resetTimer);
    }
    this.#resetTimer = window.setTimeout(() => {
      delete button.dataset.copyState;
      button.setAttribute("aria-label", message("copyCode"));
      button.title = message("copyCode");
      this.#resetTimer = undefined;
    }, 2_000);
  };
}

async function writeClipboard(code: HTMLElement): Promise<void> {
  const value = code.textContent ?? "";
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const selection = window.getSelection();
  const previousRanges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index),
      )
    : [];
  const range = document.createRange();
  range.selectNodeContents(code);
  selection?.removeAllRanges();
  selection?.addRange(range);
  const copied = document.execCommand("copy");
  selection?.removeAllRanges();
  for (const previousRange of previousRanges)
    selection?.addRange(previousRange);
  if (!copied) throw new Error("Clipboard unavailable");
}

if (!customElements.get("cookbook-code-block")) {
  customElements.define("cookbook-code-block", CookbookCodeBlock);
}
