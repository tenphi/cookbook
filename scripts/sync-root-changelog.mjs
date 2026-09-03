import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const rootChangelogPath = `${repositoryRoot}CHANGELOG.md`;
const packageChangelogPaths = [
  "packages/create/CHANGELOG.md",
  "packages/docs/CHANGELOG.md",
  "packages/facade/CHANGELOG.md",
  "packages/starlight/CHANGELOG.md",
].map((path) => `${repositoryRoot}${path}`);

const changeHeadings = ["Major Changes", "Minor Changes", "Patch Changes"];
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function splitHeadingSections(markdown, pattern) {
  const matches = [...markdown.matchAll(pattern)];
  return matches.map((match, index) => ({
    heading: match[1],
    body: markdown.slice(
      (match.index ?? 0) + match[0].length,
      matches[index + 1]?.index ?? markdown.length,
    ),
  }));
}

function topLevelBullets(markdown) {
  const bullets = [];
  let current = [];

  const flush = () => {
    while (current.at(-1) === "") current.pop();
    if (current.length > 0) bullets.push(current.join("\n"));
    current = [];
  };

  for (const line of markdown.split("\n")) {
    if (line.startsWith("- ")) {
      flush();
      current.push(line);
    } else if (current.length > 0 && (line === "" || line.startsWith("  "))) {
      current.push(line);
    } else {
      flush();
    }
  }
  flush();

  return bullets.filter(
    (bullet) => !bullet.startsWith("- Updated dependencies"),
  );
}

export function buildRootChangelog(packageChangelogs) {
  const releases = new Map();

  for (const changelog of packageChangelogs) {
    const versions = splitHeadingSections(changelog, /^## ([^\n]+)\n/gm);
    for (const { heading: version, body } of versions) {
      if (!versionPattern.test(version)) continue;

      const entries = releases.get(version) ?? new Map();
      const changeSections = splitHeadingSections(
        body,
        /^### (Major Changes|Minor Changes|Patch Changes)\n/gm,
      );
      for (const { heading, body: changes } of changeSections) {
        const rank = changeHeadings.indexOf(heading);
        for (const bullet of topLevelBullets(changes)) {
          const key = bullet.replace(/\s+/g, " ").trim();
          const existing = entries.get(key);
          if (!existing || rank < existing.rank) {
            entries.set(key, { bullet, rank });
          }
        }
      }
      releases.set(version, entries);
    }
  }

  const lines = [
    "# Changelog",
    "",
    "All notable changes to Cookbook are documented here. Package-specific details remain in `packages/*/CHANGELOG.md`.",
  ];
  const versions = [...releases.keys()].sort((left, right) =>
    right.localeCompare(left, "en", { numeric: true }),
  );

  for (const version of versions) {
    const entries = [...releases.get(version).values()];
    if (entries.length === 0) continue;

    lines.push("", `## ${version}`);
    for (const [rank, heading] of changeHeadings.entries()) {
      const changes = entries.filter((entry) => entry.rank === rank);
      if (changes.length === 0) continue;
      lines.push("", `### ${heading}`, "");
      lines.push(...changes.map((entry) => entry.bullet));
    }
  }

  return `${lines.join("\n")}\n`;
}

export function extractReleaseNotes(changelog, version) {
  const release = splitHeadingSections(changelog, /^## ([^\n]+)\n/gm).find(
    (section) => section.heading === version,
  );
  const notes = release?.body.trim();
  if (!notes) throw new Error(`No root changelog entry found for ${version}.`);
  return `${notes}\n`;
}

async function generatedChangelog() {
  const packageChangelogs = await Promise.all(
    packageChangelogPaths.map((path) => readFile(path, "utf8")),
  );
  return buildRootChangelog(packageChangelogs);
}

async function main() {
  const [command, value] = process.argv.slice(2);

  if (command === "--notes") {
    if (!value) throw new Error("Pass a version after --notes.");
    const changelog = await readFile(rootChangelogPath, "utf8");
    process.stdout.write(extractReleaseNotes(changelog, value));
    return;
  }

  const generated = await generatedChangelog();
  if (command === "--check") {
    const current = await readFile(rootChangelogPath, "utf8");
    if (current !== generated) {
      throw new Error(
        "CHANGELOG.md is out of date. Run pnpm sync:changelog and commit the result.",
      );
    }
    console.log("Root changelog matches the package changelogs.");
    return;
  }

  if (command) throw new Error(`Unknown option: ${command}`);
  await writeFile(rootChangelogPath, generated);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
