export {};

const open = document.querySelector<HTMLButtonElement>(
  "[data-docs-search-open]",
);
const dialog = document.querySelector<HTMLDialogElement>("[data-docs-search]");
const input = document.querySelector<HTMLInputElement>(
  "[data-docs-search-input]",
);
const status = document.querySelector<HTMLElement>("[data-docs-search-status]");
const results = document.querySelector<HTMLUListElement>(
  "[data-docs-search-results]",
);
const base =
  document.querySelector<HTMLElement>("[data-docs-base]")?.dataset.docsBase ??
  "/";
const basePath = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;

const openDialog = () => {
  dialog?.showModal();
  input?.focus();
};

open?.addEventListener("click", openDialog);

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    if (dialog?.open) dialog.close();
    else openDialog();
    event.preventDefault();
  }
});

const shortcut = document.querySelector<HTMLElement>(
  "[data-docs-search-shortcut]",
);
const shortcutKey = shortcut?.querySelector("kbd");
if (shortcutKey && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
  shortcutKey.textContent = "⌘";
  open?.setAttribute("aria-keyshortcuts", "Meta+K");
}

type Pagefind = {
  search(query: string): Promise<{
    results: Array<{
      data(): Promise<{ url: string; meta: { title?: string } }>;
    }>;
  }>;
};
let pagefind: Promise<Pagefind> | undefined;
input?.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!status || !results) return;
  if (!query) {
    status.textContent = "";
    results.replaceChildren();
    return;
  }
  status.textContent = "Searching…";
  const modulePath = `${basePath}/pagefind/pagefind.js`;
  pagefind ??= import(/* @vite-ignore */ modulePath);
  const response = await (await pagefind).search(query);
  const records = await Promise.all(
    response.results.slice(0, 12).map((result) => result.data()),
  );
  results.replaceChildren(
    ...records.map((record) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `${basePath}${record.url}`;
      link.textContent = record.meta.title ?? record.url;
      item.append(link);
      return item;
    }),
  );
  status.textContent = `${records.length} result${records.length === 1 ? "" : "s"}`;
});
