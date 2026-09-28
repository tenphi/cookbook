type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const alerts: Record<string, { kind: string; title: string }> = {
  NOTE: { kind: "note", title: "Note" },
  TIP: { kind: "tip", title: "Tip" },
  IMPORTANT: { kind: "tip", title: "Important" },
  WARNING: { kind: "caution", title: "Warning" },
  CAUTION: { kind: "danger", title: "Caution" },
};

/** Keep GitHub alert syntax useful in repository Markdown and MDX. */
export function rehypeAlerts() {
  return (tree: Node): void => visit(tree);
}

export const satteriAlerts = {
  name: "cookbook:alerts",
  element: {
    filter: ["blockquote"],
    visit(
      node: Readonly<Node>,
      context: { replaceNode(node: Readonly<Node>, replacement: Node): void },
    ): void {
      const replacement = alert(node as Node);
      if (replacement) context.replaceNode(node, replacement);
    },
  },
};

function visit(parent: Node): void {
  if (!parent.children) return;
  for (const [index, child] of parent.children.entries()) {
    const replacement = alert(child);
    if (replacement) parent.children[index] = replacement;
    else visit(child);
  }
}

function alert(blockquote: Node): Node | undefined {
  if (blockquote.type !== "element" || blockquote.tagName !== "blockquote")
    return;
  const first = blockquote.children?.find((child) => child.type === "element");
  if (first?.tagName !== "p") return;
  const marker = first.children?.find((child) => child.type === "text");
  if (!marker?.value) return;
  const match = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s|$)/i.exec(
    marker.value,
  );
  if (!match) return;
  const { kind, title } = alerts[match[1]!.toUpperCase()]!;
  const updatedFirst: Node = {
    ...first,
    children: first.children!.map((child) =>
      child === marker
        ? { ...child, value: child.value!.slice(match[0].length).trimStart() }
        : child,
    ),
  };
  const body =
    blockquote.children
      ?.map((child) => (child === first ? updatedFirst : child))
      .filter(
        (child) =>
          child !== updatedFirst ||
          updatedFirst.children?.some(
            (part) => part.type !== "text" || Boolean(part.value?.trim()),
          ),
      ) ?? [];
  return {
    type: "element",
    tagName: "aside",
    properties: {
      className: ["cookbook-alert", `cookbook-alert--${kind}`],
      ariaLabel: title,
    },
    children: [
      {
        type: "element",
        tagName: "p",
        properties: { className: ["cookbook-alert__title"] },
        children: [{ type: "text", value: title }],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["cookbook-alert__content"] },
        children: body,
      },
    ],
  };
}
