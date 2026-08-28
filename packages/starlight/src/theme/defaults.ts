import type {
  ThemeTokens,
  TypographyPreset,
  TypographyPresets,
} from "@tenphi/docs";

export const DEFAULT_THEME_TOKENS = {
  $gap: "0.5rem",
  $radius: "0.375rem",
  "$card-radius": "0.75rem",
  "$border-width": "1px",
  "$outline-width": "2px",
  "$outline-offset": "2px",
  "$content-width": "52rem",
  "$sidebar-width": "18rem",
  "$control-height": "2.5rem",
} satisfies ThemeTokens;

const BODY_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";
const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const DEFAULT_TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  body: {
    fontFamily: BODY_FONT,
    fontSize: "1rem",
    lineHeight: 1.7,
    letterSpacing: "0",
    fontWeight: 400,
    boldFontWeight: 700,
  },
  heading: {
    fontFamily: "var(--body-font-family)",
    fontSize: "1rem",
    lineHeight: 1.2,
    letterSpacing: "-0.015em",
    fontWeight: 700,
    boldFontWeight: 800,
  },
  h1: heading("2.625rem", 1.08, "-0.03em"),
  h2: heading("2rem", 1.15, "-0.025em"),
  h3: heading("1.5rem", 1.2, "-0.015em"),
  h4: heading("1.25rem", 1.25, "-0.01em"),
  h5: heading("1.125rem", 1.3, "0"),
  h6: heading("1rem", 1.35, "0"),
  small: {
    fontFamily: "var(--body-font-family)",
    fontSize: "0.875rem",
    lineHeight: 1.5,
    letterSpacing: "0",
    fontWeight: 400,
    boldFontWeight: 700,
  },
  code: {
    fontFamily: MONO_FONT,
    fontSize: "0.875rem",
    lineHeight: 1.6,
    letterSpacing: "0",
    fontWeight: 400,
    boldFontWeight: 700,
  },
};

export function resolveThemeTokens(tokens: ThemeTokens = {}): ThemeTokens {
  return { ...DEFAULT_THEME_TOKENS, ...tokens };
}

export function resolveTypographyPresets(
  presets: TypographyPresets = {},
): Record<string, TypographyPreset> {
  const body = DEFAULT_TYPOGRAPHY_PRESETS.body;
  if (!body) throw new Error("The body typography preset is required.");
  const names = new Set([
    ...Object.keys(DEFAULT_TYPOGRAPHY_PRESETS),
    ...Object.keys(presets),
  ]);
  return Object.fromEntries(
    [...names].map((name) => [
      name,
      {
        ...(DEFAULT_TYPOGRAPHY_PRESETS[name] ?? body),
        ...(presets[name] ?? {}),
      },
    ]),
  );
}

function heading(
  fontSize: string,
  lineHeight: number,
  letterSpacing: string,
): TypographyPreset {
  return {
    fontFamily: "var(--heading-font-family)",
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight: "var(--heading-font-weight)",
    boldFontWeight: "var(--heading-bold-font-weight)",
  };
}
