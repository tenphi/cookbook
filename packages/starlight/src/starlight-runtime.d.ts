import type { AstroIntegration } from "astro";

export interface StarlightOptions {
  title: string;
  description?: string;
  customCss?: string[];
  disable404Route?: boolean;
  pagefind?: false | Record<string, unknown>;
  sidebar?: unknown[];
  [key: string]: unknown;
}

export default function starlight(options: StarlightOptions): AstroIntegration;
export function docsSchema(options?: unknown): unknown;
