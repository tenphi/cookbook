import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PREVIEW_HEIGHT_MESSAGE } from "./client/preview-height.js";
import type { PreviewProps } from "./components/props.js";

// The frame's height and buffer become CSS, so accept only a plain length.
// Percentages are rejected because the frame's container has no fixed height.
const CSS_LENGTH =
  /^(?:\d+|\d*\.\d+)(?:px|r?em|ch|ex|r?lh|[dls]?v(?:h|w|min|max)|cm|mm|in|pt|pc)$/;

/**
 * Runs first in a preview frame that allows scripts, so it keeps `parent` even
 * if authored code declares its own. It measures the root element's box rather
 * than `scrollHeight`, which never drops below the frame's own height: the
 * root's height follows the content, so the frame can shrink, and growing the
 * frame doesn't change the measurement. A horizontal scrollbar, if any, is
 * added so that it doesn't overflow the content vertically. The frame's origin
 * is opaque, so the message is posted to any origin.
 */
export const previewHeightReporter = `{
const root = document.documentElement;
const page = parent;
const report = () => page.postMessage({ type: "${PREVIEW_HEIGHT_MESSAGE}", height: root.getBoundingClientRect().height + window.innerHeight - root.clientHeight }, "*");
new ResizeObserver(report).observe(root);
addEventListener("message", (event) => { if (event.data?.type === "${PREVIEW_HEIGHT_MESSAGE}") report(); });
}`;

/**
 * Build a Preview's frame document, its "View source" text and the frame's
 * settings. Public scripts are inlined so they run in the opaque-origin sandbox
 * without a request. A frame that runs scripts also reports its content height
 * so the page can size it, adding the buffer; a frame without scripts keeps its
 * minimum height, and nothing measures its content to add a buffer to.
 */
export async function buildPreview(
  {
    html = "",
    css = "",
    javascript,
    scripts = [],
    height,
    buffer,
  }: Omit<PreviewProps, "title">,
  publicDir: string,
  page: string,
) {
  for (const [name, value] of [
    ["height", height],
    ["buffer", buffer],
  ])
    if (value !== undefined && !CSS_LENGTH.test(value))
      throw Error(
        `Preview on ${page}: ${name} ${value} must be a CSS length, such as 18rem or 320px.`,
      );
  const files = await Promise.all(
    scripts.map((src) => readPublicScript(src, publicDir, page)),
  );
  const head = '<!doctype html><meta charset="utf-8">';
  const body = `<style>${css}</style>${html}`;
  const authored = javascript ? inlineScript(javascript) : "";
  const runsScripts = Boolean(scripts.length || javascript);
  return {
    // The height reporter runs first, before authored code can shadow `parent`.
    document:
      head +
      (runsScripts ? inlineScript(previewHeightReporter) : "") +
      body +
      files.map(inlineScript).join("") +
      authored,
    source:
      head +
      body +
      scripts.map((src) => `<script src="${src}"></script>`).join("") +
      authored,
    // A submitted form can navigate only the frame itself, as a link can.
    sandbox: runsScripts ? "allow-forms allow-scripts" : "allow-forms",
    height,
    buffer: runsScripts ? buffer : undefined,
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
