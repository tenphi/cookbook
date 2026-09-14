import type { Styles, tasty } from "@tenphi/tasty";

/** Merge theme.styles[name] into a Tasty component's defaults. */
export function customizeComponent<Props extends { styles?: Styles }>(
  name: string,
  base: Parameters<typeof tasty<Props>>[0],
): ReturnType<typeof tasty<Props, {}>>;
