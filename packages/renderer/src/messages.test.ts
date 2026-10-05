import { describe, expect, it } from "vitest";
import { messages, ENGLISH_MESSAGES } from "./localization.js";
import { uiTranslations } from "./ui.js";

describe("translation compatibility views", () => {
  it("retains independent defaults and overrides for similar labels", () => {
    expect(messages("en").auto).toBe("Auto");
    expect(uiTranslations("en", {})["themeSelect.auto"]).toBe("Auto");
    expect(uiTranslations("en", {})["search.label"]).toBe("Search");
    expect(uiTranslations("en", {})["pagefind.search"]).toBe("Search for");
    const options = {
      translations: {
        en: {
          auto: "System contrast",
          "themeSelect.auto": "System colors",
          "search.label": "Find a page",
          "pagefind.search": "Enter a query",
        },
      },
    };
    expect(messages("en", options).auto).toBe("System contrast");
    const controls = uiTranslations("en", options);
    expect(controls["themeSelect.auto"]).toBe("System colors");
    expect(controls["search.label"]).toBe("Find a page");
    expect(controls["pagefind.search"]).toBe("Enter a query");
  });

  it("applies owner base-language and regional overrides in both views", () => {
    const options = {
      translations: {
        fr: {
          auto: "Contraste automatique",
          copyCode: "Copie de base",
          "themeSelect.auto": "Couleurs automatiques",
          "search.label": "Recherche de base",
        },
        "fr-CA": {
          copyCode: "Copie régionale",
          "search.label": "Recherche régionale",
        },
      },
    };
    expect(messages("fr-CA", options)).toMatchObject({
      auto: "Contraste automatique",
      copyCode: "Copie régionale",
      more: "Plus",
    });
    expect(uiTranslations("fr-CA", options)).toMatchObject({
      "themeSelect.auto": "Couleurs automatiques",
      "search.label": "Recherche régionale",
      "page.nextLink": "Suivant",
      "search.ctrlKey": "Ctrl+",
    });
  });

  it("falls back to English and preserves owner-defined keys", () => {
    const options = {
      translations: {
        de: { copyCode: "Kopieren", "custom.action": "Aktion" },
        "de-AT": { "page.nextLink": "Weiter" },
      },
    };
    expect(messages("de-AT", options)).toMatchObject({
      copyCode: "Kopieren",
      appearance: "Appearance",
      "custom.action": "Aktion",
      "page.nextLink": "Weiter",
    });
    expect(uiTranslations("de-AT", options)).toMatchObject({
      copyCode: "Kopieren",
      "custom.action": "Aktion",
      "page.nextLink": "Weiter",
      "search.label": "Search",
    });
  });

  it("keeps built-in key scopes and returns fresh records", () => {
    const controls = uiTranslations("en", {});
    expect(controls.copyCode).toBeUndefined();
    expect(messages("en")).not.toHaveProperty("search.label");
    expect(controls["unknown.key"]).toBeUndefined();
    controls["page.nextLink"] = "Changed";
    const actions = messages("en");
    actions.copyCode = "Changed";
    expect(uiTranslations("en", {})["page.nextLink"]).toBe("Next");
    expect(messages("en").copyCode).toBe("Copy code");
    expect(ENGLISH_MESSAGES.copyCode).toBe("Copy code");
  });
});
