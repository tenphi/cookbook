import { configure, getGlobalPredefinedStates } from "@tenphi/tasty";

export const cookbookStates = {
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

/** Configure aliases in the renderer's Tasty module before styles are parsed. */
export function configureCookbookStates() {
  if (configured) return;
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
