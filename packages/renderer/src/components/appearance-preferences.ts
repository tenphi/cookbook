// `cookbook-appearance` is a documented contract that other apps on the same
// origin read and write (docs/theme-and-components.md, "Reader appearance").
// Keep its key and value format compatible; appearance-bootstrap.js reads it too.
export const APPEARANCE_KEY = "cookbook-appearance";
// The color scheme used to live in its own key. It is still read when the
// object has no `theme`, and removed on the next save.
export const LEGACY_THEME_KEY = "cookbook-theme";

type Theme = "light" | "dark" | "system";
type Contrast = "normal" | "more" | "system";
type Preferences = { theme: Theme; contrast: Contrast };
type PreferenceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const parseTheme = (value: unknown): Theme =>
  value === "light" || value === "dark" ? value : "system";

export const parseContrast = (value: unknown): Contrast =>
  value === "normal" || value === "more" ? value : "system";

function storedAppearance(storage: PreferenceStorage): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(storage.getItem(APPEARANCE_KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function loadPreferences(storage?: PreferenceStorage): Preferences {
  const preferences: Preferences = { theme: "system", contrast: "system" };
  try {
    storage ??= localStorage;
    const stored = storedAppearance(storage);
    preferences.theme = parseTheme(
      "theme" in stored ? stored.theme : storage.getItem(LEGACY_THEME_KEY),
    );
    preferences.contrast = parseContrast(stored.contrast);
  } catch {
    // System defaults work even when browser storage is unavailable.
  }
  return preferences;
}

export function storePreferences(
  value: Preferences,
  storage?: PreferenceStorage,
): void {
  try {
    storage ??= localStorage;
    storage.setItem(
      APPEARANCE_KEY,
      JSON.stringify({
        ...storedAppearance(storage),
        theme: value.theme,
        contrast: value.contrast,
      }),
    );
    storage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // The current page still updates when preferences cannot be persisted.
  }
}
