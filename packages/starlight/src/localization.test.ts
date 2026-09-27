import { describe, it, expect } from "vitest";
import {
  localeTarget,
  localeHref,
  localizedNavigation,
  messages,
  routeLocale,
} from "./localization.js";
import { resolveNavigationLayout, starlightPageSidebar } from "./navigation.js";
const options = {
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français" },
  },
  defaultLocale: "root",
};
const routes = ["/", "/guide", "/missing", "/fr/guide"].map((route) => ({
  route,
  title: route,
  entryId: route,
  sourcePath: `${route}.md`,
}));
describe("locale routing", () => {
  it("passes a single locale's relative routes to Starlight", () => {
    const nav = localizedNavigation(
      resolveNavigationLayout(["/", "/guide", "/missing"]),
      routes,
      "/fr/guide",
      options,
    );
    expect(starlightPageSidebar(nav.layout, nav.routes)).toEqual([
      { label: "/fr/guide", link: "/guide" },
    ]);
    expect(
      localizedNavigation(
        resolveNavigationLayout(undefined),
        routes,
        "/fr/guide",
        options,
      ).routes.map((route) => route.route),
    ).toEqual(["/guide"]);
  });
  it("resolves missing translations and missing locale homes to real routes", () => {
    expect(localeTarget("/missing", "fr", routes, options)).toBe("/missing");
    expect(localeTarget("/", "fr", routes, options)).toBe("/");
    expect(
      localeHref("/guide#install", "/fr/guide", routes, options, "/manual/"),
    ).toBe("/manual/fr/guide#install");
    expect(localeHref("//example.com", "/fr/guide", routes, options)).toBe(
      "//example.com",
    );
    expect(routeLocale("/framework", options)).toBe("root");
    expect(localeTarget("/absent", "fr", [], options)).toBeUndefined();
  });
  it("supports a prefixed default locale and excludes drafts from fallbacks", () => {
    const prefixed = {
      locales: { en: { label: "English" }, fr: { label: "Français" } },
      defaultLocale: "en",
    };
    const mounted = routes.map((route) => ({
      ...route,
      route: `/en${route.route === "/" ? "" : route.route}`,
    }));
    expect(localeTarget("/fr/guide", "fr", mounted, prefixed)).toBe(
      "/en/guide",
    );
    expect(
      localeTarget(
        "/guide",
        "fr",
        [{ ...routes[1]!, discoverable: false }],
        options,
      ),
    ).toBeUndefined();
  });
  it("supports regional and owner supplied translations with fallback", () => {
    expect(messages("fr-CA").appearance).toBe("Apparence");
    expect(
      messages("fr-CA", {
        translations: {
          fr: { appearance: "Thème" },
          "fr-CA": { more: "Options" },
        },
      }).more,
    ).toBe("Options");
    expect(
      messages("de", { translations: { de: { appearance: "Darstellung" } } })
        .copyCode,
    ).toBe("Copy code");
  });
});
