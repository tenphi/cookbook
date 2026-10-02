import type { ConfigTokens } from "@tenphi/tasty/core";
import type { ResolvedDocsTheme } from "./index.js";

// Margin edges accept automatic centering as well as lengths and percentages.
// Explicit types prevent Tasty's first length assignment from excluding `auto`.
export const TASTY_SPACING_PROPERTIES = {
  "$margin-block-start": {
    syntax: "<length-percentage> | auto",
    inherits: false,
    initialValue: "0px",
  },
  "$margin-block-end": {
    syntax: "<length-percentage> | auto",
    inherits: false,
    initialValue: "0px",
  },
  "$padding-block-start": {
    syntax: "<length-percentage>",
    inherits: false,
    initialValue: "0px",
  },
  "$padding-block-end": {
    syntax: "<length-percentage>",
    inherits: false,
    initialValue: "0px",
  },
} as const;

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
