import { configure } from "@tenphi/tasty";

export const cookbookStates = {
  "@mobile": "@media(w < 50rem)",
  "@desktop": "@media(w >= 50rem)",
  "@small": "@media(w <= 40rem)",
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
  configure({ states: cookbookStates });
  configured = true;
}
