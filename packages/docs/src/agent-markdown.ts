import type { DocsEntry } from "./types.js";
import { pagePublishing, type PublishingConfig } from "./publishing.js";
import { serializeMarkdown } from "./markdown/index.js";

type Node = { type: string; value?: string; name?: string; children?: Node[] };
/** A reading representation: retain prose/code/links, omit executable MDX and raw HTML. */
export function renderAgentMarkdown(
  entry: DocsEntry,
  config: PublishingConfig,
): string {
  const tree = structuredClone(entry.ast) as Node;
  function clean(node: Node): Node[] {
    if (
      ["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression", "html"].includes(
        node.type,
      )
    )
      return [];
    const children = node.children?.flatMap(clean);
    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      if (node.name && ["script", "style", "Preview"].includes(node.name))
        return [];
      return children ?? [];
    }
    return [{ ...node, ...(children ? { children } : {}) }];
  }
  const body = serializeMarkdown(clean(tree)[0] as typeof entry.ast, {
    mdx: false,
  });
  const pub = pagePublishing(entry, config);
  const prefix = entry.route.split("/")[1];
  const locale =
    prefix && config.locales?.[prefix]
      ? prefix
      : (config.defaultLocale ?? "root");
  const language =
    config.locales?.[locale]?.lang ?? (locale === "root" ? "en" : locale);
  const metadata = {
    language,
    title: entry.title,
    canonical: pub.canonical,
    source: entry.sourcePath,
    version: pub.version?.label ?? config.site?.version,
    index: pub.index,
  };
  const lines = Object.entries(metadata)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join("\n")}\n---\n\n# ${entry.title.replace(/\s+/g, " ")}\n\n${body}`;
}
