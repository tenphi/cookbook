type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type SatteriContext = {
  replaceNode(node: Readonly<HastNode>, replacement: HastNode): void;
};

const containerClass = "td-table-scroll";

/** Wrap Markdown tables in a dedicated horizontal scroll container. */
export function rehypeTableScroll() {
  return (tree: HastNode): void => {
    wrapTables(tree);
  };
}

/** Sätteri adapter for Astro's default Markdown processor. */
export const satteriTableScroll = {
  name: "cookbook:table-scroll",
  element: {
    filter: ["table"],
    visit(node: Readonly<HastNode>, context: SatteriContext): void {
      context.replaceNode(node, scrollContainer(node as HastNode));
    },
  },
};

function wrapTables(parent: HastNode): void {
  if (!parent.children || isScrollContainer(parent)) return;
  for (const [index, child] of parent.children.entries()) {
    if (child.type === "element" && child.tagName === "table") {
      parent.children[index] = scrollContainer(child);
      continue;
    }
    wrapTables(child);
  }
}

function scrollContainer(table: HastNode): HastNode {
  return {
    type: "element",
    tagName: "div",
    properties: { className: [containerClass] },
    children: [table],
  };
}

function isScrollContainer(node: HastNode): boolean {
  const className = node.properties?.className;
  return (
    node.type === "element" &&
    node.tagName === "div" &&
    Array.isArray(className) &&
    className.includes(containerClass)
  );
}
