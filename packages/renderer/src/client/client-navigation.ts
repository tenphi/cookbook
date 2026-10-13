// Use Astro's public router without ClientRouter's vendor stylesheet. Cookbook
// owns link interception and extracted accessibility styles; Astro owns fetch,
// stylesheet readiness, script execution, history, and route announcements.
// Prefetch expects an initial page-load event before later route swaps. When
// the router is still lazy, supply it after all native load listeners finish.
let pageLoadNotified = false;
document.addEventListener(
  "astro:page-load",
  () => {
    pageLoadNotified = true;
  },
  { once: true },
);
window.addEventListener(
  "load",
  () => {
    window.setTimeout(() => {
      if (!pageLoadNotified)
        document.dispatchEvent(new Event("astro:page-load"));
    }, 0);
  },
  { once: true },
);

let router: Promise<typeof import("./navigation-router.js")> | undefined;
function loadRouter() {
  return (router ??= import("./navigation-router.js").catch(
    (error: unknown) => {
      router = undefined;
      throw error;
    },
  ));
}

function navigationLink(target: EventTarget | undefined) {
  const link = target instanceof Element ? target.closest("a[href]") : null;
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute("download") ||
    link.hasAttribute("data-astro-reload") ||
    (link.target && link.target !== "_self")
  )
    return;
  const url = new URL(link.href);
  if (
    url.origin !== location.origin ||
    (!router &&
      url.pathname === location.pathname &&
      url.search === location.search &&
      url.hash)
  )
    return;
  // Heading links stay native until a page-navigation intent loads the router.
  return link;
}

// Download the router on navigation intent, rather than for every reader.
for (const name of ["pointerover", "focusin"]) {
  document.addEventListener(name, (event) => {
    if (navigationLink(event.composedPath()[0]))
      void loadRouter().catch(() => {
        // A later click can retry; native navigation remains the fallback.
      });
  });
}

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
  const link = navigationLink(event.composedPath()[0]);
  if (!link) return;
  event.preventDefault();
  void loadRouter()
    .then(({ navigate }) =>
      navigate(link.href, {
        sourceElement: link,
        history: link.dataset.astroHistory === "replace" ? "replace" : "auto",
      }),
    )
    .catch(() => location.assign(link.href));
});
