import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDocsGraph, resolveDocsProject } from "@tenphi/docs";
import { afterEach, describe, expect, it } from "vitest";
import creatorPackage from "../package.json" with { type: "json" };
import {
  inferPackageManager,
  renderAstroConfig,
  renderDocsConfig,
  renderGithubWorkflow,
  renderPackageJson,
  scaffold,
} from "./scaffold.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function localFixture(source = false) {
  const root = await mkdtemp(join(tmpdir(), "cookbook-create-"));
  roots.push(root);
  const destination = join(root, "site");
  if (source) {
    await mkdir(join(root, "repository"));
    await writeFile(
      join(root, "repository", "README.md"),
      "# Existing repository\n",
    );
  }
  await scaffold({
    destination,
    install: false,
    ...(source ? { source: join(root, "repository") } : {}),
  });
  const modules = fileURLToPath(
    new URL("../../../apps/convention/node_modules", import.meta.url),
  );
  await symlink(modules, join(destination, "node_modules"), "dir");
  const project = await resolveDocsProject({ root: destination });
  return { root, destination, project, graph: await createDocsGraph(project) };
}

describe("creator defaults", () => {
  it("creates a local starter whose discovered config resolves its content", async () => {
    const { destination, project, graph } = await localFixture();
    expect(project.root).toBe(destination);
    expect(graph.diagnostics).toEqual([]);
    expect(graph.entryByRoute("/")?.title).toBe("Documentation");
    expect(await readdir(destination)).not.toContain("cookbook.lock.json");
    expect(
      await readFile(join(destination, "astro.config.ts"), "utf8"),
    ).toContain("cookbook()");
    const agentInstructions = await readFile(
      join(destination, "AGENTS.md"),
      "utf8",
    );
    expect(agentInstructions).toContain("Edit `README.md` for the home page");
    expect(agentInstructions).toContain("npm run doctor");
    expect(agentInstructions).toContain("site.url");
  });
  it("keeps existing repository content outside the generated app", async () => {
    const { root, destination, project, graph } = await localFixture(true);
    expect(project.root).toBe(resolve(root, "repository"));
    expect(graph.entryByRoute("/")?.title).toBe("Existing repository");
    expect(graph.diagnostics).toEqual([]);
    expect(await readdir(destination)).not.toContain("README.md");
    expect(await readFile(join(destination, "AGENTS.md"), "utf8")).toContain(
      "Edit the source repository's README.md",
    );
  });
  it("preserves an existing agent instructions file", async () => {
    const { destination } = await localFixture();
    await writeFile(join(destination, "AGENTS.md"), "# Local rules\n");
    await scaffold({
      destination,
      install: false,
      confirmNonEmpty: async () => true,
    });
    expect(await readFile(join(destination, "AGENTS.md"), "utf8")).toBe(
      "# Local rules\n",
    );
  });
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
    const config = renderAstroConfig({
      package: "fixture",
      site: "https://docs.example.com",
      base: "/fixture/",
    });

    expect(config).toContain("integrations: [cookbook()]");
    expect(config).toContain('base: "/fixture/"');
    expect(
      renderDocsConfig(
        { package: "fixture", site: "https://docs.example.com" },
        "fixture",
      ),
    ).toContain("export default defineDocsConfig(");
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
