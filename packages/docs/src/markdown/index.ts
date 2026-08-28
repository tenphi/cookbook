import GithubSlugger from "github-slugger";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import type {
  Content,
  Heading,
  Link,
  Paragraph,
  PhrasingContent,
  Root,
} from "mdast";
import { visit } from "unist-util-visit";
import type { DocsHeading } from "../types.js";

export interface ParsedMarkdown {
  ast: Root;
  headings: DocsHeading[];
  firstHeading?: string;
  description?: string;
}

export function parseMarkdown(body: string): ParsedMarkdown {
  const ast = fromMarkdown(body, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const slugger = new GithubSlugger();
  const headings: DocsHeading[] = [];
  let firstHeading: string | undefined;
  let description: string | undefined;

  visit(ast, (node) => {
    if (node.type === "heading") {
      const text = textContent(node);
      const slug = slugger.slug(text);
      firstHeading ??= node.depth === 1 ? text : undefined;
      headings.push({
        depth: node.depth,
        text,
        slug,
        ...(node.position?.start.line
          ? { line: node.position.start.line }
          : {}),
      });
    } else if (description === undefined && node.type === "paragraph") {
      const text = textContent(node).replace(/\s+/g, " ").trim();
      if (isSuitableDescription(node, text)) description = text.slice(0, 240);
    }
  });

  return {
    ast,
    headings,
    ...(firstHeading ? { firstHeading } : {}),
    ...(description ? { description } : {}),
  };
}

function isSuitableDescription(node: Paragraph, text: string): boolean {
  if (text.length < 20) return false;
  return !node.children.every((child) =>
    ["image", "imageReference", "link", "linkReference", "html"].includes(
      child.type,
    ),
  );
}

export function textContent(
  node: Heading | Paragraph | PhrasingContent,
): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node)
    return node.children.map((child) => textContent(child)).join("");
  if (node.type === "image") return node.alt ?? "";
  return "";
}

export function serializeMarkdown(ast: Root): string {
  return toMarkdown(ast, { extensions: [gfmToMarkdown()] });
}

export function removeRenderedTitle(ast: Root, title: string): void {
  const first = ast.children[0];
  if (
    first?.type === "heading" &&
    first.depth === 1 &&
    textContent(first) === title
  ) {
    ast.children.shift();
  }
}

export function stripLeadingBadgeBlock(ast: Root): void {
  while (ast.children[0]?.type === "paragraph") {
    const paragraph = ast.children[0];
    const onlyBadgeLike = paragraph.children.every((node) => {
      if (node.type === "text") return node.value.trim() === "";
      if (node.type === "image" || node.type === "imageReference") return true;
      if (node.type === "link") {
        return node.children.every((child) => child.type === "image");
      }
      return false;
    });
    if (!onlyBadgeLike) break;
    ast.children.shift();
  }
}

export function linksIn(ast: Root): Link[] {
  const links: Link[] = [];
  visit(ast, "link", (node) => links.push(node));
  return links;
}

export function cloneAst(ast: Root): Root {
  return structuredClone(ast);
}

export function childrenOf(ast: Root): Content[] {
  return ast.children;
}
