const headingPattern =
  /<div\b[^>]*\bclass=["'][^"']*\bsl-heading-wrapper\b[^"']*["'][^>]*>[\s\S]*?<\/div>|<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
const idPattern = /\sid=(['"])(.*?)\1/i;
const tags = /<[^>]*>/g;

/** Wrap rendered headings with a visible, accessible permalink. */
export function addHeadingPermalinks(html: string): string {
  return html.replace(
    headingPattern,
    (
      heading,
      level: string | undefined,
      attributes: string | undefined,
      content: string | undefined,
    ) => {
      // Starlight adds its own icon permalink before this rendered HTML reaches
      // the MarkdownContent override. Consume that complete wrapper unchanged
      // so the inner heading is not matched and wrapped a second time.
      if (!level || attributes === undefined || content === undefined) {
        return heading;
      }
      const id = idPattern.exec(attributes)?.[2];
      if (!id) return heading;
      const title = escapeAttribute(
        decodeEntities(content.replace(tags, "").trim()),
      );
      return `<div class="sl-heading-wrapper level-h${level}">${heading}<a class="sl-anchor-link" href="#${escapeAttribute(id)}" aria-label="Permalink to “${title}”">#</a></div>`;
    },
  );
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|apos|gt|lt|quot));/gi,
    (entity, decimal: string, hexadecimal: string, name: string) => {
      const point = decimal
        ? Number.parseInt(decimal, 10)
        : hexadecimal
          ? Number.parseInt(hexadecimal, 16)
          : undefined;
      return point === undefined
        ? (named[name.toLowerCase()] ?? entity)
        : String.fromCodePoint(point);
    },
  );
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
