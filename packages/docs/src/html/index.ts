import type { Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { defaultSchema, sanitize } from "hast-util-sanitize";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";

const schema = {
  ...defaultSchema,
  strip: ["script", "style", "iframe", "object", "embed", "template"],
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), "source"],
  },
  attributes: {
    ...defaultSchema.attributes,
    "*":
      defaultSchema.attributes?.["*"]?.filter(
        (attribute) =>
          typeof attribute !== "string" ||
          ![
            "color",
            "bgColor",
            "align",
            "border",
            "cellPadding",
            "cellSpacing",
          ].includes(attribute),
      ) ?? [],
  },
};

/** Sanitize raw Markdown HTML while preserving separate inline opening/closing tags. */
export async function sanitizeMarkup(
  html: string,
  rewrite: (url: string, kind: "link" | "image") => Promise<string>,
): Promise<string> {
  const closing = /^<\/([a-z][a-z\d-]*)\s*>$/i.exec(html.trim());
  if (closing) {
    const tag = closing[1]?.toLowerCase() ?? "";
    return schema.tagNames?.includes(tag) ? `</${tag}>` : "";
  }
  const tree = sanitize(fromHtml(html, { fragment: true }), schema) as Root;
  const tasks: Promise<void>[] = [];
  visit(tree, "element", (element) => {
    for (const [property, kind] of [
      ["href", "link"],
      ["src", "image"],
    ] as const) {
      const value = element.properties[property];
      if (typeof value !== "string") continue;
      tasks.push(
        rewrite(value, kind).then((resolved) => {
          element.properties[property] = resolved;
        }),
      );
    }
  });
  await Promise.all(tasks);
  let result = toHtml(tree);
  // mdast represents inline <strong>text</strong> as three distinct nodes.
  const opening =
    /^<([a-z][a-z\d-]*)(?:\s+(?:[^<>"']|"[^"]*"|'[^']*')*)?\s*>$/i.exec(
      html.trim(),
    );
  const first = tree.children[0];
  if (
    opening &&
    tree.children.length === 1 &&
    first?.type === "element" &&
    first.tagName === opening[1]?.toLowerCase() &&
    first.children.length === 0
  ) {
    result = result.replace(new RegExp(`</${first.tagName}>$`), "");
  }
  return result;
}
