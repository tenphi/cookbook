type Scheme = "light" | "dark" | "auto";
type Contrast = "normal" | "more" | "system";
type Preferences = { scheme: Scheme; contrast: Contrast };
type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export const parseScheme = (value: unknown): Scheme =>
  value === "light" || value === "dark" ? value : "auto";

export const parseContrast = (value: unknown): Contrast =>
  value === "normal" || value === "more" ? value : "system";

function storedAppearance(storage: PreferenceStorage): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(
      storage.getItem("cookbook-appearance") ?? "{}",
    );
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function loadPreferences(storage?: PreferenceStorage): Preferences {
  const preferences: Preferences = { scheme: "auto", contrast: "system" };
  try {
    storage ??= localStorage;
    preferences.scheme = parseScheme(storage.getItem("starlight-theme"));
    preferences.contrast = parseContrast(storedAppearance(storage).contrast);
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
      "starlight-theme",
      value.scheme === "auto" ? "" : value.scheme,
    );
    storage.setItem(
      "cookbook-appearance",
      JSON.stringify({
        ...storedAppearance(storage),
        contrast: value.contrast,
      }),
    );
  } catch {
    // The current page still updates when preferences cannot be persisted.
  }
}
