import type { ConfigTokens } from "@tenphi/tasty/core";
import type { ResolvedDocsTheme } from "./index.js";

export const TASTY_UNITS = {
  x: "var(--gap)",
  r: "var(--radius)",
  cr: "var(--card-radius)",
  bw: "var(--border-width)",
} as const;

export function tastyTokens(theme: ResolvedDocsTheme): ConfigTokens {
  const tokens = Object.fromEntries(
    Object.entries(theme.tokens).filter(([name]) => name.startsWith("$")),
  ) as ConfigTokens;

  Object.assign(tokens, theme.colorTokens as ConfigTokens);

  return tokens;
}
