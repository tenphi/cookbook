import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { initializeTabs } from "./tabs.js";
export { navigate } from "astro:transitions/client";

// Load swap behavior with the router, before the first client navigation.
document.addEventListener("astro:before-swap", (event) => {
  const transition = event as TransitionBeforeSwapEvent;
  // Instant swaps avoid the browser's default full-page crossfade.
  transition.viewTransition.skipTransition();
  void transition.viewTransition.ready.catch(() => {
    // Skipping rejects `ready` with an AbortError that nothing else observes.
  });
  for (const name of ["data-theme", "data-contrast"]) {
    const value = document.documentElement.getAttribute(name);
    if (value === null)
      transition.newDocument.documentElement.removeAttribute(name);
    else transition.newDocument.documentElement.setAttribute(name, value);
  }
  const sidebar = document.querySelector<HTMLElement>("#cookbook__sidebar");
  const key =
    sidebar?.querySelector<HTMLElement>("cookbook-sidebar")?.dataset.storageKey;
  const scroll = sidebar?.scrollTop ?? 0;
  const swap = transition.swap;
  transition.swap = () => {
    swap();
    const next = document.querySelector<HTMLElement>("#cookbook__sidebar");
    if (
      next &&
      key &&
      next.querySelector<HTMLElement>("cookbook-sidebar")?.dataset
        .storageKey === key &&
      matchMedia("(min-width: 50rem)").matches
    )
      next.scrollTop = scroll;
  };
});

document.addEventListener("astro:after-swap", () => {
  // Enhance incoming panels synchronously, before a frame can show every
  // no-JavaScript panel and then jump when page-load scripts hide them.
  initializeTabs();
  // Keep fragment navigation intact, but reset article scroll on page changes,
  // including Back/Forward. Sidebar scroll is independent of the document.
  if (!location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }
});
