import { describe, expect, it } from "vitest";
import { pageMetadata, agentPagePath } from "./page-metadata.js";
import type { DocsEntry, DocsRoute } from "@tenphi/docs";
const page = {
  route: "/guide",
  title: "Guide",
  frontmatter: {},
  sourcePath: "docs/guide.md",
} as DocsEntry;
const content = {
  site: { title: "Docs", url: "https://example.com" },
  base: "/manual/",
  routes: [
    { route: "/", title: "Home" },
    { route: "/guide", title: "Guide" },
  ] as DocsRoute[],
};
describe("page head", () => {
  it("replaces managed fields once, keeps custom tags, and only advertises an image when provided", () => {
    const head = pageMetadata(page, content, [
      { tag: "title", content: "Old" },
      {
        tag: "meta",
        attrs: { name: "twitter:card", content: "summary_large_image" },
      },
      { tag: "meta", attrs: { name: "custom", content: "keep" } },
    ]);
    expect(head.filter((t) => t.tag === "title")).toHaveLength(1);
    expect(
      head.find((t) => t.attrs?.name === "twitter:card")?.attrs?.content,
    ).toBe("summary");
    expect(head.find((t) => t.attrs?.name === "custom")).toBeTruthy();
    expect(
      head.find((t) => t.attrs?.type === "text/markdown")?.attrs?.href,
    ).toBe(agentPagePath("/guide", "/manual/"));
  });
  it("escapes title HTML and JSON-LD script delimiters", () => {
    const head = pageMetadata(
      {
        ...page,
        frontmatter: {
          seo: {
            title: "<script>bad</script>",
            breadcrumbs: [
              { name: "</script>", url: "https://example.com/" },
              { name: "Guide", url: "https://example.com/manual/guide/" },
            ],
          },
        },
      },
      content,
      [],
    );
    expect(head.find((t) => t.tag === "title")?.content).toBe(
      "&lt;script&gt;bad&lt;/script&gt;",
    );
    expect(head.find((t) => t.tag === "script")?.content).not.toContain(
      "</script>",
    );
    expect(
      JSON.parse(head.find((t) => t.tag === "script")!.content!)
        .itemListElement[0].name,
    ).toBe("</script>");
  });
  it("generates base-aware images, honors false and validates breadcrumb destination", () => {
    const head = pageMetadata(
      {
        ...page,
        frontmatter: {
          seo: {
            image: {
              src: "/social.png",
              alt: "Docs",
              width: 1200,
              height: 630,
            },
          },
        },
      },
      content,
      [],
    );
    expect(
      head.find((t) => t.attrs?.property === "og:image")?.attrs?.content,
    ).toBe("https://example.com/manual/social.png");
    expect(() =>
      pageMetadata(
        {
          ...page,
          frontmatter: {
            seo: {
              breadcrumbs: [
                { name: "Home", url: "https://example.com" },
                { name: "Wrong", url: "https://example.com/wrong" },
              ],
            },
          },
        },
        content,
        [],
      ),
    ).toThrow("must end");
    const hidden = pageMetadata(
      { ...page, frontmatter: { draft: true } },
      content,
      [],
    );
    expect(hidden.find((t) => t.attrs?.name === "robots")?.attrs?.content).toBe(
      "noindex, follow",
    );
    expect(hidden.some((t) => t.attrs?.type === "text/markdown")).toBe(false);
  });
  it("uses stable distinct safe paths for root, index, non-ASCII and deep routes", () => {
    const paths = ["/", "/index", "/é", "/a/b", "/a%2Fb"].map((r) =>
      agentPagePath(r),
    );
    expect(new Set(paths).size).toBe(5);
    for (const path of paths)
      expect(path).toMatch(/^\/_cookbook\/pages\/[a-f0-9]{32}\.md$/);
  });
});
