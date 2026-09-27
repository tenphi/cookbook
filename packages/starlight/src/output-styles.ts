import { fromHtml } from "hast-util-from-html";

/** Parse attributes rather than matching text in code, scripts or escaped srcdoc. */
export function assertTastyOutput(html: string, path: string): void {
  const tree = fromHtml(html);
  const visit = (node: {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: unknown[];
    content?: unknown;
  }) => {
    const props = node.properties ?? {};
    const stylesheet =
      node.tagName === "link" &&
      Array.isArray(props.rel) &&
      props.rel.includes("stylesheet");
    if (
      node.tagName === "style" ||
      Object.hasOwn(props, "style") ||
      (stylesheet && !Object.hasOwn(props, "dataTastySsr"))
    ) {
      throw new Error(
        `Non-Tasty CSS found in ${path}: <${node.tagName}${Object.hasOwn(props, "style") ? " style=…" : ""}>. Use theme.styles or Tasty components; isolate example CSS in a sandboxed Preview.`,
      );
    }
    // srcdoc is another document. Only a sandbox without same-origin access may
    // contain authored styles. A template/shadow root is still part of this one.
    if (
      typeof props.srcDoc === "string" &&
      (!Array.isArray(props.sandbox) ||
        props.sandbox.includes("allow-same-origin"))
    )
      assertTastyOutput(props.srcDoc, `${path} (unsandboxed iframe)`);
    node.children?.forEach((child) => visit(child as typeof node));
    if (node.content) visit(node.content as typeof node);
  };
  visit(tree);
}
