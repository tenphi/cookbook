import { configure, getGlobalPredefinedStates } from "@tenphi/tasty";
import { resolveTypographyPresets } from "../theme/defaults.js";
import { TASTY_UNITS } from "../theme/tasty-config.js";

const systemLight = "@media(prefers-color-scheme: light)";
const systemDark = "@media(prefers-color-scheme: dark)";

export const cookbookStates = {
  "@system-light": systemLight,
  "@system-dark": systemDark,
  "@light": `@root(theme=light) | (!@root(theme) & ${systemLight})`,
  "@dark": `@root(theme=dark) | (!@root(theme) & ${systemDark})`,
  "@mobile": "@media(w < 50rem)",
  "@desktop": "@media(w >= 50rem)",
  "@small": "@media(w <= 40rem)",
  "@compact": "@media(w <= 23rem)",
  "@shell-mobile": "@media(w <= 48rem)",
  "@shell-desktop": "@media(w > 48rem)",
  "@narrow-layout": "@media(w < 72rem)",
  "@medium-layout": "@media(w >= 50rem) & @media(w < 72rem)",
  "@reduced-motion": "@media(prefers-reduced-motion: reduce)",
};

let configured = false;
let configuredRuntime;

/** Configure aliases in the renderer's Tasty module before styles are parsed. */
export function configureCookbookStates() {
  // Process-local server configuration shared across Astro/Vite module graphs.
  // The integration prevents this module from entering browser bundles.
  const runtime = globalThis.__tenphiCookbookTastyRuntime;
  if (configured && configuredRuntime === runtime) return;
  configure({
    presets: resolveTypographyPresets(),
    ...runtime,
    units: { ...TASTY_UNITS, ...runtime?.units },
  });
  configuredRuntime = runtime;
  // The integration may have configured this runtime already, including
  // consumer overrides of built-in breakpoints. Only supply missing aliases.
  const existingStates = getGlobalPredefinedStates();
  const missingStates = Object.fromEntries(
    Object.entries(cookbookStates).filter(
      ([name]) => existingStates[name] === undefined,
    ),
  );
  if (Object.keys(missingStates).length) configure({ states: missingStates });
  configured = true;
}
