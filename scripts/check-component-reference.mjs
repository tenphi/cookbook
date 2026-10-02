import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { URL } from "node:url";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "../packages/docs/dist/index.js";

const file = new URL("../docs/component-styles.md", import.meta.url);
const start = "<!-- component-anatomy:start -->";
const end = "<!-- component-anatomy:end -->";
const groups = [
  {
    title: "Page shell",
    names: [
      "Document",
      "Layout",
      "PageFrame",
      "MainPane",
      "MainContent",
      "HeaderFrame",
      "Heading",
      "Banner",
      "SkipLink",
    ],
  },
  {
    title: "Navigation and controls",
    names: [
      "Header",
      "HeaderLinks",
      "SearchButton",
      "Button",
      "Sidebar",
      "MobileMenuToggle",
      "MobileNavigationTabs",
      "MobileMenuFooter",
      "TopNavigation",
      "TableOfContentsLayout",
      "TableOfContents",
      "MobileTableOfContents",
      "Pagination",
      "VersionSwitcher",
      "LanguageSelect",
      "SocialIcons",
      "ThemeSelect",
    ],
  },
  {
    title: "Rendered content",
    names: [
      "Markdown",
      "MarkdownHeading",
      "MarkdownCodeBlock",
      "MarkdownInlineCode",
      "MarkdownTable",
      "MarkdownAlert",
      "SyntaxHighlight",
      "Mermaid",
      "MermaidSource",
    ],
  },
  {
    title: "Authoring components",
    names: [
      "Card",
      "Callout",
      "CodeGroup",
      "Tab",
      "Tabs",
      "Steps",
      "Hero",
      "Preview",
      "SiteLogo",
      "Logo",
      "PageActions",
      "Footer",
      "PackageVersion",
    ],
  },
  { title: "Search", names: ["Search", "SearchResults"] },
];

const configuredNames = groups.flatMap((group) => group.names);
assert.equal(new Set(configuredNames).size, configuredNames.length);
assert.deepEqual(
  configuredNames.toSorted(),
  [...COOKBOOK_COMPONENT_NAMES].toSorted(),
);

const reference = groups
  .map(({ title, names }) => {
    const items = names.map((name) => {
      const parts = COOKBOOK_COMPONENT_SUB_ELEMENTS[name];
      assert.ok(parts, `Missing registry entry for ${name}`);
      return `- \`${name}\`: ${parts.length ? parts.map((part) => `\`${part}\``).join(", ") : "None"}`;
    });
    return `#### ${title}\n\n${items.join("\n")}`;
  })
  .join("\n\n");
const content = await readFile(file, "utf8");
const before = content.indexOf(start);
const after = content.indexOf(end);
assert.ok(
  before >= 0 && after > before,
  "Component anatomy markers are missing",
);
const updated = `${content.slice(0, before + start.length)}\n\n${reference}\n\n${content.slice(after)}`;
if (process.argv.includes("--write")) {
  await writeFile(file, updated);
  console.log(
    "Updated the component anatomy reference from the public registry.",
  );
} else {
  assert.equal(
    content,
    updated,
    "Component anatomy reference is out of date; run node scripts/check-component-reference.mjs --write after building packages",
  );
  console.log("Component anatomy reference matches the public registry.");
}
