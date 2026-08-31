import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

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
  if (packageJson.dependencies?.["@tenphi/cookbook"]) {
    throw new Error(`@tenphi/${directory} must not depend on the facade.`);
  }
}

const starlightSource = join(root, "packages/starlight/src");
for (const file of await walk(starlightSource)) {
  if (extname(file) === ".css") {
    throw new Error(
      `Starlight styling must use Tasty style objects, not authored CSS: ${file}`,
    );
  }
}

console.log("Package boundaries are valid.");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (entry.isFile()) files.push(path);
  }
  return files;
}
