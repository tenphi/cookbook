import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";

const packageRoot = process.cwd();
const source = join(packageRoot, "src");
const output = join(packageRoot, "dist");

await mkdir(output, { recursive: true });
for (const path of ["components", "overrides", "routes"]) {
  await cp(join(source, path), join(output, path), { recursive: true });
}
await cp(join(source, "styles.css"), join(output, "styles.css"));
await cp(join(source, "styles.d.ts"), join(output, "styles.d.ts"));
await cp(
  join(source, "components-public.d.ts"),
  join(output, "components-public.d.ts"),
);
