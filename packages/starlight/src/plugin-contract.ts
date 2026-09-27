import { DOCS_FRONTMATTER_KEYS, type DocsEntry } from "@tenphi/docs";
import type { StarlightPlugin } from "@astrojs/starlight/types";

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

/** Fail at the plugin that adds incompatible CSS, instead of silently dropping it. */
export function compatiblePlugins(
  plugins: StarlightPlugin[],
): StarlightPlugin[] {
  return plugins.map((plugin) => {
    const wrap =
      (
        hook: NonNullable<StarlightPlugin["hooks"]["config:setup"]>,
      ): typeof hook =>
      (context) => {
        if (plugin.name === "starlight-links-validator")
          throw new Error(
            "starlight-links-validator assumes physical src/content/docs files and cannot report errors for Cookbook’s mounted sources. Use cookbook doctor and cookbook check-build for graph and built-output link validation.",
          );
        if (
          plugin.name === "starlight-github-alerts" &&
          context.astroConfig.markdown.processor.name === "satteri"
        )
          throw new Error(
            "starlight-github-alerts is not compatible with the current Starlight Sätteri factory API. Install @astrojs/markdown-remark and set markdown.processor: unified() in astro.config.mjs, or use native :::note/:::tip directives. See Cookbook’s plugin compatibility guide.",
          );
        return hook({
          ...context,
          updateConfig(config) {
            if (config.customCss?.length)
              throw new Error(
                `Starlight plugin "${plugin.name}" adds customCss, which Cookbook cannot ship. Disable the plugin's stylesheet option or use a Tasty adapter with theme.styles. See Cookbook's plugin compatibility guide.`,
              );
            if (config.expressiveCode)
              throw new Error(
                `Starlight plugin "${plugin.name}" enables Expressive Code. Cookbook uses its Tasty-owned Shiki renderer; keep expressiveCode disabled.`,
              );
            context.updateConfig(config);
          },
        });
      };
    return {
      ...plugin,
      hooks: {
        ...plugin.hooks,
        ...(plugin.hooks["config:setup"]
          ? { "config:setup": wrap(plugin.hooks["config:setup"]) }
          : {}),
        ...(plugin.hooks.setup ? { setup: wrap(plugin.hooks.setup) } : {}),
      },
    };
  });
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
