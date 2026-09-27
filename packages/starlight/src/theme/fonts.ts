import type { FontLoadingConfig, ThemeFont, ThemeFonts } from "@tenphi/docs";
import type { FontFaceDescriptors } from "@tenphi/tasty/core";

export interface ResolvedFontFace {
  family: string;
  descriptors: FontFaceDescriptors;
}

const sharedFonts = globalThis as typeof globalThis & {
  __tenphiCookbookFontFaces?: ResolvedFontFace[];
  __tenphiCookbookDefaultFontUsage?: {
    onest: boolean;
    mono: boolean;
    display?: FontLoadingConfig["display"];
  };
};

const fallback = {
  body: "system-ui, sans-serif",
  heading: "system-ui, sans-serif",
  code: "ui-monospace, monospace",
} as const;

export function fontFamilies(
  fonts: ThemeFonts = {},
): Partial<Record<keyof ThemeFonts, string>> {
  return Object.fromEntries(
    (
      Object.entries(fonts).filter(([, font]) => font !== undefined) as [
        keyof ThemeFonts,
        ThemeFont,
      ][]
    ).map(([role, font]) => [
      role,
      `'${typeof font === "string" ? font : "google" in font ? font.google : font.family}', ${fallback[role]}`,
    ]),
  );
}

export function configureFontFaces(
  faces: ResolvedFontFace[],
  defaults: {
    onest: boolean;
    mono: boolean;
    display?: FontLoadingConfig["display"];
  },
): void {
  sharedFonts.__tenphiCookbookFontFaces = faces;
  sharedFonts.__tenphiCookbookDefaultFontUsage = defaults;
}

export function getFontFaces(): ResolvedFontFace[] {
  return sharedFonts.__tenphiCookbookFontFaces ?? [];
}

export function getDefaultFontUsage(): {
  onest: boolean;
  mono: boolean;
  display?: FontLoadingConfig["display"];
} {
  return (
    sharedFonts.__tenphiCookbookDefaultFontUsage ?? { onest: true, mono: true }
  );
}
