---
title: Search and navigation
description: Help readers find pages with search, sections, page contents, languages, and versions.
---

Cookbook builds routes from your content sources. With no explicit navigation,
it lists published pages from those sources. Add `navigation.items` to choose
their order and groups, or `navigation.tabs` to give major sections separate
sidebars. The [navigation reference](./configuration.md#navigation) covers every
item form and the rules for nested groups and tabs.

For example, a small site can give its guide and API reference separate
sidebars. Create pages at each tab's `link` route first:

```ts
navigation: {
  tabs: [
    { label: "Guide", link: "/", items: ["/", "/getting-started"] },
    { label: "API", link: "/api", items: ["/api", "/api/client"] },
  ],
}
```

## Search

The production build creates a local Pagefind index. Readers can select Search
in the header or press Ctrl+K (⌘+K on macOS). The dialog focuses its input,
shows matching pages and headings, and closes with Escape or its close button.
Focus returns to the control that opened it. Search assets load when the dialog
opens. During `astro dev`, the dialog explains that results require a build;
use `npm run build && npm run preview` to test them.

Search is enabled by default. Set `search.enabled: false` when the site does
not need an index. Set `pagefind: false` in a published page's frontmatter to
omit just that page. Draft pages are always omitted from search, even though
their direct URLs remain available. The [publishing guide](./publishing.md)
explains how preview indexing and draft visibility work.

## Sections and page order

Use groups for a short, scannable sidebar. A group may link to its own overview
page; deeper groups expand to show their children. Cookbook checks that every
internal navigation route exists. The order also sets previous and next page
links. Tabs give each major section its own sidebar, including pages outside
the tab's URL prefix when listed in that tab's `items`.

Top-level groups keep their headings and direct links visible. Deeper groups
open on click or keyboard activation, and the current page's ancestors open on
arrival. A linked group header selects its page before toggling when that page
is already selected. Explicit expansion choices are remembered for the browser
tab. Only the current page is highlighted.

On narrow screens, the active sidebar moves into a drawer. It includes the
section selector, links, and a close control. The drawer closes when a reader
follows a link. Keyboard focus stays in the drawer while it is open and returns
to the menu control when it closes. Content and links remain readable if client
JavaScript is unavailable.

## Contents, languages, and versions

Desktop articles show an on-page table of contents. Enable an optional compact
contents list below the header on smaller screens with:

```ts
tableOfContents: { mobile: true, minHeadingLevel: 2, maxHeadingLevel: 3 }
```

The same field in page frontmatter overrides the site setting for that page;
`tableOfContents: false` hides both lists. See [Authoring](./authoring.mdx#on-page-navigation)
for heading behavior.

Configure `locales` to offer translated pages and `site.versions` to offer
documentation versions. The selectors prefer the equivalent page when it
exists and fall back to a real language or version home when it does not.
Only available translations appear in alternate-language metadata. See the
[language](./configuration.md#languages) and
[version](./configuration.md#site) configuration examples.
