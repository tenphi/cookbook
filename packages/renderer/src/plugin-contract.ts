import { DOCS_FRONTMATTER_KEYS, type DocsEntry } from "@tenphi/docs";

export type FrontmatterSchema =
  | {
      parseAsync(value: unknown): Promise<Record<string, unknown>>;
    }
  | {
      parse(value: unknown): Record<string, unknown>;
    };

export async function validatePluginFrontmatter(
  entries: DocsEntry[],
  schema: FrontmatterSchema | undefined,
): Promise<void> {
  if (!schema) return;
  for (const entry of entries) {
    try {
      const parsed =
        "parseAsync" in schema
          ? await schema.parseAsync(structuredClone(entry.metadata))
          : schema.parse(structuredClone(entry.metadata));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("The schema must return a frontmatter object.");
      for (const key of Object.keys(parsed)) {
        if (DOCS_FRONTMATTER_KEYS.has(key))
          throw new Error(
            `Custom schemas cannot set reserved field "${key}". Set it in source frontmatter instead.`,
          );
      }
      // Metadata crosses a JSON virtual module boundary, so reject lossy values.
      assertJsonMetadata(parsed);
      entry.metadata = { ...entry.metadata, ...parsed };
    } catch (error) {
      throw new Error(
        `Invalid plugin frontmatter in ${entry.sourcePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

function assertJsonMetadata(
  value: unknown,
  ancestors = new Set<object>(),
): void {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (
    typeof value !== "object" ||
    value === null ||
    ancestors.has(value) ||
    (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)
  )
    throw new Error(
      "Custom metadata must contain only JSON values (no dates, functions, cycles, or undefined).",
    );
  ancestors.add(value);
  for (const item of Object.values(value)) assertJsonMetadata(item, ancestors);
  ancestors.delete(value);
}
