import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const facadeSource = join(root, "packages/facade/src");
const files = (await readdir(facadeSource)).filter((file) =>
  file.endsWith(".ts"),
);
const allowedImports = new Set([
  "@tenphi/docs",
  "@tenphi/starlight",
  "@tenphi/starlight/components",
]);

for (const file of files) {
  const source = await readFile(join(facadeSource, file), "utf8");
  for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const specifier = match[1];
    if (specifier?.startsWith("@tenphi/") && !allowedImports.has(specifier)) {
      throw new Error(`Facade boundary violation in ${file}: ${specifier}`);
    }
  }
}

for (const directory of ["docs", "starlight"]) {
  const packageJson = JSON.parse(
    await readFile(join(root, "packages", directory, "package.json"), "utf8"),
  );
  if (packageJson.dependencies?.["tasty-docs"]) {
    throw new Error(`@tenphi/${directory} must not depend on the facade.`);
  }
}

console.log("Package boundaries are valid.");
