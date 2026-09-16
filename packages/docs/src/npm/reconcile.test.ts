import { describe, expect, it, vi } from "vitest";
import { defaultLock, lockForSource, reconcileDocsLock } from "./index.js";
import type { PackageLockSource } from "../types.js";
const locked = (requested: string, version = "1.0.0"): PackageLockSource => ({
  requested,
  resolved: `fixture@${version}`,
  registry: "https://registry.npmjs.org/",
  integrity: `sha512-${version}`,
});
describe("package lock reconciliation", () => {
  it("creates the first lock from declarations and deduplicates mounts", async () => {
    const resolve = vi.fn(async (name: string) => locked(name));
    const next = await reconcileDocsLock(
      {
        content: {
          sources: [
            { package: "fixture@latest", routeBase: "/a" },
            { package: "fixture@latest", routeBase: "/b" },
          ],
        },
      },
      undefined,
      { resolve },
    );
    expect(next.sources).toEqual([locked("fixture@latest")]);
    expect(resolve).toHaveBeenCalledTimes(1);
  });
  it("rejects stale requests rather than falling back to a package name", () => {
    expect(() =>
      lockForSource(defaultLock([locked("fixture@^1")]), "fixture@^2"),
    ).toThrow(/is not locked/);
  });
  it("shares an explicit registry across mounts and rejects conflicting registries", async () => {
    const resolve = vi.fn(async (name: string) => locked(name));
    await reconcileDocsLock(
      {
        content: {
          sources: [
            { package: "fixture@latest" },
            { package: "fixture@latest", registry: "https://npm.example.com/" },
          ],
        },
      },
      undefined,
      { resolve },
    );
    expect(resolve).toHaveBeenCalledWith("fixture@latest", {
      registry: "https://npm.example.com/",
    });
    await expect(
      reconcileDocsLock(
        {
          content: {
            sources: [
              {
                package: "fixture@latest",
                registry: "https://one.example.com/",
              },
              {
                package: "fixture@latest",
                registry: "https://two.example.com/",
              },
            ],
          },
        },
        undefined,
        { resolve },
      ),
    ).rejects.toThrow(/conflicting registries/);
  });
  it("reconciles changed requests and prunes removed packages", async () => {
    const next = await reconcileDocsLock(
      { content: { sources: [{ package: "fixture@^2" }] } },
      defaultLock([locked("fixture@^1"), locked("unused@latest")]),
      { resolve: async (name) => locked(name, "2.0.0") },
    );
    expect(next.sources).toEqual([locked("fixture@^2", "2.0.0")]);
  });
  it("updates only selected sources and keeps other locks unchanged", async () => {
    const existing = defaultLock([
      locked("fixture@latest"),
      locked("other@latest"),
    ]);
    const resolve = vi.fn(async (name: string) => locked(name, "2.0.0"));
    const config = {
      content: {
        sources: [{ package: "fixture@latest" }, { package: "other@latest" }],
      },
    };
    const next = await reconcileDocsLock(config, existing, {
      packages: ["fixture"],
      resolve,
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(next.sources[1]).toBe(existing.sources[1]);
    await expect(
      reconcileDocsLock(config, existing, { packages: ["missing"], resolve }),
    ).rejects.toThrow(/No configured/);
  });
  it("preserves offline intent without overwriting the previous vendored tree", async () => {
    const previous = {
      ...locked("fixture@latest"),
      vendored: ".cookbook/vendor/package",
    };
    const next = await reconcileDocsLock(
      { content: { sources: [{ package: "fixture@latest" }] } },
      defaultLock([previous]),
      { resolve: async (name) => locked(name, "2.0.0") },
    );
    expect(next.sources[0]?.vendored).toMatch(
      /^\.cookbook\/vendor\/[a-f0-9]+$/,
    );
    expect(previous.vendored).toBe(".cookbook/vendor/package");
  });
});
