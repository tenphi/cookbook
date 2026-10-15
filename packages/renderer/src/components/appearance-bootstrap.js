// Kept dependency-free for the page shell's synchronous, pre-paint script.
// Reads the documented storage contract in appearance-preferences.ts.
(() => {
  const root = globalThis.document.documentElement;
  let appearance = {};
  try {
    appearance =
      JSON.parse(
        globalThis.localStorage.getItem("cookbook-appearance") ?? "{}",
      ) ?? {};
  } catch {
    // Malformed or unavailable storage must not prevent the first paint.
  }
  let theme = appearance.theme;
  if (theme === undefined) {
    try {
      // A scheme saved before the appearance object held it.
      theme = globalThis.localStorage.getItem("cookbook-theme");
    } catch {
      // Without storage, the document's system appearance rules remain active.
    }
  }
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;
  const contrast = appearance.contrast;
  if (contrast === "normal" || contrast === "more")
    root.dataset.contrast = contrast;
  else delete root.dataset.contrast;
})();
