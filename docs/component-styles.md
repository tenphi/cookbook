---
title: Component styles
description: Customize built-in UI surfaces through partial Tasty style objects and named sub-elements.
---

For color roles and design tokens, start with the
[theme overview](./theme-and-components.md). For your own components, see
[Custom components](./custom-components.md).

## Style customization

Cookbook-owned interface elements are direct `tasty()` components. Supported
Cookbook components and generated Markdown surfaces use Tasty style trees.
Customize them by name under `theme.styles`; the configuration is resolved
before CSS generation, so this is not a selector-based CSS override.

Cookbook merges your partial style object with the component's base styles
before Tasty extracts CSS. The generated stylesheet contains the resolved
style, so you can change an element without copying its full defaults.

Each surface is registered by its owning component or generated-content bridge.
Fonts and document defaults belong to the page shell, so replacing Header
preserves the rest of the site's styling. Component-specific CSS is collected
when its owner renders. See [Component ownership](./architecture.md#component-ownership)
for the renderer authoring convention.

Start with the area you want to change, then use the complete sub-element
inventory below to find its exact anatomy:

| Page area                     | Style names to inspect                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Header, title, and navigation | `HeaderFrame`, `Header`, `SiteLogo`, `HeaderLinks`, `TopNavigation`                  |
| Sidebar and mobile menu       | `Sidebar`, `MobileMenuToggle`, `MobileNavigationTabs`, `MobileMenuFooter`            |
| Article text and headings     | `Markdown`, `MarkdownHeading`, `Heading`, `MainContent`                              |
| Code and diagrams             | `MarkdownCodeBlock`, `MarkdownInlineCode`, `SyntaxHighlight`, `CodeGroup`, `Mermaid` |
| Search                        | `SearchButton`, `Search`, `SearchResults`                                            |
| Table of contents             | `TableOfContents`, `MobileTableOfContents`, `TableOfContentsLayout`                  |
| Cards, notes, and tabs        | `Card`, `Callout`, `MarkdownAlert`, `Tabs`                                           |
| Footer and page controls      | `Footer`, `Pagination`, `PageActions`, `ThemeSelect`                                 |

For example, this changes a typography role and one named element without
copying a component's full style tree:

```ts
theme: {
  presets: { h2: { fontSize: "1.75rem" } },
  styles: {
    Sidebar: {
      LinkLabel: {
        preset: "body",
        whiteSpace: { "": "nowrap", "@mobile": "normal" }
      }
    }
  }
}
```

The `@mobile` value sits with the default value in one Tasty state map. Shared
tokens and presets keep the component aligned with the rest of the site, while
Glaze resolves semantic colors across the configured schemes and contrast
modes.

### Responsive states

Cookbook registers these Tasty state aliases for `theme.styles`, custom
components, and recipes. Widths use CSS `rem` units; their pixel values depend
on the browser's font-size settings.

| State             | Condition                                                  | Typical use                                        |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| `@compact`        | width ≤ 23rem                                              | Hide optional header controls in very narrow space |
| `@small`          | width ≤ 40rem                                              | Stack compact grids                                |
| `@shell-mobile`   | width ≤ 48rem                                              | Switch the page shell to its narrow arrangement    |
| `@shell-desktop`  | width > 48rem                                              | Restore the wider shell arrangement                |
| `@mobile`         | width < 50rem                                              | Mobile navigation and component layouts            |
| `@desktop`        | width ≥ 50rem                                              | Desktop navigation and component layouts           |
| `@medium-layout`  | 50rem ≤ width < 72rem                                      | Intermediate two-column layouts                    |
| `@narrow-layout`  | width < 72rem                                              | Hide or reposition the desktop table of contents   |
| `@reduced-motion` | `prefers-reduced-motion: reduce`                           | Remove optional motion                             |
| `@light`          | explicit light theme, or system light when no theme is set | Match the site's effective light appearance        |
| `@dark`           | explicit dark theme, or system dark when no theme is set   | Match the site's effective dark appearance         |
| `@system-light`   | `prefers-color-scheme: light`                              | Read the operating system preference directly      |
| `@system-dark`    | `prefers-color-scheme: dark`                               | Read the operating system preference directly      |

The 48rem shell boundary, 50rem navigation boundary, and 72rem contents
boundary serve different parts of the layout; their ranges intentionally
overlap. Use the default state key `""` for the value outside the listed
condition. Add your own aliases with `theme.states`; redefining a built-in
alias also changes the renderer's responsive layout, so check the whole site
when doing so.

Use `@light` and `@dark` in component styles. They check the page root's
`data-theme` attribute and use the system preference only when that attribute
is absent. Document rules that style the root itself use `@system-light` and
`@system-dark` within their automatic-theme branch. Keep scheme media queries
in the shared state definitions instead of repeating them in style objects.

In a generated site, run `npm run validate` (or the matching package manager's
command) after editing `docs.config.ts`. It checks TypeScript theme properties,
then runs Cookbook's preflight and production output checks. A misspelled
preset or built-in sub-element property fails type checking.

Provide only the root and named
[sub-element](https://tasty.style/docs/dsl#sub-element) properties you want to
override. Cookbook deep-merges that partial style object into the complete
base style object inside the renderer, following Tasty's
[state-map merge semantics](https://tasty.style/docs/dsl#extending-vs-replacing-state-maps):

```ts
theme: {
  styles: {
    ThemeSelect: {
      Trigger: {
        border: "#border-strong"
      },
      Panel: {
        padding: "1x",
        shadow: "0 1rem 3rem #shadow"
      }
    },
    TopNavigation: {
      Link: { preset: "body" },
      CurrentLink: { color: "#accent-text" }
    },
    Sidebar: {
      LinkLabel: { whiteSpace: "normal" }
    },
    TableOfContents: {
      LinkLabel: { whiteSpace: "normal" }
    },
    MobileMenuToggle: {
      Page: { color: "#accent-text" }
    }
  }
}
```

No merge helper or base style object is required in user configuration. Style
customization has one behavior: every supplied object is a partial override and
is merged into the base inside Cookbook.

Every configurable surface accepts styles at the root plus the named Tasty
sub-elements below. The list is generated from the public component registry so
it stays complete when a surface changes.

### Complete component anatomy

<!-- component-anatomy:start -->

#### Page shell

- `Document`: `All`, `Body`, `Control`, `Pointer`, `ResponsiveWidth`, `ResponsiveHeight`, `Hidden`, `PrintHidden`, `DesktopBlock`, `DesktopFlex`, `ScreenReaderOnly`, `Strong`, `Link`, `NarrowBlock`, `MobileBlock`, `Code`, `FocusRing`, `CurrentLink`, `SearchOpen`
- `Layout`: `Islands`, `LockedPage`, `Light`, `Auto`
- `PageFrame`: `MainFrame`, `SidebarFrame`, `Columns`
- `MainPane`: `WithSidebars`
- `MainContent`: `ContentSpacing`, `Container`, `Panel`, `FirstPanel`, `BodyPanel`
- `HeaderFrame`: None
- `Heading`: `Level1`, `Level2`, `Level3`, `Level4`, `Level5`, `Level6`, `PageTitle`
- `Banner`: `Link`
- `SkipLink`: `Focus`

#### Navigation and controls

- `Header`: `Primary`, `TitleAndSearch`, `Title`, `LogoLink`, `Logo`, `SiteTitle`, `Search`, `SearchElement`, `Tools`, `ToolItem`, `Social`, `MobileTheme`, `MobileLanguage`
- `HeaderLinks`: `Desktop`, `DesktopLink`, `Link`, `HoverLink`, `PrimaryLink`, `HoverPrimaryLink`, `Trigger`, `HoverTrigger`, `Panel`, `OpenPanel`, `PanelNavigation`, `PanelLink`, `FirstPanelLink`, `Close`, `HoverClose`
- `SearchButton`: `PendingShortcut`, `Label`, `Shortcut`, `Hover`, `Active`, `NativeIcon`, `Icon`
- `Sidebar`: `Backdrop`, `OpenBackdrop`, `MobileHeading`, `HomeLink`, `HomeLogo`, `HomeLabel`, `Close`, `HoverClose`, `CloseIcon`, `CurrentLink`, `OpenPane`, `EnteredPane`, `Content`, `Tree`, `List`, `Item`, `TopLevelSpacing`, `GroupSpacing`, `NestedItem`, `SectionHeading`, `Control`, `Summary`, `GroupLabel`, `GroupLabelText`, `Link`, `LinkLabel`, `InteractiveControl`, `SummaryMarker`, `Caret`, `ExpandedCaret`, `LinkedSummary`, `GroupLink`, `LinkedSectionHeading`, `SectionLink`, `Badge`, `TopLevelLink`
- `MobileMenuToggle`: `Control`, `Icon`, `Section`, `Page`, `HoverControl`, `ActiveControl`
- `MobileNavigationTabs`: `Trigger`, `Marker`, `Caret`, `ExpandedCaret`, `Label`, `List`, `Item`, `Link`, `HoverLink`, `CurrentLink`
- `MobileMenuFooter`: `Social`
- `TopNavigation`: `Scrollbar`, `Link`, `HoverLink`, `CurrentLink`, `ActiveIndicator`
- `TableOfContentsLayout`: `WithMobile`, `Content`
- `TableOfContents`: `Heading`, `List`, `Item`, `Link`, `LinkLabel`, `HoverLink`, `CurrentLink`
- `MobileTableOfContents`: `Summary`, `List`, `NestedList`, `Item`, `Link`, `HoverLink`, `Focus`
- `Pagination`: `Link`, `PreviousLink`, `NextLink`, `NextIcon`, `NextLabel`, `HoverLink`, `ActiveLink`, `Title`, `LoneNextLink`, `Icon`, `PreviousIconRtl`, `NextIconRtl`
- `VersionSwitcher`: `Trigger`, `HoverTrigger`, `TriggerLabel`, `Caret`, `Panel`, `OpenPanel`, `PanelTitle`, `Options`, `Link`, `HoverLink`, `CurrentLink`, `Checkmark`, `SelectedCheckmark`
- `LanguageSelect`: `Compact`, `Trigger`, `HoverTrigger`, `ActiveTrigger`, `LabelIcon`, `TriggerLabel`, `Caret`, `CompactTrigger`, `CompactLabel`, `CompactCaret`, `Label`, `HoverLabel`, `Select`, `CompactSelect`, `CompactLabelIcon`, `SidebarTrigger`, `Panel`, `SidebarPanel`, `OpenPanel`, `PanelTitle`, `Options`, `Option`, `HoverOption`, `CurrentOption`, `Fallback`, `Checkmark`, `SelectedCheckmark`
- `SocialIcons`: `Link`, `HoverLink`, `Icon`
- `ThemeSelect`: `Trigger`, `HoverTrigger`, `ActiveTrigger`, `Icon`, `Panel`, `OpenPanel`, `Section`, `SectionSpacing`, `SectionLabel`, `Option`, `HoverOption`, `CheckedOption`, `FocusedOption`, `Input`, `OptionIcon`, `Checkmark`, `SelectedCheckmark`

#### Rendered content

- `Markdown`: `Block`, `BlockSpacing`, `HeadingSpacing`, `List`, `CompactItem`, `ListItem`, `DefinitionTerm`, `DefinitionDescription`, `Link`, `HoverLink`, `Quote`, `Rule`, `Details`, `HoverDetails`, `Summary`, `OpenSummary`, `SummaryMarker`, `SummaryIcon`, `OpenSummaryIcon`, `Code`
- `MarkdownHeading`: `Heading`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6`, `Link`, `RevealedLink`, `HoverLink`, `LinkIcon`, `CopiedLink`, `CopiedLinkIcon`, `CopiedIcon`
- `MarkdownCodeBlock`: `Pre`, `CopyButton`, `HoverCopyButton`, `CopiedButton`, `CopyIcon`, `CopiedIcon`, `Code`, `Diff`, `DiffCode`, `DiffLine`, `EmptyDiffLine`, `InsertedLine`, `DeletedLine`
- `MarkdownInlineCode`: None
- `MarkdownTable`: `Table`, `Cell`, `LastBodyRowCell`, `HeaderCell`, `Scroll`
- `MarkdownAlert`: `Note`, `Tip`, `Caution`, `Danger`, `Title`, `FirstContent`
- `SyntaxHighlight`: `Scroll`, `Wrap`, `Marker`, `Comment`, `Punctuation`, `Keyword`, `String`, `Token`, `Property`, `Number`, `Function`, `Value`, `Operator`, `Text`, `Bg`, `Inserted`, `Deleted`, `Italic`, `Strong`, `Underline`
- `Mermaid`: `Diagram`, `Text`, `MonoText`
- `MermaidSource`: None

#### Authoring components

- `Card`: `Heading2`, `Heading3`, `Paragraph`
- `Callout`: `Title`, `Body`, `Tip`, `Caution`, `Danger`
- `CodeGroup`: `Caption`, `Pre`, `Code`
- `Tab`: `Heading`, `Hidden`, `HiddenHeading`
- `Tabs`: `List`, `Button`, `SelectedButton`, `FocusedButton`
- `Steps`: `Item`, `Marker`
- `Hero`: `Visual`, `DarkVisual`, `LightVisual`, `Stack`, `Copy`, `Title`, `Tagline`, `Actions`, `Action`, `HoverAction`, `PrimaryAction`, `SecondaryAction`, `MinimalAction`, `ActionIcon`
- `Preview`: `Caption`, `Stage`, `Frame`, `Code`, `Summary`, `HoverSummary`, `ActiveSummary`, `Pre`
- `SiteLogo`: `Image`, `Light`, `Dark`
- `Logo`: `Svg`, `Mark`
- `PageActions`: `Control`, `Hover`, `Focus`, `Pending`, `Status`
- `Footer`: `Meta`, `LoneMetaItem`, `MetaLink`, `HoverMetaLink`, `Credit`, `CreditLink`, `HoverCreditLink`
- `PackageVersion`: None

#### Search

- `Search`: `Status`, `Dialog`, `CloseIcon`, `OpenDialog`, `EnteredDialog`, `Backdrop`, `EnteredBackdrop`, `Frame`, `Container`, `Close`, `HoverClose`, `ActiveClose`
- `SearchResults`: `UI`, `Form`, `Field`, `EngineControls`, `Drawer`, `Input`, `Clear`, `Results`, `Result`, `ResultLink`, `SearchIcon`, `ClearIcon`, `SuppressedClear`, `Message`, `List`, `Title`, `Excerpt`, `NestedResult`, `Match`, `More`, `HoverMore`

<!-- component-anatomy:end -->

`COOKBOOK_COMPONENT_NAMES` publishes the configuration names, and
`COOKBOOK_COMPONENT_SUB_ELEMENTS` publishes the complete sub-element lists for
theme editors and other tooling. The corresponding TypeScript types are
`CookbookComponentName`, `CookbookComponentSubElementName`,
`CookbookComponentStyles`, `ComponentStyleConfig`, and `ComponentStylesConfig`.
Known configuration names provide editor suggestions for their named
sub-elements. `ThemeSelect` styles the combined Appearance panel; replace old
`Select` and `Picker` overrides with `Trigger` and `Panel`. The separate
`ContrastSelect` surface is replaced by the same `ThemeSelect` panel and option
sub-elements. `SocialIcons` styles the shared icon-button links in the header
and mobile menu. On wider layouts, heading permalinks sit to the left of the
heading and are revealed on heading hover or keyboard focus. On mobile they
stay visible and inline so the target is not clipped by the narrower content
gutter. Customize the behavior with `MarkdownHeading.Link`,
`MarkdownHeading.RevealedLink`, and `MarkdownHeading.LinkIcon`. The `#` icon
scales with its heading and stays centered in the link target across heading
levels and screen widths. Activating a heading link copies the full page URL
with that section’s fragment without scrolling or changing the current URL. A
checkmark and screen-reader status confirm the copy; clipboard failures are
announced. Modified clicks and links
without JavaScript retain native anchor behavior. Customize the confirmation
with `MarkdownHeading.CopiedLink`, `MarkdownHeading.CopiedLinkIcon` (the hidden
original icon), and `MarkdownHeading.CopiedIcon` (the checkmark).

Root properties customize each navigation container. For example, overriding
`Sidebar.LinkLabel.whiteSpace` keeps the other base `LinkLabel` properties
because the configured object is merged by default.
By default, the footer credit uses the primary body text color, while its
Cookbook link uses the semantic brand link color.

`components.overrides` remains the structural escape hatch for replacing an
Astro component. Prefer `theme.styles` when the markup and behavior remain the
same.

Register custom names and their partial Tasty objects in `theme.customStyles`.
Built-in names belong in `theme.styles` and reject misspelled sub-elements.
The name must match the string passed to `defineComponent()` or
`resolveComponentStyles()`. A production
build warns when a configured custom name has no matching component style
resolver.

The default renderer runs Tasty in Astro extract mode. Direct components and
the remaining document/vendor bridge styles are collected into shared static
CSS during the build, while appearance controls add only the small client
behavior needed to persist selected theme and contrast modes. The compact
Cookbook logo is shown beside the project title in the default top bar, links
to the localized home page, and is also the default generated favicon. Use
[`site.favicon`](./configuration.md#site-icons) to generate the complete icon
set from project artwork.

## Static behavior

Documentation content, navigation, headings, code, and images remain readable
without client JavaScript. Search, mobile navigation, copy controls, appearance
persistence, and executable previews enhance the static output.

### Appearance and navigation

The Appearance button in the desktop and mobile header opens one panel with
Color scheme and Contrast sections. Color scheme offers Light, Dark, and Auto;
Contrast offers Normal, High, and Auto. Each preference is independent, and
selections are saved in the browser. The panel supports keyboard navigation,
Escape, and outside-click dismissal. The Appearance, Language, Version, and mobile links
popovers each fade and scale vertically from 96% to 100% over 120ms when
opening and closing. Reduced motion disables the transition. Customize the
Appearance states with
`theme.styles.ThemeSelect.Panel` and `OpenPanel`; the root `$popover-transition`
token controls the duration. Contrast can follow the system, force the
normal palette, or activate the Glaze high-contrast palette.
System mode responds to `prefers-contrast: more`; an explicit selection is
persisted and takes precedence over that media query.

Interactive controls step up exactly one surface level: a control on `surface`
uses `surface-2`, while a control on `surface-2` uses `surface-3`. Hover and
pressed states build on that elevated surface without changing the border.
Inputs stay on their surrounding surface so their border remains the visual
boundary. Primary buttons and selected navigation use the fixed-mode
`accent-surface` and its paired light `accent-surface-text`. The brand fill
keeps its polarity in dark mode while Glaze adjusts it to preserve label
contrast.

Page navigation keeps Next first in the keyboard order. It appears above
Previous on narrow screens; wider layouts show Previous at the start and Next
at the end.

### Responsive header and navigation

The header uses `#header`, generated from `theme.palette.header` (or the page
surface) at 70% opacity in all four appearance modes, with a 16px backdrop blur.
Customize the outer bar with `theme.styles.HeaderFrame`, its contents with
`Header`, and header buttons with `HeaderLinks` and `SearchButton`.

Below 50rem, page navigation moves into a header row and opens a left drawer.
`MobileMenuToggle.Section` and `Page` style its breadcrumb labels. The drawer
contains the complete active section, a collapsible `MobileNavigationTabs`
selector, and a close button. The drawer slides in and out over 120ms and
disables motion when the reader prefers reduced motion. Its mobile shadow uses
the Glaze `shadow`-typed `#shadow` token. Customize the movement and shadow through
`theme.styles.Sidebar`, and the underlay through `Sidebar.Backdrop` and
`OpenBackdrop`. `theme.palette.overlay` supplies the underlay declaration, which defaults
to black at 50% opacity. Glaze resolves it in fixed mode with tone remapping
disabled, so it stays black in dark and high-contrast schemes.
Icon buttons retain their plain desktop appearance on mobile. More uses
left-aligned navigation links with a `1bw` gap, without primary button variants.
`HeaderLinks.PanelLink` styles the menu rows; `FirstPanelLink` reserves space
for the close button. The inset divider above the tabs belongs to `TopNavigation`.

The desktop table of contents is hidden below 72rem. Set
`tableOfContents: { mobile: true }` to show an optional compact disclosure there.
On desktop, the current section is marked as the page scrolls and its link stays
visible in a long contents list. Customize its appearance with
`theme.styles.TableOfContents.CurrentLink`.
`MobileTableOfContents` owns its summary and links; `TableOfContentsLayout`
controls placement. `Layout` controls shared
navigation dimensions and the drawer's scroll lock; `PageFrame` styles the
page container and content columns.

### Header control shape

Header buttons and the mobile drawer close button use the independent
`$header-control-radius` token, which defaults to `999px` for pill and circular
shapes. Set it to `8px` for the same corners as the default content controls:

```ts
theme: {
  tokens: { "$header-control-radius": "8px" }
}
```

`$radius` continues to control code-copy buttons, navigation items, and other
content controls. Individual `theme.styles` overrides still take precedence.
The mobile header divider spans the viewport while its content keeps the
configured horizontal padding.

## Customize shared page surfaces

Each bridge has a complete base style tree; supply only the properties you
want to change. Sub-elements keep their selectors and all other defaults.
For example, a compact search dialog and quieter pagination need no CSS:

```ts
theme: {
  styles: {
    Search: { Dialog: { inlineSize: "max 32rem" } },
    SearchResults: { ResultLink: { color: "#accent-text" } },
    Pagination: { Link: { padding: "1.5x", fill: "#surface" } },
    Banner: { padding: "1x 2x" },
    Markdown: { Quote: { color: "#text", inlinePadding: "3x start" } },
  },
}
```

`Document` owns resets, base typography, generic controls, responsive media,
and accessibility utilities. `MainPane` and `MainContent` own the content
layout. `Markdown` owns prose, lists, links, quotations, and disclosure
anatomy. `Search` owns the dialog; `SearchResults` owns the search field and
Pagefind results UI.
`MarkdownAlert` styles rendered alert blockquotes; `Card`, `Callout`, and
`Steps` style Cookbook components.

Custom components created with `defineComponent()` receive `theme.customStyles`
overrides during server rendering. Units, recipes, states, and presets are
resolved there and emitted as static CSS. Cookbook ships no Tasty/Glaze browser
runtime, theme configuration, or style hydration setup. Browser scripts and
`client:*` islands must not import Cookbook styling, Tasty, or Glaze; the build
rejects these imports. Attach small interaction scripts to server-rendered markup
or pass already-styled static markup into a client island.

Code fences and `CodeGroup` use the same `MarkdownCodeBlock` style tree. Its
root `$copy-button-size` defaults to `2rem`; the copy control and vertical
padding share it, keeping equal top, right, and bottom insets on one-line
snippets. The padding follows the `code` preset's line height. Override it with
`theme.styles.MarkdownCodeBlock` when changing the control size or code layout.

### Syntax highlighting and isolated previews

Shiki classifies code; Tasty renders every token using Glaze's semantic syntax
colors. Customize token rules with `theme.styles.SyntaxHighlight`, or their
colors with `theme.palette` (for example `syntax-keyword`). The default
`syntax-bg` stays white in light mode and takes a slight brand-hued tint, close
to the page background's saturation, in dark mode. Set
`theme.palette["syntax-bg"]` to give code its own color seed;
syntax text and token contrast resolve against that surface. Code fences, including
MDX and diff blocks, use classes without inline style attributes. Custom Shiki
transformers should emit classes; unsupported inline declarations fail with a
configuration hint.

The production build rejects style attributes, style blocks (including inside
shadow-root templates), and non-Tasty stylesheets throughout documentation HTML.
It parses actual markup, so escaped examples and strings in scripts are allowed.
The explicit exception is the separate document in a sandboxed `Preview` iframe;
it cannot access its parent's origin. Configure its size with
`theme.styles.Preview.Frame`. The documentation shell supports the CSP directive
`style-src-attr 'none'`. A host's CSP may also restrict the preview document; when
using that directive, authored previews must use style blocks rather than style
attributes.

Search uses an owned, keyboard-accessible dialog and server-rendered input so
the first opening can focus the field immediately on mobile. Pagefind's indexing
and results UI load lazily. Customize the field with `SearchResults.Field`,
`Input`, and `Clear`; `EngineControls` hides Pagefind's duplicate controls.
Closing waits for the dialog's fade transition, with reduced motion respected.
The fullscreen mobile dialog has no dimmed or blurred backdrop; the backdrop
transition applies only to wider layouts.
The Pagefind sizing adapter prevents inline layout declarations and is checked
against the pinned UI version during builds.
