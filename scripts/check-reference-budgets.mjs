import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, posix } from "node:path";
import { gzipSync } from "node:zlib";
import { styleOwnerSelector } from "./style-owner-selector.mjs";

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
// Semantic typography and the owned page affordances are emitted through
// complete Tasty style trees so every configured field and sub-element reaches
// its target through its owning component or generated-content bridge. Tasty
// 3.8 also emits typed custom-property registrations for configured tokens.
// The four customizable callout palettes add 12 semantic roles in four modes.
// The combined appearance panel, social buttons, and heading permalink targets
// retain complete customizable anatomy. The responsive permalink placement and
// configurable header-logo link add another 1 KiB for these owned surfaces.
// The owned sidebar adds customizable section headings, disclosure carets,
// linked group states, and badges (4 KiB).
// Native drawer and appearance-popover motion, including reduced-motion rules,
// add another 1 KiB of Tasty-generated CSS.
// Customizable heading-link copy feedback adds another 1 KiB.
// The heading color's four modes and configurable Heading style tree add 1 KiB.
// The full customization registry, semantic syntax classes, owned search,
// page actions, and mobile contents add ~23 KiB to the previous 163 KiB limit.
// The configurable language popover and mobile placement add about 8 KiB.
// Current measured maximum: 198,287 bytes; keep a small explicit growth margin.
const cssBudget = 200 * 1024;
if (largestCss > cssBudget)
  throw new Error(`Shared CSS is ${largestCss} bytes (budget: ${cssBudget}).`);
if (!sharedCssPath) throw new Error("The shared Tasty stylesheet is missing.");
const sharedCss = await readFile(sharedCssPath, "utf8");
const allCss = (
  await Promise.all(
    cssEntries.map((name) => readFile(join(output, name), "utf8")),
  )
).join("\n");
if (/details:has\(a\[aria-current="page"\]\)/.test(sharedCss)) {
  throw new Error("Sidebar ancestors must not receive current-page styling.");
}
if (/#cookbook__sidebar details > ul > li\s*\{/.test(sharedCss)) {
  throw new Error(
    "Sidebar group indentation must not affect the mobile section selector.",
  );
}
for (const [pattern, label] of [
  [/--sl-/i, "Starlight custom properties"],
  [/@layer\s+starlight/i, "Starlight cascade layers"],
  [/\bsl-[a-z]/i, "legacy renderer classes"],
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
  !/pre\.td-diff\s*>\s*code\s*>\s*:is\(\.line\)\s*\{[^}]*padding-inline:\s*1rem;[^}]*line-height:/.test(
    sharedCss,
  ) ||
  /pre\.td-diff\.line\s*\{/.test(sharedCss)
) {
  throw new Error("Diff lines lost their padding or typography rules.");
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
const home = await readFile(join(output, "index.html"), "utf8");
const componentPage = await readFile(
  join(output, "getting-started/index.html"),
  "utf8",
);
for (const [name, descendant, label] of [
  [
    "Sidebar",
    "a > span:where(:is(a > span:first-child))",
    "left navigation links",
  ],
  [
    "Sidebar",
    ".group-label > span:where(:is(.group-label > span:first-child))",
    "left navigation groups",
  ],
  ["TableOfContents", "a > span", "desktop table of contents"],
  ["MobileMenuToggle", ".td-menu-button__page", "mobile navigation breadcrumb"],
]) {
  const escapedSelector = `${styleOwnerSelector(componentPage, name)} ${descendant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
  if (
    !new RegExp(
      `${escapedSelector}\\s*\\{[^}]*overflow:\\s*hidden;[^}]*text-overflow:\\s*ellipsis;[^}]*white-space:\\s*nowrap`,
    ).test(allCss)
  ) {
    throw new Error(`Long ${label} must truncate with an ellipsis.`);
  }
}
if (
  !/backdrop-filter:\s*blur\(16px\)/.test(sharedCss) ||
  !sharedCss.includes("var(--header-color)")
) {
  throw new Error(
    "The header must use its semantic translucent surface and backdrop blur.",
  );
}
if (
  !new RegExp(
    `${styleOwnerSelector(componentPage, "TableOfContents")}\\s*\\{[^}]*display:\\s*block`,
  ).test(allCss)
) {
  throw new Error("The desktop table of contents must be visible.");
}
for (const transition of [
  "translate var(--sidebar-transition) ease-out",
  "display var(--sidebar-transition) allow-discrete",
  "overlay var(--sidebar-transition) allow-discrete",
]) {
  if (!allCss.includes(transition)) {
    throw new Error(
      `The mobile drawer is missing its ${transition} transition.`,
    );
  }
}
if (
  (
    sharedCss.match(
      /\[data-element="Panel"\]:where\(\[data-open\]:popover-open\)\s*\{\s*opacity:\s*1;\s*scale:\s*1;/g,
    ) ?? []
  ).length < 2 ||
  !sharedCss.includes("scale: 1 0.96") ||
  !sharedCss.includes("display var(--popover-transition) allow-discrete")
) {
  throw new Error(
    "The appearance and language popovers must preserve their fade and scale transitions.",
  );
}
const notFound = await readFile(join(output, "404.html"), "utf8");
if (
  !/<title>\s*Page not found \| [^<]+<\/title>/.test(notFound) ||
  !/<meta name="robots" content="noindex, follow"\s*\/>/.test(notFound)
) {
  throw new Error("The 404 page needs a title and noindex metadata.");
}
const sidebarHtml = (html) => {
  const sidebar =
    /<cookbook-sidebar(?=[\s>])[^>]*>([\s\S]*?)<\/cookbook-sidebar>/.exec(
      html,
    )?.[1];
  if (!sidebar) throw new Error("The owned sidebar tree is missing.");
  return sidebar;
};
const guide = await readFile(
  join(output, "getting-started/index.html"),
  "utf8",
);
if (/<cookbook-mobile-toc(?:\s|>)/.test(guide)) {
  throw new Error(
    "Mobile and tablet pages must not render a compact table of contents.",
  );
}
for (const marker of [
  "<cookbook-sidebar-pane",
  'aria-label="Choose section"',
  'aria-label="More"',
  'aria-label="More links"',
  'aria-label="Close navigation"',
]) {
  if (!guide.includes(marker))
    throw new Error(`Responsive navigation is missing ${marker}.`);
}
if ((guide.match(/data-variant="primary"/g) ?? []).length !== 1) {
  throw new Error(
    "Primary header button variants must only apply in the desktop header.",
  );
}
const initialSidebar = sidebarHtml(
  await readFile(join(output, "getting-started/index.html"), "utf8"),
);
for (const section of [
  "Start",
  "Author",
  "Customize",
  "Extend",
  "Publish",
  "Maintain",
]) {
  if (
    !initialSidebar.includes(
      `<h2 class="sidebar-section-label group-label"><span>${section}</span>`,
    ) ||
    /<details\b/.test(initialSidebar)
  ) {
    throw new Error(
      `Guide journey ${section} must be a visible, flat section.`,
    );
  }
}
for (const route of [
  "getting-started",
  "ai-agents",
  "site-navigation",
  "recipes",
  "theme-and-components",
  "fonts-and-typography",
  "custom-components",
  "plugins",
  "deployment",
  "migration",
  "quality-checks",
  "troubleshooting",
]) {
  if (!initialSidebar.includes(`href="/${route}"`))
    throw new Error(`Missing guide journey: ${route}`);
}
const referenceSidebar = sidebarHtml(
  await readFile(join(output, "component-styles/index.html"), "utf8"),
);
if (
  !/<a\b[^>]*href="\/component-styles"[^>]*aria-current="page"/.test(
    referenceSidebar,
  )
) {
  throw new Error(
    "The component reference must be current in the Reference tab.",
  );
}
for (const route of [
  "configuration",
  "component-styles",
  "publishing",
  "cli",
  "architecture",
]) {
  if (!referenceSidebar.includes(`href="/${route}"`))
    throw new Error(`Missing reference page: ${route}`);
}
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
if (
  !/<span\b(?=[^>]*data-tasty-anatomy="Logo")(?=[^>]*class="td-header__logo\b)[^>]*>/.test(
    home,
  )
) {
  throw new Error("The project logo is missing from the documentation header.");
}
if (
  !/>\s*svg\s*>\s*\.td-logo__mark\s*\{[^}]*color:\s*var\(--logo-mark-color\)/.test(
    sharedCss,
  )
) {
  throw new Error(
    "The project logo mark is not styled with its Glaze foreground token.",
  );
}
if (
  !home.includes("data-appearance-scheme") ||
  !home.includes("data-appearance-contrast") ||
  !/<input\b(?=[^>]*type="radio")(?=[^>]*value="more")(?=[^>]*data-appearance-contrast)[^>]*>/.test(
    home,
  ) ||
  !/<button\b(?=[^>]*popovertarget=)(?=[^>]*aria-label="Appearance")[^>]*>/.test(
    home,
  )
) {
  throw new Error("The documentation shell is missing its contrast control.");
}
for (const name of outputEntries.filter(
  (entry) => extname(entry) === ".html",
)) {
  const html = await readFile(join(output, name), "utf8");
  if (/<[a-z][^>]*\sstyle\s*=/i.test(html)) {
    throw new Error(`${name} contains an inline style attribute.`);
  }
  if (/--sl-/i.test(html)) {
    throw new Error(`${name} contains an inline Starlight style token.`);
  }
  if (/\bsl-[a-z]/i.test(html)) {
    throw new Error(`${name} contains a legacy renderer class.`);
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
    /<div\b[^>]*\bclass="[^"]*\bcookbook-heading-wrapper\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g,
  )) {
    conventionHeadingWrappers += 1;
    const content = match[1] ?? "";
    if (/\bclass="[^"]*\bcookbook-heading-wrapper\b/.test(content)) {
      throw new Error(`${name} contains nested heading permalink wrappers.`);
    }
    if (
      (content.match(/\bclass="[^"]*\bcookbook-anchor-link\b/g) ?? [])
        .length !== 1
    ) {
      throw new Error(`${name} must render exactly one permalink per heading.`);
    }
  }
}
if (conventionHeadingWrappers === 0) {
  throw new Error("The convention build did not render heading permalinks.");
}
await checkAssetBudgets();
console.log(
  `Reference budgets: ${cssEntries.length} Tasty stylesheets; largest CSS ${largestCss} bytes; JavaScript assets ${javascript} bytes.`,
);

async function checkAssetBudgets() {
  const sizes = new Map(
    await Promise.all(
      outputEntries.map(async (file) => [
        file,
        (await stat(join(output, file))).size,
      ]),
    ),
  );
  const total = (extensions) =>
    [...sizes]
      .filter(([file]) => extensions.includes(extname(file)))
      .reduce((sum, [, bytes]) => sum + bytes, 0);
  const budgets = [
    [
      "all JavaScript including lazy Pagefind assets",
      total([".js", ".mjs"]),
      800 * 1024,
    ],
    ["font files", total([".woff2", ".woff", ".ttf"]), 100 * 1024],
    [
      "images and icons",
      total([".png", ".jpg", ".jpeg", ".svg", ".avif", ".webp"]),
      100 * 1024,
    ],
  ];
  const guide = await readFile(
    join(output, "getting-started/index.html"),
    "utf8",
  );
  const scripts = [
    ...guide.matchAll(/<script\b[^>]*src="(\/_astro\/[^"?#]+)"/g),
  ].map((match) => match[1].slice(1));
  const initial = new Set();
  const visit = async (file) => {
    if (initial.has(file)) return;
    initial.add(file);
    const source = await readFile(join(output, file), "utf8");
    // Only static imports load eagerly. Search uses dynamic import().
    for (const match of source.matchAll(
      /(?:\bfrom\s*|\bimport\s*)["'](\.[^"']+)["']/g,
    ))
      await visit(posix.normalize(posix.join(posix.dirname(file), match[1])));
  };
  for (const script of scripts) await visit(script);
  const stylesheets = [
    ...guide.matchAll(
      /<link\b(?=[^>]*rel="stylesheet")[^>]*href="(\/_astro\/[^"?#]+)"/g,
    ),
  ].map((match) => match[1].slice(1));
  if (stylesheets.length === 0)
    throw new Error("The guide is missing its extracted stylesheets.");
  const gzipSize = async (file) =>
    gzipSync(await readFile(join(output, file))).length;
  const [htmlGzip, cssGzip, jsGzip] = await Promise.all([
    gzipSize("getting-started/index.html"),
    Promise.all(stylesheets.map(gzipSize)).then((sizes) =>
      sizes.reduce((sum, bytes) => sum + bytes, 0),
    ),
    Promise.all([...initial].map(gzipSize)).then((sizes) =>
      sizes.reduce((sum, bytes) => sum + bytes, 0),
    ),
  ]);
  console.log(
    `Initial guide gzip estimate (first-party HTML/CSS/JS): ${htmlGzip} + ${cssGzip} + ${jsGzip} = ${htmlGzip + cssGzip + jsGzip} bytes.`,
  );
  budgets.push([
    "initial page JavaScript",
    [...initial].reduce((sum, file) => sum + (sizes.get(file) ?? 0), 0),
    20 * 1024,
  ]);
  for (const [label, bytes, budget] of budgets) {
    if (bytes > budget)
      throw Error(`${label}: ${bytes} bytes exceeds ${budget}.`);
    console.log(`${label}: ${bytes} / ${budget} bytes.`);
  }
}
