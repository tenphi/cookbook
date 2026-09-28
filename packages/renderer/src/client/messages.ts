import { ENGLISH_MESSAGES, type MessageKey } from "../localization.js";
export function message(key: MessageKey): string {
  try {
    const custom = JSON.parse(
      document
        .querySelector('meta[name="cookbook-messages"]')
        ?.getAttribute("content") ?? "{}",
    );
    return typeof custom[key] === "string"
      ? custom[key]
      : ENGLISH_MESSAGES[key];
  } catch {
    return ENGLISH_MESSAGES[key];
  }
}
