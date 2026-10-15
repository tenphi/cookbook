// Kept dependency-free for the page shell's synchronous, pre-paint script.
// Reads the documented storage contract in appearance-preferences.ts.
(() => {
  const root = globalThis.document.documentElement;
  try {
    const scheme = globalThis.localStorage.getItem("cookbook-theme");
    if (scheme === "light" || scheme === "dark") root.dataset.theme = scheme;
    else delete root.dataset.theme;
  } catch {
    // Without storage, the document's system appearance rules remain active.
  }
  try {
    const appearance = JSON.parse(
      globalThis.localStorage.getItem("cookbook-appearance") ?? "{}",
    );
    if (appearance?.contrast === "normal" || appearance?.contrast === "more")
      root.dataset.contrast = appearance.contrast;
    else delete root.dataset.contrast;
  } catch {
    // Malformed or unavailable storage must not prevent the first paint.
  }
})();
