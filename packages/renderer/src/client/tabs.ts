let nextId = 0;

/** Enhance progressively: every panel remains readable when JavaScript is disabled. */
export function initializeTabs(): void {
  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-cookbook-tabs]",
  )) {
    if (root.dataset.tabsReady) continue;
    const list = root.querySelector<HTMLElement>(":scope > [data-tabs-list]");
    const panels = [
      ...root.querySelectorAll<HTMLElement>(":scope > [data-tab-panel]"),
    ];
    if (!list || panels.length === 0) continue;
    root.dataset.tabsReady = "true";
    let prefix: string;
    do {
      prefix = `cookbook-tabs-${++nextId}`;
    } while (document.getElementById(`${prefix}-tab-0`));
    list.setAttribute("role", "tablist");
    list.setAttribute(
      "aria-label",
      root.getAttribute("aria-label") ?? "Examples",
    );
    const buttons = panels.map((panel, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = `${prefix}-tab-${index}`;
      button.textContent = panel.dataset.label ?? `Tab ${index + 1}`;
      button.setAttribute("role", "tab");
      panel.id = `${prefix}-panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.tabIndex = 0;
      button.setAttribute("aria-controls", panel.id);
      const heading = panel.querySelector<HTMLElement>(
        ":scope > [data-tab-heading]",
      );
      if (heading) heading.hidden = true;
      list.append(button);
      return button;
    });
    const activate = (index: number, focus = false) => {
      for (const [position, button] of buttons.entries()) {
        const selected = position === index;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        panels[position]!.hidden = !selected;
      }
      if (focus) buttons[index]?.focus();
    };
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(index));
      button.addEventListener("keydown", (event) => {
        const rtl = getComputedStyle(root).direction === "rtl";
        const forward = rtl ? "ArrowLeft" : "ArrowRight";
        const backward = rtl ? "ArrowRight" : "ArrowLeft";
        let target: number;
        if (event.key === forward) target = (index + 1) % buttons.length;
        else if (event.key === backward)
          target = (index + buttons.length - 1) % buttons.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = buttons.length - 1;
        else return;
        event.preventDefault();
        activate(target, true);
      });
    });
    activate(0);
  }
}
