import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const output = join(process.cwd(), "apps/reference/dist");
const assets = join(output, "_astro");
const entries = await readdir(assets);
let largestCss = 0;
let javascript = 0;
let sharedCssPath;
for (const name of entries) {
  const bytes = (await stat(join(assets, name))).size;
  if (extname(name) === ".css") largestCss = Math.max(largestCss, bytes);
  if ([".js", ".mjs"].includes(extname(name))) javascript += bytes;
  if (name.startsWith("tasty.shared.") && extname(name) === ".css") {
    sharedCssPath = join(assets, name);
  }
}
const cssBudget = 106 * 1024;
if (largestCss > cssBudget)
  throw new Error(`Shared CSS is ${largestCss} bytes (budget: ${cssBudget}).`);
if (!sharedCssPath) throw new Error("The shared Tasty stylesheet is missing.");
const sharedCss = await readFile(sharedCssPath, "utf8");
if (/\)\s+:root\s*\{[^}]*--surface-color/.test(sharedCss)) {
  throw new Error(
    "Theme tokens were extracted beneath :root and cannot match the document root.",
  );
}
if (!/:root:where\([^{}]+\)\s*\{[^}]*--surface-color/.test(sharedCss)) {
  throw new Error(
    "Theme-state color tokens are missing from shared Tasty CSS.",
  );
}
if (
  !sharedCss.includes('[data-contrast="more"]') ||
  !/@media\s*\(prefers-contrast:\s*more\)/.test(sharedCss)
) {
  throw new Error(
    "Glaze high-contrast tokens must support both explicit and system modes.",
  );
}
if (sharedCss.includes("color-mix(")) {
  throw new Error(
    "The shared stylesheet contains authored color mixes instead of Glaze output.",
  );
}
for (const mapping of [
  "--sl-color-gray-3: var(--text-muted-color)",
  "--sl-color-accent-low: var(--accent-surface-subtle-color)",
  "--sl-color-orange-low: var(--orange-surface-color)",
  "--sl-color-green-high: var(--green-text-color)",
  "--sl-color-blue: var(--blue-color)",
  "--sl-color-purple-low: var(--purple-surface-color)",
  "--sl-color-red-high: var(--red-text-color)",
]) {
  if (!sharedCss.includes(mapping)) {
    throw new Error(`The Starlight Glaze bridge is missing: ${mapping}.`);
  }
}
if (!/mask:\s*url\("data:image\/svg\+xml/.test(sharedCss)) {
  throw new Error("Extracted Tasty CSS is missing inline SVG icon masks.");
}
if (!sharedCss.includes("view%42ox")) {
  throw new Error(
    "Inline SVG masks lost their case-sensitive viewBox attribute.",
  );
}
const home = await readFile(join(output, "index.html"), "utf8");
if (/react-dom|tasty\/client|data-reactroot/i.test(home)) {
  throw new Error(
    "The default page unexpectedly contains a React or Tasty client runtime.",
  );
}
if (!home.includes('data-tasty-anatomy="Logo" class="td-header__logo')) {
  throw new Error("The project logo is missing from the documentation header.");
}
if (
  !home.includes("data-docs-contrast") ||
  !home.includes('value="more">High contrast</option>')
) {
  throw new Error("The documentation shell is missing its contrast control.");
}
console.log(
  `Reference budgets: largest CSS ${largestCss} bytes; JavaScript assets ${javascript} bytes.`,
);
