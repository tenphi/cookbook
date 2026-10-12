import { configure, getGlobalPredefinedStates } from "@tenphi/tasty";
import { resolveTypographyPresets } from "../theme/defaults.js";
import {
  TASTY_UNITS,
  TASTY_SPACING_PROPERTIES,
} from "../theme/tasty-config.js";

const systemLight = "@media(prefers-color-scheme: light)";
const systemDark = "@media(prefers-color-scheme: dark)";

export const cookbookStates = {
  "@system-light": systemLight,
  "@system-dark": systemDark,
  "@light": `@root(theme=light) | (!@root(theme) & ${systemLight})`,
  "@dark": `@root(theme=dark) | (!@root(theme) & ${systemDark})`,
  "@sm": "@media(w > 40rem)",
  "@md": "@media(w >= 50rem)",
  "@lg": "@media(w >= 72rem)",
  "@reduced-motion": "@media(prefers-reduced-motion: reduce)",
  // Tasty 3.9.9 does not apply nested @parent() inside @own(). Keep this scoped
  // ancestry check in one alias so nested isolated content stays untouched.
  "@prose": "@own(!:is([data-not-content] *))",
  "@prose-block":
    "@own(!:is([data-not-content] *)) & (@own(block) | @own(!:is(a,strong,em,del,span,input,code,br,li,dt,dd))) & (@own(:is(:not(a,strong,em,del,span,input,code,br) + *)) | @own(:is([data-block] + *)))",
  "@prose-heading":
    "@own(!:is([data-not-content] *)) & @own(!:is(h1 + *,h2 + *,h3 + *,h4 + *,h5 + *,h6 + *,[data-heading] + *))",
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
    properties: TASTY_SPACING_PROPERTIES,
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
