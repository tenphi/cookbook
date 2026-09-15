import { describe, expect, it } from "vitest";
import { createDocsFixture } from "../testing/index.js";
import {
  assertSafePackagePath,
  discoverPackage,
  lockForSource,
} from "./index.js";

describe("npm package safety", () => {
  it.each([
    "../secret.md",
    "{..,docs}/**/*.md",
    "docs/../../secret.md",
    "/etc/passwd",
    "C:\\tmp\\secret.md",
  ])("rejects an escaping package path: %s", (path) => {
    expect(() => assertSafePackagePath(path, "fixture")).toThrow(
      /must stay within the package root/,
    );
  });

  it("rejects an escaping package-provided discovery hint", async () => {
    const root = await createDocsFixture({
      "package.json": JSON.stringify({
        name: "fixture",
        version: "1.0.0",
        cookbook: { index: "../../secret.md" },
      }),
      "README.md": "# Fixture\n",
    });

    await expect(discoverPackage(root)).rejects.toThrow(
      /cookbook\.index must stay within the package root/,
    );
  });

  it("prefers an exact requested lock specifier", () => {
    const exact = {
      requested: "fixture@next",
      resolved: "fixture@2.0.0",
      registry: "https://registry.npmjs.org/",
      integrity: "sha512-next",
    };
    const lock = {
      schemaVersion: 1 as const,
      sources: [
        {
          requested: "fixture@latest",
          resolved: "fixture@1.0.0",
          registry: "https://registry.npmjs.org/",
          integrity: "sha512-latest",
        },
        exact,
      ],
    };

    expect(lockForSource(lock, "fixture@next")).toBe(exact);
    expect(() => lockForSource(lock, "fixture@^3")).toThrow(
      /matches multiple lock entries/,
    );
  });
});
