import { describe, expect, it } from "vitest";
import { resolveNavigationLayout } from "./navigation.js";
import { createRouteContext } from "./route-context.js";

const routes = [
  { route: "/", title: "Home", entryId: "home", sourcePath: "index.md" },
  { route: "/guide", title: "Guide", entryId: "guide", sourcePath: "guide.md" },
  {
    route: "/draft",
    title: "Draft",
    entryId: "draft",
    sourcePath: "draft.md",
    discoverable: false,
  },
];

describe("owned route context", () => {
  it("omits automatic pagination for a direct-only draft", () => {
    const route = createRouteContext({
      pathname: "/draft/",
      frontmatter: { draft: true, title: "Draft" },
      headings: [],
      layout: resolveNavigationLayout(["/", "/guide"]),
      content: { routes, base: "/", site: { title: "Docs" } },
    });
    expect(route.pagination).toEqual({});
    expect(
      route.sidebar.flatMap((item) =>
        item.type === "link" ? [item.href] : [],
      ),
    ).not.toContain("/draft");
  });

  it("does not mark an external link current because its path matches", () => {
    const route = createRouteContext({
      pathname: "/guide/",
      frontmatter: { title: "Guide" },
      headings: [],
      layout: resolveNavigationLayout([
        { label: "Outside", link: "https://example.com/guide" },
        "/guide",
      ]),
      content: { routes, base: "/", site: { title: "Docs" } },
    });
    expect(route.sidebar[0]).toMatchObject({ type: "link", isCurrent: false });
    expect(route.sidebar[1]).toMatchObject({ type: "link", isCurrent: true });
  });

  it("omits the contents sidebar on splash pages unless requested", () => {
    const headings = [{ depth: 2, slug: "features", text: "Features" }];
    const content = {
      routes,
      base: "/",
      site: { title: "Docs" },
      tableOfContents: { maxHeadingLevel: 3 },
    };
    const splash = createRouteContext({
      pathname: "/",
      frontmatter: { title: "Home", template: "splash" },
      headings,
      layout: resolveNavigationLayout(["/", "/guide"]),
      content,
    });
    expect(splash.hasSidebar).toBe(false);
    expect(splash.toc).toBeUndefined();

    const optedIn = createRouteContext({
      pathname: "/",
      frontmatter: {
        title: "Home",
        template: "splash",
        tableOfContents: { maxHeadingLevel: 3 },
      },
      headings,
      layout: resolveNavigationLayout(["/", "/guide"]),
      content,
    });
    expect(optedIn.toc?.items).toHaveLength(1);

    const guide = createRouteContext({
      pathname: "/guide/",
      frontmatter: { title: "Guide" },
      headings,
      layout: resolveNavigationLayout(["/", "/guide"]),
      content,
    });
    expect(guide.toc?.items).toHaveLength(1);
  });
});
