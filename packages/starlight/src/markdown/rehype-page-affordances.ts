type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type SatteriContext = {
  replaceNode(node: Readonly<HastNode>, replacement: HastNode): void;
  textContent(node: Readonly<HastNode>): string;
};

/** Add copy controls to rendered Markdown code blocks. */
export function rehypePageAffordances() {
  return (tree: HastNode): void => addPageAffordances(tree);
}

/** Sätteri adapter for Astro's default Markdown processor. */
export const satteriPageAffordances = {
  name: "cookbook:page-affordances",
  element: {
    filter: ["pre"],
    visit(node: Readonly<HastNode>, context: SatteriContext): void {
      const replacement = pageAffordance(node as HastNode);
      if (replacement !== node) context.replaceNode(node, replacement);
    },
  },
};

function addPageAffordances(parent: HastNode): void {
  if (!parent.children) return;
  for (const [index, child] of parent.children.entries()) {
    const replacement = pageAffordance(child);
    if (replacement !== child) {
      parent.children[index] = replacement;
      continue;
    }
    addPageAffordances(child);
  }
}

function pageAffordance(node: HastNode): HastNode {
  if (isOrdinaryCodeBlock(node)) return codeBlockWithCopy(node);
  return node;
}

function isOrdinaryCodeBlock(node: HastNode): boolean {
  if (node.type !== "element" || node.tagName !== "pre") return false;
  const language =
    node.properties?.dataLanguage ?? node.properties?.["data-language"];
  return language !== "mermaid" && node.children?.[0]?.tagName === "code";
}

function codeBlockWithCopy(pre: HastNode): HastNode {
  return element(
    "cookbook-code-block",
    { className: ["td-code-block"], dataTastyAnatomy: "MarkdownCodeBlock" },
    [
      pre,
      element(
        "button",
        {
          type: "button",
          dataCopyCode: "",
          ariaLabel: "Copy code",
          title: "Copy code",
        },
        [element("span", { dataCopyIcon: "", ariaHidden: "true" }, [])],
      ),
    ],
  );
}

function element(
  tagName: string,
  properties: Record<string, unknown>,
  children: HastNode[],
): HastNode {
  return { type: "element", tagName, properties, children };
}
