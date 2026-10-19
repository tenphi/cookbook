import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PreviewProps } from "./components/props.js";

/**
 * Build a Preview's frame document and its "View source" text. Public scripts
 * are inlined so they run in the opaque-origin sandbox without a request.
 */
export async function buildPreview(
  {
    html = "",
    css = "",
    javascript,
    scripts = [],
  }: Omit<PreviewProps, "title">,
  publicDir: string,
  page: string,
) {
  const files = await Promise.all(
    scripts.map((src) => readPublicScript(src, publicDir, page)),
  );
  const markup = `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`;
  const authored = javascript ? inlineScript(javascript) : "";
  return {
    document: markup + files.map(inlineScript).join("") + authored,
    source:
      markup +
      scripts.map((src) => `<script src="${src}"></script>`).join("") +
      authored,
    sandbox: scripts.length || javascript ? "allow-scripts" : "",
  };
}

// The HTML parser ends a script at the first `</script`, even inside a string.
function inlineScript(code: string) {
  return `<script>${code.replace(/<\/(script)/gi, "<\\/$1")}</script>`;
}

async function readPublicScript(src: string, publicDir: string, page: string) {
  const error = `Preview on ${page}: script ${src} must be a readable file in the site's public directory, such as /demo/button.js.`;
  if (!/^\/(?!\/)/.test(src) || src.split(/[\\/]/).includes(".."))
    throw Error(error);
  try {
    return await readFile(join(publicDir, src), "utf8");
  } catch {
    throw Error(error);
  }
}
