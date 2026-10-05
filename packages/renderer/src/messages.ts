import type { DocsConfig } from "@tenphi/docs";

type MessageOptions = {
  locales?: DocsConfig["locales"] | undefined;
  defaultLocale?: DocsConfig["defaultLocale"] | undefined;
  translations?: DocsConfig["translations"] | undefined;
};

export const ENGLISH_MESSAGES = {
  copyPage: "Copy page",
  viewMarkdown: "Download Markdown",
  pageCopied: "Page copied",
  pageCopyError: "Could not copy. Download Markdown to read or copy the text.",
  draftTitle: "Draft",
  draftNotice:
    "This page is available by direct link and excluded from navigation and indexes.",
  searchError: "Search could not load. Close and try again.",
  appearance: "Appearance",
  colorScheme: "Color scheme",
  contrast: "Contrast",
  normalContrast: "Normal",
  highContrast: "High",
  auto: "Auto",
  closeNavigation: "Close navigation",
  primary: "Primary",
  sections: "Sections",
  chooseSection: "Choose section",
  headerLinks: "Header links",
  more: "More",
  closeMore: "Close more menu",
  moreLinks: "More links",
  versions: "Versions",
  documentationVersion: "Documentation version",
  documentationVersions: "Documentation versions",
  version: "Version",
  home: "Home",
  generatedWith: "Generated with",
  viewSource: "View source",
  copyCode: "Copy code",
  codeCopied: "Code copied",
  codeCopyError: "Could not copy code",
  copyHeading: "Copy link to “{heading}”",
  linkCopied: "Link copied",
  linkCopyError: "Could not copy link",
  notFound: "Page not found",
  notFoundDescription: "The page you requested could not be found.",
  fallback: "fallback",
} as const;
export type MessageKey = keyof typeof ENGLISH_MESSAGES;
const FRENCH_MESSAGES: Record<MessageKey, string> = {
  copyPage: "Copier la page",
  viewMarkdown: "Télécharger le Markdown",
  pageCopied: "Page copiée",
  pageCopyError:
    "Copie impossible. Téléchargez le Markdown pour lire ou copier le texte.",
  draftTitle: "Brouillon",
  draftNotice:
    "Cette page est accessible par son lien direct et exclue de la navigation et des index.",
  searchError: "La recherche n’a pas pu se charger. Fermez et réessayez.",
  appearance: "Apparence",
  colorScheme: "Thème de couleur",
  contrast: "Contraste",
  normalContrast: "Normal",
  highContrast: "Élevé",
  auto: "Auto",
  closeNavigation: "Fermer la navigation",
  primary: "Navigation principale",
  sections: "Sections",
  chooseSection: "Choisir une section",
  headerLinks: "Liens d’en-tête",
  more: "Plus",
  closeMore: "Fermer le menu",
  moreLinks: "Autres liens",
  versions: "Versions",
  documentationVersion: "Version de la documentation",
  documentationVersions: "Versions de la documentation",
  version: "Version",
  home: "Accueil",
  generatedWith: "Créé avec",
  viewSource: "Voir le code source",
  copyCode: "Copier le code",
  codeCopied: "Code copié",
  codeCopyError: "Impossible de copier le code",
  copyHeading: "Copier le lien vers « {heading} »",
  linkCopied: "Lien copié",
  linkCopyError: "Impossible de copier le lien",
  notFound: "Page introuvable",
  notFoundDescription: "La page demandée est introuvable.",
  fallback: "langue de secours",
};

const ENGLISH_UI = {
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
  "pagefind.clear_search": "Clear search",
  "pagefind.zero_results": "No results",
  "pagefind.many_results": "[COUNT] results",
  "pagefind.one_result": "[COUNT] result",
} as const;

const FRENCH_UI: Partial<Record<keyof typeof ENGLISH_UI, string>> = {
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
  "pagefind.search": "Rechercher",
  "pagefind.clear_search": "Effacer la recherche",
  "pagefind.zero_results": "Aucun résultat",
  "pagefind.many_results": "[COUNT] résultats",
  "pagefind.one_result": "[COUNT] résultat",
  "page.nextLink": "Suivant",
  "page.previousLink": "Précédent",
  "page.editLink": "Modifier la page",
  "page.lastUpdated": "Dernière mise à jour",
  "page.skipToContent": "Aller au contenu",
};

// The two key namespaces remain independent compatibility views of one owner.
function resolveTranslations<Key extends string>(
  english: Record<Key, string>,
  french: Partial<Record<Key, string>>,
  lang: string,
  options: Pick<MessageOptions, "translations">,
): Record<Key, string> {
  const language = lang.split("-")[0] ?? "en";
  return {
    ...english,
    ...(language === "fr" ? french : {}),
    ...options.translations?.[language],
    ...options.translations?.[lang],
  };
}

export function messages(
  lang: string,
  options: MessageOptions = {},
): Record<MessageKey, string> {
  return resolveTranslations(ENGLISH_MESSAGES, FRENCH_MESSAGES, lang, options);
}

export function uiTranslations(
  lang: string,
  options: Pick<DocsConfig, "translations">,
): Record<string, string> {
  return resolveTranslations(ENGLISH_UI, FRENCH_UI, lang, options);
}
