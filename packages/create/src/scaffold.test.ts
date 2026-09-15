import { describe, expect, it } from "vitest";
import creatorPackage from "../package.json" with { type: "json" };
import {
  inferPackageManager,
  renderAstroConfig,
  renderGithubWorkflow,
  renderPackageJson,
} from "./scaffold.js";

describe("creator defaults", () => {
  it.each([
    ["pnpm/11.0.0 node/v22", "pnpm"],
    ["yarn/4.9.0 npm/? node/v22", "yarn"],
    ["npm/11.0.0 node/v22", "npm"],
    ["", "npm"],
  ] as const)("infers %s as %s", (agent, expected) => {
    expect(inferPackageManager(agent)).toBe(expected);
  });

  it("uses the creator release for the generated Cookbook dependency", () => {
    const manifest = JSON.parse(renderPackageJson("pnpm")) as {
      dependencies: Record<string, string>;
    };

    expect(manifest.dependencies["@tenphi/cookbook"]).toBe(
      `^${creatorPackage.version}`,
    );
    expect(manifest.dependencies.astro).toBe("^7.3.2");
  });

  it("wraps generated documentation config in defineDocsConfig", () => {
    const config = renderAstroConfig(
      {
        package: "fixture",
        site: "https://docs.example.com",
        base: "/fixture/",
      },
      "fixture",
    );

    expect(config).toContain("const docs = defineDocsConfig(");
    expect(config).toContain('base: "/fixture/"');
    expect(config.match(/https:\/\/docs\.example\.com/g)).toHaveLength(1);
    expect(config).not.toContain('"build"');
  });

  it.each([
    ["npm", "npm ci"],
    ["pnpm", "pnpm install --frozen-lockfile"],
    ["yarn", "yarn install --immutable"],
  ] as const)("renders a %s-aware Pages workflow", (manager, install) => {
    const workflow = renderGithubWorkflow(manager);

    expect(workflow).toContain(`- run: ${install}`);
    expect(workflow).toContain(`cache: ${manager}`);
    expect(workflow).toContain("actions/deploy-pages@v5");
  });
});
