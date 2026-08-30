import { describe, expect, it } from "vitest";
import {
  activeNavigationTab,
  navigationItemsForPath,
  navigationPath,
  resolveNavigationLayout,
} from "./navigation.js";

describe("section navigation", () => {
  const layout = resolveNavigationLayout({
    items: ["/fallback"],
    tabs: [
      { label: "Docs", link: "/", items: ["/"] },
      {
        label: "Guide",
        link: "/getting-started",
        items: [
          {
            label: "Level one",
            items: [
              {
                label: "Level two",
                items: [{ label: "Configuration", link: "/configuration" }],
              },
            ],
          },
        ],
      },
      {
        label: "API",
        link: "/api",
        items: [{ label: "Generated", autogenerate: { directory: "/api" } }],
      },
    ],
  });

  it("assigns independent sidebar groups to configured tabs", () => {
    expect(layout.sectioned).toBe(true);
    expect(layout.fallbackSidebarGroup).toBe(0);
    expect(layout.tabs.map((tab) => tab.sidebarGroup)).toEqual([1, 2, 3]);

    const sectionsOnly = resolveNavigationLayout({
      tabs: [{ label: "Docs", link: "/", items: ["/"] }],
    });
    expect(sectionsOnly.fallbackSidebarGroup).toBeUndefined();
    expect(sectionsOnly.tabs[0]?.sidebarGroup).toBe(0);
  });

  it("keeps a tab active for deeply nested and non-prefix sidebar routes", () => {
    expect(activeNavigationTab(layout.tabs, "/configuration")).toBe(1);
    expect(navigationItemsForPath(layout, "/configuration")).toEqual(
      layout.tabs[1]?.items,
    );
    expect(activeNavigationTab(layout.tabs, "/api/classes/client")).toBe(2);
  });

  it("prefers a tab's direct URL over membership in another tab", () => {
    const tabs = [
      { label: "Guide", link: "/guide", items: ["/api"] },
      { label: "API", link: "/api", items: ["/api"] },
    ];
    expect(activeNavigationTab(tabs, "/api")).toBe(1);
  });

  it("removes the deployment base before matching", () => {
    expect(navigationPath("/manual/api/client/", "/manual/")).toBe(
      "/api/client",
    );
  });
});
