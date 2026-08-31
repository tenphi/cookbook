import type { ConfigTokens } from "@tenphi/tasty/core";
import type { ResolvedDocsTheme } from "./index.js";

export const TASTY_UNITS = {
  x: "var(--gap)",
  r: "var(--radius)",
  cr: "var(--card-radius)",
  bw: "var(--border-width)",
} as const;

// Token states are emitted on :root already. Keep these as ordinary state
// selectors so Tasty attaches them to that root instead of generating an
// impossible descendant `:root ... :root` selector.
const LIGHT =
  "theme=light | (@media(prefers-color-scheme: light) & :not([data-theme]))";
const HIGH_CONTRAST =
  "contrast=more | (@media(prefers-contrast: more) & :not([data-contrast]))";

export function tastyTokens(theme: ResolvedDocsTheme): ConfigTokens {
  const tokens = Object.fromEntries(
    Object.entries(theme.tokens).filter(([name]) => name.startsWith("$")),
  ) as ConfigTokens;

  Object.assign(tokens, {
    "#surface": colorStates(theme.colors.surface),
    "#surface-2": colorStates(theme.colors.surface2),
    "#surface-3": colorStates(theme.colors.surface3),
    "#surface-2-hover": mix("#text", 3, "#surface-2"),
    "#surface-2-pressed": mix("#text", 9, "#surface-2"),
    "#surface-3-hover": mix("#text", 3, "#surface-3"),
    "#surface-3-pressed": mix("#text", 9, "#surface-3"),
    "#text": colorStates(theme.colors.text),
    "#text-soft": colorStates(theme.colors.textSoft),
    "#border": mix("#text", 18, "#surface"),
    "#border-strong": mix("#text", 34, "#surface"),
    "#accent-text": colorStates(theme.colors.accentText),
    "#accent-surface": colorStates(theme.colors.accentSurface),
    "#accent-surface-text": colorStates(theme.colors.accentSurfaceText),
    "#focus": colorStates(theme.colors.focus),
    "#shadow": mix("#text", 16, "transparent"),
    "#overlay": mix("#text", 58, "transparent"),
  } satisfies ConfigTokens);

  return tokens;
}

function colorStates(colors: Record<string, string>) {
  return {
    "": colors.dark,
    [LIGHT]: colors.light,
    [HIGH_CONTRAST]: colors.darkContrast,
    [`(${LIGHT}) & (${HIGH_CONTRAST})`]: colors.lightContrast,
  };
}

function mix(foreground: string, percentage: number, background: string) {
  return `color-mix(in oklab, ${foreground} ${percentage}%, ${background})`;
}
