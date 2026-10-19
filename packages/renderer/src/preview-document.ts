import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PreviewProps } from "./components/props.js";

// The frame's height becomes generated CSS, so accept only a plain length.
// Percentages are rejected because the frame's container has no fixed height.
const CSS_LENGTH =
  /^(?:\d+|\d*\.\d+)(?:px|r?em|ch|ex|r?lh|[dls]?v(?:h|w|min|max)|cm|mm|in|pt|pc)$/;

/**
 * Build a Preview's frame document, its "View source" text and the frame's
 * settings. Public scripts are inlined so they run in the opaque-origin sandbox
 * without a request.
 */
export async function buildPreview(
  {
    html = "",
    css = "",
    javascript,
    scripts = [],
    height,
  }: Omit<PreviewProps, "title">,
  publicDir: string,
  page: string,
) {
  if (height !== undefined && !CSS_LENGTH.test(height))
    throw Error(
      `Preview on ${page}: height ${height} must be a CSS length, such as 18rem or 320px.`,
    );
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
    // A submitted form can navigate only the frame itself, as a link can.
    sandbox:
      scripts.length || javascript
        ? "allow-forms allow-scripts"
        : "allow-forms",
    height,
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
