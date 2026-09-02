import { renderMermaidSVG } from "beautiful-mermaid";

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type SatteriContext = {
  replaceNode(node: Readonly<HastNode>, replacement: HastNode): void;
  setProperty(node: Readonly<HastNode>, key: string, value: unknown): void;
  textContent(node: Readonly<HastNode>): string;
};

const sourceStyleDirective = /^\s*(?:classDef|style|linkStyle)\s+.*$/gim;
const accessibilityDirective = /^\s*acc(?:Title|Descr):\s*.*$/gim;
const svgStyleBlock = /\s*<style>[\s\S]*?<\/style>\s*/gi;
const supportedDiagram =
  /^(?:(?:flowchart|graph)(?:\s+(?:TB|TD|BT|RL|LR))?|stateDiagram(?:-v2)?|sequenceDiagram|classDiagram|erDiagram)\b/i;

/** Render supported Mermaid fences to theme-responsive SVG at build time. */
export function rehypeMermaid() {
  return (tree: HastNode): void => {
    replaceMermaidCodeBlocks(tree);
  };
}

/** Sätteri adapter for Astro's default Markdown processor. */
export const satteriMermaid = {
  name: "cookbook:mermaid",
  element: {
    filter: ["pre"],
    visit(node: Readonly<HastNode>, context: SatteriContext): void {
      if (!isMermaidCodeBlock(node)) return;
      try {
        context.replaceNode(node, {
          type: "raw",
          value: renderMermaidElement(context.textContent(node)),
        });
      } catch {
        context.setProperty(node, "data-mermaid-state", "error");
      }
    },
  },
};

function replaceMermaidCodeBlocks(parent: HastNode): void {
  if (!parent.children) return;
  for (const [index, child] of parent.children.entries()) {
    if (isMermaidCodeBlock(child)) {
      const source = textContent(child);
      try {
        parent.children[index] = {
          type: "raw",
          value: renderMermaidElement(source),
        };
      } catch {
        child.properties = {
          ...child.properties,
          "data-mermaid-state": "error",
        };
      }
      continue;
    }
    replaceMermaidCodeBlocks(child);
  }
}

function renderMermaidElement(source: string): string {
  const svg = accessibleSvg(render(source), source);
  return `<div class="td-mermaid" data-mermaid-state="ready">${svg}</div>`;
}

function isMermaidCodeBlock(node: HastNode): boolean {
  if (node.type !== "element" || node.tagName !== "pre") return false;
  return (
    node.properties?.dataLanguage === "mermaid" ||
    node.properties?.["data-language"] === "mermaid"
  );
}

function render(source: string): string {
  const header = source
    .split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line && !line.startsWith("%%") && !/^acc(?:Title|Descr):/i.test(line),
    );
  if (!header || !supportedDiagram.test(header)) {
    throw new Error("Unsupported Mermaid diagram type");
  }

  // Cookbook renders package Markdown too. Do not allow diagram-authored CSS
  // to escape the diagram's visual boundary; the site theme owns all colors.
  const safeSource = source
    .replace(sourceStyleDirective, "")
    .replace(accessibilityDirective, "");
  return renderMermaidSVG(safeSource, {
    bg: "var(--surface-2-color)",
    fg: "var(--text-color)",
    line: "var(--text-soft-color)",
    accent: "var(--accent-text-color)",
    muted: "var(--text-soft-color)",
    surface: "var(--surface-color)",
    border: "var(--border-strong-color)",
    font: "Onest Variable",
    transparent: true,
  }).replace(svgStyleBlock, "");
}

function accessibleSvg(svg: string, source: string): string {
  const title = directive(source, "accTitle") ?? "Diagram";
  const description =
    directive(source, "accDescr") ?? "Rendered from a Mermaid code block.";
  return svg
    .replace("<svg ", `<svg role="img" aria-label="${escapeAttribute(title)}" `)
    .replace(
      /(<svg\b[^>]*>)/,
      `$1<title>${escapeText(title)}</title><desc>${escapeText(description)}</desc>`,
    );
}

function directive(source: string, name: string): string | undefined {
  const match = source.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim();
}

function textContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return node.children?.map(textContent).join("") ?? "";
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
