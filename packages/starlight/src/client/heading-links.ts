/** Keep real fragment links as the no-JavaScript and modified-click fallback. */
export function initializeHeadingLinks(): void {
  for (const content of document.querySelectorAll(".sl-markdown-content")) {
    let status = content.querySelector<HTMLElement>(
      "[data-heading-copy-status]",
    );
    if (!status) {
      status = document.createElement("span");
      status.className = "sr-only";
      status.dataset.headingCopyStatus = "";
      status.setAttribute("role", "status");
      content.append(status);
    }

    for (const link of content.querySelectorAll<HTMLAnchorElement>(
      '.sl-heading-wrapper > .sl-anchor-link[href^="#"]',
    )) {
      if (link.dataset.copyReady) continue;
      link.dataset.copyReady = "true";
      const heading =
        link.previousElementSibling?.textContent?.trim() ?? "section";
      const label = `Copy link to “${heading}”`;
      link.setAttribute("role", "button");
      link.setAttribute("aria-label", label);
      link.title = label;
      let timer: number | undefined;
      let attempt = 0;

      link.addEventListener("keydown", (event) => {
        if (
          event.key !== " " ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        if (!event.repeat) link.click();
      });
      link.addEventListener("click", async (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        window.clearTimeout(timer);
        delete link.dataset.copyState;
        status.textContent = "";
        const currentAttempt = ++attempt;
        let message: string;
        let state: string;
        try {
          const url = new URL(link.getAttribute("href")!, window.location.href);
          await copyLink(url.href);
          message = "Link copied";
          state = "copied";
        } catch {
          message = "Could not copy link";
          state = "error";
        }
        if (currentAttempt !== attempt || !link.isConnected) return;
        link.dataset.copyState = state;
        link.setAttribute("aria-label", message);
        link.title = message;
        status.textContent = `${message}: ${heading}`;
        timer = window.setTimeout(() => {
          delete link.dataset.copyState;
          link.setAttribute("aria-label", label);
          link.title = label;
        }, 2_000);
      });
    }
  }
}

async function copyLink(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  // Older browsers and insecure local previews may not expose Clipboard API.
  const input = document.createElement("textarea");
  input.className = "sr-only";
  input.value = value;
  input.readOnly = true;
  const focused = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index),
      )
    : [];
  document.body.append(input);
  try {
    input.focus({ preventScroll: true });
    input.select();
    if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
  } finally {
    input.remove();
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
    selection?.removeAllRanges();
    for (const range of ranges) selection?.addRange(range);
  }
}
