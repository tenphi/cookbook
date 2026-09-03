import { describe, expect, it } from "vitest";
import {
  buildRootChangelog,
  extractReleaseNotes,
} from "./sync-root-changelog.mjs";

describe("root changelog", () => {
  it("combines package changes while removing dependency-only duplicates", () => {
    const sharedChange = [
      "### Minor Changes",
      "",
      "- Add a useful feature with a wrapped",
      "  description.",
    ].join("\n");
    const changelog = buildRootChangelog([
      [
        "# Package A",
        "",
        "## 1.2.0",
        "",
        sharedChange,
        "",
        "### Patch Changes",
        "",
        "- Updated dependencies []:",
        "  - package-b@1.2.0",
      ].join("\n"),
      ["# Package B", "", "## 1.2.0", "", sharedChange].join("\n"),
    ]);

    expect(changelog.match(/Add a useful feature/g)).toHaveLength(1);
    expect(changelog).not.toContain("Updated dependencies");
    expect(changelog).toContain("## 1.2.0\n\n### Minor Changes");
  });

  it("extracts one version for GitHub release notes", () => {
    const changelog = [
      "# Changelog",
      "",
      "## 1.2.0",
      "",
      "### Minor Changes",
      "",
      "- New feature",
      "",
      "## 1.1.0",
      "",
      "### Patch Changes",
      "",
      "- Earlier fix",
      "",
    ].join("\n");

    expect(extractReleaseNotes(changelog, "1.2.0")).toBe(
      "### Minor Changes\n\n- New feature\n",
    );
  });
});
