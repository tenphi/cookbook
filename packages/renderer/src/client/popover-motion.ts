/** Animate popovers after they have entered the top layer. */
export function initializePopoverMotion(
  panel: HTMLElement,
  signal?: AbortSignal,
): void {
  panel.addEventListener(
    "toggle",
    () => {
      if (panel.matches(":popover-open")) {
        panel.getBoundingClientRect();
        panel.setAttribute("data-open", "");
      } else {
        panel.removeAttribute("data-open");
      }
    },
    signal ? { signal } : undefined,
  );
}
