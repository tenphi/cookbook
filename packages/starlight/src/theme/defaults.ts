import type {
  ThemeTokens,
  TypographyPreset,
  TypographyPresets,
} from "@tenphi/docs";

export const DEFAULT_THEME_TOKENS = {
  $gap: "0.5rem",
  $radius: "6px",
  "$card-radius": "10px",
  "$border-width": "1px",
  "$outline-width": "2px",
  "$outline-offset": "2px",
  "$layout-width": "87.5rem",
  "$content-width": "58rem",
  "$sidebar-width": "17.5rem",
  "$control-height": "2.5rem",
} satisfies ThemeTokens;

const BODY_FONT =
  "'Onest Variable', Onest, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO_FONT =
  "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

export const DEFAULT_TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  body: {
    fontFamily: BODY_FONT,
    fontSize: "1rem",
    lineHeight: 1.65,
    letterSpacing: "0",
    fontWeight: 420,
    boldFontWeight: 640,
  },
  heading: {
    fontFamily: BODY_FONT,
    fontSize: "1rem",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    fontWeight: 640,
    boldFontWeight: 720,
  },
  h1: heading("clamp(2.5rem, 5vw, 3.25rem)", 1.05, "-0.025em"),
  h2: heading("clamp(1.75rem, 3vw, 2.125rem)", 1.1, "-0.018em"),
  h3: heading("1.5rem", 1.15, "-0.012em"),
  h4: heading("1.25rem", 1.2, "-0.008em"),
  h5: heading("1.125rem", 1.25, "-0.004em"),
  h6: heading("1rem", 1.3, "0"),
  navigation: {
    fontFamily: "var(--body-font-family)",
    fontSize: "0.9375rem",
    lineHeight: 1.4,
    letterSpacing: "-0.006em",
    fontWeight: 540,
    boldFontWeight: 650,
  },
  small: {
    fontFamily: "var(--body-font-family)",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    letterSpacing: "-0.002em",
    fontWeight: 420,
    boldFontWeight: 650,
  },
  code: {
    fontFamily: MONO_FONT,
    fontSize: "0.875rem",
    lineHeight: 1.65,
    letterSpacing: "0",
    fontWeight: 400,
    boldFontWeight: 650,
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
