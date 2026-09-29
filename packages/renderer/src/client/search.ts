type SearchResult = { url: string; sub_results?: SearchResult[] };
type PagefindOptions = Record<string, unknown> & {
  processResult?: (result: SearchResult) => SearchResult | void;
};

/** Own the dialog lifecycle; Pagefind owns indexing, filtering and result rendering. */
export function initializeSearch(
  element: HTMLElement,
  options: PagefindOptions,
  development: boolean,
  base: string,
): void {
  if (element.dataset.initialized) return;
  element.dataset.initialized = "true";
  const open = element.querySelector<HTMLButtonElement>("[data-open-modal]")!;
  const close = element.querySelector<HTMLButtonElement>("[data-close-modal]")!;
  const dialog = element.querySelector("dialog")!;
  const frame = element.querySelector(".dialog-frame")!;
  const status = element.querySelector<HTMLElement>("[data-search-status]");
  const shortcut = open.querySelector("kbd")!;
  if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
    shortcut.querySelector("kbd")!.textContent = "⌘";
    open.setAttribute("aria-keyshortcuts", "Meta+K");
  }
  delete shortcut.dataset.pending;
  let initialized: Promise<void> | undefined;
  let returnFocus: HTMLElement | null = null;
  const initialize = () => {
    if (development) return Promise.resolve();
    return (initialized ??= (async () => {
      // @ts-expect-error Pagefind publishes no declarations for its default UI.
      const { PagefindUI } = await import("@pagefind/default-ui");
      const translations = JSON.parse(element.dataset.translations ?? "{}");
      const format = (url: string) =>
        element.hasAttribute("data-strip-trailing-slash")
          ? url.replace(/(.)\/(#.*)?$/, "$1$2")
          : url;
      new PagefindUI({
        ...options,
        element: "#cookbook__search",
        baseUrl: base,
        bundlePath: `${base.replace(/\/$/, "")}/pagefind/`,
        showImages: false,
        showSubResults: true,
        translations,
        processResult(result: SearchResult) {
          result = options.processResult?.(result) ?? result;
          result.url = format(result.url);
          result.sub_results?.forEach((child) => {
            child.url = format(child.url);
          });
          return result;
        },
      });
    })().catch((error: unknown) => {
      initialized = undefined;
      if (status) {
        status.hidden = false;
        // Reuse the localized Pagefind error, with a plain fallback.
        const translations = JSON.parse(element.dataset.translations ?? "{}");
        status.textContent =
          translations.error ?? "Search could not load. Close and try again.";
      }
      throw error;
    }));
  };
  const show = async () => {
    if (dialog.open) return;
    returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : open;
    dialog.removeAttribute("data-open");
    dialog.showModal();
    // Establish the initial state after entering the top layer. The global
    // style renderer does not preserve @starting-style in server output.
    dialog.getBoundingClientRect();
    dialog.setAttribute("data-open", "");
    document.body.setAttribute("data-search-modal-open", "");
    if (!development && status) status.hidden = true;
    try {
      await initialize();
      // Pagefind mounts synchronously. Only focus if the user has not closed it.
      if (dialog.open) element.querySelector("input")?.focus();
    } catch {
      /* Keep the close control usable when the search bundle fails. */
    }
  };
  open.addEventListener("click", () => {
    void show();
  });
  open.disabled = false;
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("a[href]") || !frame.contains(event.target))
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.removeAttribute("data-open");
    document.body.removeAttribute("data-search-modal-open");
    returnFocus?.focus();
  });
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else void show();
    }
  });
}
