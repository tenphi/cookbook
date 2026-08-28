import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const output = join(process.cwd(), "apps/reference/dist");
const assets = join(output, "_astro");
const entries = await readdir(assets);
let largestCss = 0;
let javascript = 0;
for (const name of entries) {
  const bytes = (await stat(join(assets, name))).size;
  if (extname(name) === ".css") largestCss = Math.max(largestCss, bytes);
  if ([".js", ".mjs"].includes(extname(name))) javascript += bytes;
}
if (largestCss > 100 * 1024)
  throw new Error(`Shared CSS is ${largestCss} bytes (budget: 102400).`);
const home = await readFile(join(output, "index.html"), "utf8");
if (/react-dom|tasty\/client|data-reactroot/i.test(home)) {
  throw new Error(
    "The default page unexpectedly contains a React or Tasty client runtime.",
  );
}
console.log(
  `Reference budgets: largest CSS ${largestCss} bytes; JavaScript assets ${javascript} bytes.`,
);
