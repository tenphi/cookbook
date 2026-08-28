const STORAGE_KEY = "tasty-docs-appearance";

type Theme = "light" | "dark" | "system";
type Contrast = "normal" | "more" | "system";
type Appearance = { theme?: Theme; contrast?: Contrast };

const themes = new Set(["light", "dark", "system"]);
const contrasts = new Set(["normal", "more", "system"]);

export function applyAppearance(value: Appearance): void {
  const root = document.documentElement;
  if (value.theme && value.theme !== "system") root.dataset.theme = value.theme;
  else delete root.dataset.theme;
  if (value.contrast && value.contrast !== "system")
    root.dataset.contrast = value.contrast;
  else delete root.dataset.contrast;
}

export function saveAppearance(value: Appearance): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  applyAppearance(value);
}

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) applyAppearance(normalizeAppearance(JSON.parse(stored)));
} catch {
  // Storage may be unavailable; CSS media queries remain the fallback.
}

const theme = document.querySelector<HTMLSelectElement>("[data-docs-theme]");
const contrast = document.querySelector<HTMLSelectElement>(
  "[data-docs-contrast]",
);
let current: Appearance = { theme: "system", contrast: "system" };
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) current = normalizeAppearance(JSON.parse(stored));
} catch {
  // The controls retain system defaults when storage is unavailable.
}
if (theme) theme.value = current.theme ?? "system";
if (contrast) contrast.value = current.contrast ?? "system";
const update = () => {
  current = {
    theme: normalizeTheme(theme?.value),
    contrast: normalizeContrast(contrast?.value),
  };
  saveAppearance(current);
};
theme?.addEventListener("change", update);
contrast?.addEventListener("change", update);

function normalizeAppearance(value: unknown): Appearance {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    theme: normalizeTheme(record.theme),
    contrast: normalizeContrast(record.contrast),
  };
}

function normalizeTheme(value: unknown): Theme {
  return typeof value === "string" && themes.has(value)
    ? (value as Theme)
    : "system";
}

function normalizeContrast(value: unknown): Contrast {
  return typeof value === "string" && contrasts.has(value)
    ? (value as Contrast)
    : "system";
}
