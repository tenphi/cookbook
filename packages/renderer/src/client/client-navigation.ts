import { navigate } from "astro:transitions/client";
import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { initializeTabs } from "./tabs.js";

// Use Astro's public router without ClientRouter's vendor stylesheet. Cookbook
// owns link interception and extracted accessibility styles; Astro owns fetch,
// stylesheet readiness, script execution, history, and route announcements.
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const target = event.composedPath()[0];
  const link = target instanceof Element ? target.closest("a[href]") : null;
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute("download") ||
    link.hasAttribute("data-astro-reload") ||
    (link.target && link.target !== "_self") ||
    new URL(link.href).origin !== location.origin
  )
    return;
  event.preventDefault();
  void navigate(link.href, {
    sourceElement: link,
    history: link.dataset.astroHistory === "replace" ? "replace" : "auto",
  });
});

document.addEventListener("astro:before-swap", (event) => {
  const transition = event as TransitionBeforeSwapEvent;
  // Instant swaps avoid the browser's default full-page crossfade.
  transition.viewTransition.skipTransition();
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
