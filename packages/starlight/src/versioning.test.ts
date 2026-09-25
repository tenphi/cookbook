import { describe, expect, it } from "vitest";
import { versionLinks } from "./versioning.js";

const versions = [
  { label: "Latest", routeBase: "/" },
  { label: "v1", routeBase: "/v1" },
];
const routes = ["/", "/guide", "/v1", "/v1/guide"].map((route) => ({
  route,
  entryId: route,
  sourcePath: `${route}.md`,
  title: route,
}));

describe("version navigation", () => {
  it("keeps a matching page and deployment base", () => {
    expect(versionLinks(versions, routes, "/v1/guide", "/manual")).toEqual({
      current: versions[1],
      links: [
        { ...versions[0], href: "/manual/guide" },
        { ...versions[1], href: "/manual/v1/guide" },
      ],
    });
  });

  it("falls back to the target version root if a page is missing", () => {
    const links = versionLinks(versions, routes, "/new-only").links;
    expect(links[1]?.href).toBe("/v1");
  });
});
