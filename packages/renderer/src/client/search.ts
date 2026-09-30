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
  const input = element.querySelector<HTMLInputElement>("[data-search-input]");
  const clear = element.querySelector<HTMLButtonElement>("[data-clear-search]");
  const shortcut = open.querySelector("kbd")!;
  if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
    shortcut.querySelector("kbd")!.textContent = "⌘";
    open.setAttribute("aria-keyshortcuts", "Meta+K");
  }
  delete shortcut.dataset.pending;
  let initialized: Promise<void> | undefined;
  let engineInput: HTMLInputElement | null = null;
  let returnFocus: HTMLElement | null = null;
  let closing = false;
  let generation = 0;
  const updateSearch = () => {
    if (clear) clear.hidden = !input?.value;
    if (engineInput) {
      engineInput.value = input?.value ?? "";
      engineInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  input?.addEventListener("input", updateSearch);
  clear?.addEventListener("click", () => {
    if (!input) return;
    input.value = "";
    updateSearch();
    input.focus();
  });
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
        element: element.querySelector("[data-search-results]"),
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
      engineInput = element.querySelector(".pagefind-ui__search-input");
      element.querySelector(".pagefind-ui__form")?.removeAttribute("role");
      // Cookbook owns the field so focus stays within the opening tap on mobile.
      // Pagefind still owns query processing and its lazily rendered results.
      element
        .querySelectorAll<HTMLElement>(
          ".pagefind-ui__search-input, .pagefind-ui__search-clear",
        )
        .forEach((control) => {
          control.hidden = true;
          control.tabIndex = -1;
        });
      updateSearch();
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
  const show = (trigger?: HTMLElement) => {
    if (dialog.open && !closing) return;
    generation += 1;
    closing = false;
    if (!dialog.open) {
      returnFocus =
        trigger ??
        (document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body
          ? document.activeElement
          : open);
      dialog.removeAttribute("data-open");
      dialog.showModal();
    }
    // Do this synchronously, before the lazy import releases user activation.
    input?.focus({ preventScroll: true });
    // Establish the initial state after entering the top layer. The global
    // style renderer does not preserve @starting-style in server output.
    dialog.getBoundingClientRect();
    dialog.setAttribute("data-open", "");
    document.body.setAttribute("data-search-modal-open", "");
    if (!development && status) status.hidden = true;
    void initialize().catch(() => {
      /* Keep the close control usable when the search bundle fails. */
    });
  };
  const hide = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    const current = ++generation;
    dialog.removeAttribute("data-open");
    // Keep the modal in the top layer until its exit transition has finished.
    // This also works in browsers without discrete display/overlay transitions.
    await Promise.allSettled(
      dialog
        .getAnimations()
        .filter((animation) =>
          Number.isFinite(animation.effect?.getComputedTiming().endTime),
        )
        .map((animation) => animation.finished),
    );
    if (current === generation && dialog.open) dialog.close();
  };
  open.addEventListener("click", () => {
    show(open);
  });
  open.disabled = false;
  close.addEventListener("click", () => void hide());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    void hide();
  });
  dialog.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("a[href]") || !frame.contains(event.target))
      void hide();
  });
  dialog.addEventListener("close", () => {
    dialog.removeAttribute("data-open");
    closing = false;
    document.body.removeAttribute("data-search-modal-open");
    returnFocus?.focus();
  });
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open && !closing) void hide();
      else void show();
    }
  });
}
