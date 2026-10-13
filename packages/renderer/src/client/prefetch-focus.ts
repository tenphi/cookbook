import { prefetch } from "astro:prefetch";

/** Keep Astro's hover strategy working for keyboard focus after body swaps. */
export function initializePrefetchFocus(options: {
  prefetchAll?: boolean;
  defaultStrategy?: string;
}): void {
  // Astro 7.3 binds focus listeners to the initial body. Its page-load refresh
  // handles mouse listeners on new anchors, but does not rebind keyboard focus.
  // Use the public prefetch API only after swaps; Astro still owns
  // requests, cache reuse, deduplication, and connection checks.
  let swapped = false;
  document.addEventListener(
    "astro:after-swap",
    () => {
      swapped = true;
    },
    { once: true },
  );
  let timeout: number | undefined;
  document.addEventListener("focusin", (event) => {
    if (!swapped) return;
    const link =
      event.target instanceof Element ? event.target.closest("a") : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const strategy = link.dataset.astroPrefetch;
    const hover =
      strategy === "hover" ||
      ((strategy === "" || (strategy === undefined && options.prefetchAll)) &&
        (options.defaultStrategy ?? "hover") === "hover");
    if (!hover) return;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      if (link.isConnected) prefetch(link.href);
    }, 80);
  });
  document.addEventListener("focusout", () => window.clearTimeout(timeout));
}
