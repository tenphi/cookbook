import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const output = join(process.cwd(), "apps/reference/dist");
const assets = join(output, "_astro");
const entries = await readdir(assets);
const outputEntries = await readdir(output, { recursive: true });
const cssEntries = outputEntries.filter((name) => extname(name) === ".css");
const unexpectedCss = cssEntries.filter(
  (name) => !/^_astro\/tasty\.(?:shared|page)\.[\w-]+\.css$/.test(name),
);
if (unexpectedCss.length > 0) {
  throw new Error(
    `Only extracted Tasty stylesheets may ship. Found: ${unexpectedCss.join(", ")}.`,
  );
}
if (cssEntries.length === 0) {
  throw new Error("The reference build did not emit extracted Tasty CSS.");
}
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
// Semantic typography and the owned Starlight affordances are emitted through
// complete Tasty style trees so every configured field and sub-element reaches
// its target, rather than being manually cherry-picked in GlobalStyles. Tasty
// 3.8 also emits typed custom-property registrations for configured tokens.
const cssBudget = 140 * 1024;
if (largestCss > cssBudget)
  throw new Error(`Shared CSS is ${largestCss} bytes (budget: ${cssBudget}).`);
if (!sharedCssPath) throw new Error("The shared Tasty stylesheet is missing.");
const sharedCss = await readFile(sharedCssPath, "utf8");
const allCss = (
  await Promise.all(
    cssEntries.map((name) => readFile(join(output, name), "utf8")),
  )
).join("\n");
for (const [pattern, label] of [
  [/--sl-/i, "Starlight custom properties"],
  [/@layer\s+starlight/i, "Starlight cascade layers"],
  [/expressive-code|--ec-/i, "Expressive Code styles"],
]) {
  if (pattern.test(allCss)) {
    throw new Error(`Extracted Tasty CSS still contains ${label}.`);
  }
}
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
if (!/mask:\s*url\("data:image\/svg\+xml/.test(sharedCss)) {
  throw new Error("Extracted Tasty CSS is missing inline SVG icon masks.");
}
if (!sharedCss.includes("view%42ox")) {
  throw new Error(
    "Inline SVG masks lost their case-sensitive viewBox attribute.",
  );
}
if (
  !/\.td-footer__credit\s*\{[^}]*color:\s*var\(--text-color\)/.test(
    sharedCss,
  ) ||
  !/\.td-footer__credit a\s*\{[^}]*color:\s*var\(--accent-text-color\)/.test(
    sharedCss,
  )
) {
  throw new Error(
    "The footer credit must use body text with a brand-colored link.",
  );
}
for (const [selector, label] of [
  ["#starlight__sidebar a > span:first-child", "left navigation links"],
  [
    "#starlight__sidebar summary > .group-label > span:first-child",
    "left navigation groups",
  ],
  [".right-sidebar-panel a > span", "desktop table of contents"],
  [
    "mobile-starlight-toc .dropdown .isMobile a > span",
    "mobile table of contents",
  ],
]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (
    !new RegExp(
      `${escapedSelector}\\s*\\{[^}]*overflow:\\s*hidden;[^}]*text-overflow:\\s*ellipsis;[^}]*white-space:\\s*nowrap`,
    ).test(sharedCss)
  ) {
    throw new Error(`Long ${label} must truncate with an ellipsis.`);
  }
}
const home = await readFile(join(output, "index.html"), "utf8");
for (const [pattern, label] of [
  [
    /<link\b(?=[^>]*rel="icon")(?=[^>]*sizes="32x32")(?=[^>]*href="\/_cookbook\/icons\/favicon-32x32\.png")[^>]*>/,
    "32×32 favicon",
  ],
  [
    /<link\b(?=[^>]*rel="apple-touch-icon")(?=[^>]*sizes="180x180")(?=[^>]*href="\/_cookbook\/icons\/apple-touch-icon\.png")[^>]*>/,
    "Apple touch icon",
  ],
  [
    /<link\b(?=[^>]*rel="manifest")(?=[^>]*href="\/_cookbook\/icons\/site\.webmanifest")[^>]*>/,
    "web app manifest",
  ],
  [
    /<meta\b(?=[^>]*name="theme-color")(?=[^>]*media="\(prefers-color-scheme: dark\)")[^>]*>/,
    "dark-scheme theme color",
  ],
]) {
  if (!pattern.test(home)) {
    throw new Error(`The generated ${label} metadata is missing.`);
  }
}
for (const icon of [
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "icon-192x192.png",
  "icon-512x512.png",
  "icon-192x192-maskable.png",
  "icon-512x512-maskable.png",
  "favicon.svg",
  "site.webmanifest",
]) {
  await stat(join(output, "_cookbook", "icons", icon));
}
if (
  !/<script\b(?=[^>]*\bdefer(?:\s|>))(?=[^>]*\bsrc="https:\/\/umami\.tenphi\.me\/script\.js")(?=[^>]*\bdata-website-id="084ca820-b3e3-440d-bf91-c246cf60da48")[^>]*><\/script>/.test(
    home,
  )
) {
  throw new Error("The Cookbook Umami analytics script is missing.");
}
if (/react-dom|tasty\/client|data-reactroot/i.test(home)) {
  throw new Error(
    "The default page unexpectedly contains a React or Tasty client runtime.",
  );
}
if (!home.includes('data-tasty-anatomy="Logo" class="td-header__logo')) {
  throw new Error("The project logo is missing from the documentation header.");
}
if (
  !/>\s*svg\s*>\s*\.td-logo__mark\s*\{[^}]*color:\s*var\(--accent-surface-text-color\)/.test(
    sharedCss,
  )
) {
  throw new Error(
    "The project logo mark is not styled with its Glaze foreground token.",
  );
}
if (
  !home.includes("data-docs-contrast") ||
  !home.includes('value="more">High contrast</option>')
) {
  throw new Error("The documentation shell is missing its contrast control.");
}
for (const name of outputEntries.filter(
  (entry) => extname(entry) === ".html",
)) {
  const html = await readFile(join(output, name), "utf8");
  if (/--sl-/i.test(html)) {
    throw new Error(`${name} contains an inline Starlight style token.`);
  }
  if (/<style(?:\s|>)/i.test(html)) {
    throw new Error(`${name} contains an authored style block.`);
  }
  const stylesheets = [
    ...html.matchAll(
      /<link\b(?=[^>]*rel="stylesheet")[^>]*href="([^"]+)"[^>]*>/gi,
    ),
  ].map((match) => match[1]);
  const unexpectedLinks = stylesheets.filter(
    (href) => !/^\/_astro\/tasty\.(?:shared|page)\.[\w-]+\.css$/.test(href),
  );
  if (unexpectedLinks.length > 0) {
    throw new Error(
      `${name} links non-Tasty stylesheets: ${unexpectedLinks.join(", ")}.`,
    );
  }
}

const conventionOutput = join(process.cwd(), "apps/convention/dist");
const conventionEntries = await readdir(conventionOutput, { recursive: true });
let conventionHeadingWrappers = 0;
for (const name of conventionEntries.filter(
  (entry) => extname(entry) === ".html",
)) {
  const html = await readFile(join(conventionOutput, name), "utf8");
  for (const match of html.matchAll(
    /<div\b[^>]*\bclass="[^"]*\bsl-heading-wrapper\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g,
  )) {
    conventionHeadingWrappers += 1;
    const content = match[1] ?? "";
    if (/\bclass="[^"]*\bsl-heading-wrapper\b/.test(content)) {
      throw new Error(`${name} contains nested heading permalink wrappers.`);
    }
    if (
      (content.match(/\bclass="[^"]*\bsl-anchor-link\b/g) ?? []).length !== 1
    ) {
      throw new Error(`${name} must render exactly one permalink per heading.`);
    }
  }
}
if (conventionHeadingWrappers === 0) {
  throw new Error("The convention build did not render heading permalinks.");
}
console.log(
  `Reference budgets: ${cssEntries.length} Tasty stylesheets; largest CSS ${largestCss} bytes; JavaScript assets ${javascript} bytes.`,
);
