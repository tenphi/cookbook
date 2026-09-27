import { createHash } from "node:crypto";
import {
  pagePublishing,
  routeUrl,
  type DocsEntry,
  type DocsRoute,
  type HeadConfig,
  type SiteConfig,
  type DocsConfig,
} from "@tenphi/docs";

export function pageMetadata(
  entry: DocsEntry,
  content: {
    site: SiteConfig;
    base: string;
    routes: DocsRoute[];
    locales?: DocsConfig["locales"];
  },
  existing: HeadConfig[],
): HeadConfig[] {
  const publishing = pagePublishing(entry, {
    site: content.site,
    ...(content.locales ? { locales: content.locales } : {}),
    build: { base: content.base },
  });
  const { canonical, title, image, index } = publishing;
  const owned = new Set([
    "og:title",
    "og:url",
    "og:image",
    "og:image:alt",
    "og:image:width",
    "og:image:height",
    "twitter:card",
    "twitter:title",
    "twitter:image",
    "twitter:image:alt",
    "robots",
  ]);
  const head = existing.filter(
    (tag) =>
      tag.tag !== "title" &&
      !(tag.tag === "link" && tag.attrs?.rel === "canonical") &&
      !(
        tag.tag === "meta" &&
        owned.has(String(tag.attrs?.name ?? tag.attrs?.property).toLowerCase())
      ),
  );
  const meta = (name: string, value: string, property = false) =>
    head.push({
      tag: "meta",
      attrs: { [property ? "property" : "name"]: name, content: value },
    });
  head.push({ tag: "title", content: escapeHtml(title) });
  if (/^https?:/.test(canonical)) {
    head.push({ tag: "link", attrs: { rel: "canonical", href: canonical } });
    meta("og:url", canonical, true);
  }
  meta("og:title", title, true);
  meta("twitter:title", title);
  meta("twitter:card", image ? "summary_large_image" : "summary");
  if (!index) meta("robots", "noindex, follow");
  if (image) {
    const path = image.src.startsWith("/")
      ? `${content.base.replace(/\/$/, "")}${image.src}`
      : image.src;
    const url = content.site.url ? new URL(path, content.site.url).href : path;
    meta("og:image", url, true);
    meta("og:image:alt", image.alt, true);
    meta("twitter:image", url);
    meta("twitter:image:alt", image.alt);
    if (image.width && image.height) {
      meta("og:image:width", String(image.width), true);
      meta("og:image:height", String(image.height), true);
    }
  }
  meta("cookbook:source", entry.sourcePath);
  if (publishing.version?.label ?? content.site.version)
    meta(
      "cookbook:version",
      publishing.version?.label ?? content.site.version!,
    );
  if (content.site.seo?.copyPage !== false && !entry.frontmatter.draft)
    head.push({
      tag: "link",
      attrs: {
        rel: "alternate",
        type: "text/markdown",
        title: "Markdown",
        href: agentPagePath(entry.route, content.base),
      },
    });
  const configured = entry.frontmatter.seo?.breadcrumbs;
  if (
    configured !== false &&
    (configured || content.site.seo?.breadcrumbs) &&
    /^https?:/.test(canonical)
  ) {
    const crumbs =
      configured ??
      content.routes
        .filter(
          (route) =>
            route.discoverable !== false &&
            (route.route === "/" ||
              route.route === entry.route ||
              entry.route.startsWith(`${route.route}/`)),
        )
        .sort((a, b) => a.route.length - b.route.length)
        .map((route) => ({
          name: route.title,
          url:
            route.route === entry.route
              ? canonical
              : routeUrl(route.route, content.base, content.site.url),
        }));
    if (configured && crumbs.at(-1)?.url !== canonical)
      throw new Error(
        `seo.breadcrumbs in ${entry.sourcePath} must end with the page's canonical URL (${canonical}).`,
      );
    if (crumbs.length >= 2)
      head.push({
        tag: "script",
        attrs: { type: "application/ld+json" },
        content: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        }).replaceAll("<", "\\u003c"),
      });
  }
  return head;
}

/** Stable short asset names also support deeply nested and non-ASCII routes. */
export function agentPagePath(route: string, base = "/"): string {
  return `${base.replace(/\/$/, "")}/_cookbook/pages/${createHash("sha256").update(route).digest("hex").slice(0, 32)}.md`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
