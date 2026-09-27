import type { DocsEntry } from "@tenphi/docs";
import { content } from "virtual:cookbook/config";
import { normalizeNavigationPath } from "./navigation.js";

/** Cookbook's build-time content graph. Return snapshots so consumers cannot mutate routing. */
export function getCookbookCollection(
  options: { includeDrafts?: boolean } = {},
): DocsEntry[] {
  return structuredClone(
    content.entries.filter(
      (entry) => options.includeDrafts || !entry.frontmatter.draft,
    ),
  );
}

/** Exact, base-free documentation route. Direct lookup can retrieve drafts. */
export function getCookbookEntry(route: string): DocsEntry | undefined {
  const entry = content.entries.find(
    (entry) => entry.route === normalizeNavigationPath(route),
  );
  return entry ? structuredClone(entry) : undefined;
}
