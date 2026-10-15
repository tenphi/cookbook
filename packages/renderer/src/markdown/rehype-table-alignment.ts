type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type SatteriContext = {
  replaceNode(node: Readonly<HastNode>, replacement: HastNode): void;
};

const alignments = new Set(["left", "center", "right"]);

/**
 * Move GFM column alignment into a `data-align` modifier styled by
 * `MarkdownTable`. Unified emits the obsolete `align` attribute and Sätteri an
 * inline `text-align` style, which the Tasty-only output check rejects.
 */
export function rehypeTableAlignment() {
  return (tree: HastNode): void => visit(tree);
}

/** Sätteri adapter for Astro's default Markdown processor. */
export const satteriTableAlignment = {
  name: "cookbook:table-alignment",
  element: {
    filter: ["th", "td"],
    visit(node: Readonly<HastNode>, context: SatteriContext): void {
      const replacement = alignedCell(node as HastNode);
      if (replacement) context.replaceNode(node, replacement);
    },
  },
};

function visit(parent: HastNode): void {
  if (!parent.children) return;
  for (const [index, child] of parent.children.entries()) {
    const replacement = alignedCell(child);
    if (replacement) parent.children[index] = replacement;
    else visit(child);
  }
}

function alignedCell(cell: HastNode): HastNode | undefined {
  if (
    cell.type !== "element" ||
    (cell.tagName !== "th" && cell.tagName !== "td")
  )
    return;
  const { align, style, ...properties } = cell.properties ?? {};
  const value =
    typeof align === "string"
      ? align
      : typeof style === "string"
        ? /^\s*text-align:\s*([a-z]+)\s*;?\s*$/i.exec(style)?.[1]
        : undefined;
  const alignment = value?.toLowerCase();
  if (!alignment || !alignments.has(alignment)) return;
  return {
    ...cell,
    properties: { ...properties, dataAlign: alignment },
  };
}
