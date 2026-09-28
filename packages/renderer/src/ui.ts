import type { DocsConfig } from "@tenphi/docs";

const english: Record<string, string> = {
  "sidebarNav.accessibleLabel": "Main navigation",
  "menuButton.accessibleLabel": "Menu",
  "tableOfContents.onThisPage": "On this page",
  "languageSelect.accessibleLabel": "Select language",
  "themeSelect.light": "Light",
  "themeSelect.dark": "Dark",
  "themeSelect.auto": "Auto",
  "search.label": "Search",
  "search.ctrlKey": "Ctrl+",
  "search.cancelLabel": "Cancel",
  "search.devWarning": "Search is available after building the site.",
  "page.nextLink": "Next",
  "page.previousLink": "Previous",
  "page.editLink": "Edit page",
  "page.lastUpdated": "Last updated",
  "page.skipToContent": "Skip to content",
  "pagefind.search": "Search for",
  "pagefind.zero_results": "No results for",
  "pagefind.many_results": "results for",
  "pagefind.one_result": "result for",
};

const french: Record<string, string> = {
  "sidebarNav.accessibleLabel": "Navigation principale",
  "menuButton.accessibleLabel": "Menu",
  "tableOfContents.onThisPage": "Sur cette page",
  "languageSelect.accessibleLabel": "Choisir la langue",
  "themeSelect.light": "Clair",
  "themeSelect.dark": "Sombre",
  "themeSelect.auto": "Auto",
  "search.label": "Rechercher",
  "search.cancelLabel": "Annuler",
  "search.devWarning":
    "La recherche est disponible après la génération du site.",
  "page.nextLink": "Suivant",
  "page.previousLink": "Précédent",
  "page.editLink": "Modifier la page",
  "page.lastUpdated": "Dernière mise à jour",
  "page.skipToContent": "Aller au contenu",
};

export function uiTranslations(
  lang: string,
  options: Pick<DocsConfig, "translations">,
): Record<string, string> {
  const language = lang.split("-")[0] ?? "en";
  return {
    ...english,
    ...(language === "fr" ? french : {}),
    ...options.translations?.[language],
    ...options.translations?.[lang],
  };
}
