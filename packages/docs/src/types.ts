import type {
  RecipeStyles,
  Styles,
  StylesWithoutSelectors,
} from "@tenphi/tasty/core";
import type {
  GlazeColorInput,
  GlazeConfigOverride,
  GlazeColorValue,
  ColorDef,
} from "@tenphi/glaze";
import type { Root } from "mdast";

export type DiagnosticSeverity = "warning" | "error";

export interface DocsDiagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  hint?: string;
  related?: Array<{ file: string; line?: number; message: string }>;
}

export interface SocialImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
export interface BreadcrumbItem {
  name: string;
  url: string;
}
export interface SiteSeoConfig {
  titleTemplate?: string;
  image?: SocialImage | false;
  /** False on preview deployments; pages cannot override this restriction. */
  index?: boolean;
  breadcrumbs?: boolean;
  /** Offer a clean Markdown download and copy control. Defaults to true. */
  copyPage?: boolean;
}
export interface PageSeoConfig {
  /** Complete document title, overriding the site template. */
  title?: string;
  canonical?: string;
  image?: SocialImage | false;
  index?: boolean;
  breadcrumbs?: BreadcrumbItem[] | false;
}
export interface SiteConfig {
  seo?: SiteSeoConfig;
  title?: string;
  /** Version of the documented package, rendered beside the site title. */
  version?: string;
  /** Selectable documentation versions and their route roots. */
  versions?: SiteVersion[];
  description?: string;
  url?: string;
  repository?: string;
  /** Header buttons, collapsed into a More menu on mobile. */
  headerLinks?: HeaderLink[];
  /** Source artwork used to generate browser, touch, and installable-app icons. */
  favicon?: string | SiteIconConfig;
  /** Shared header and mobile drawer artwork. Paths are relative to the project root. */
  logo?: false | string | SiteLogoConfig;
}

export interface SiteVersion {
  /** Exclude this version from search engines, sitemaps, and agent indexes. */
  index?: boolean;
  label: string;
  routeBase: string;
}

export interface HeaderLink {
  label: string;
  /** HTTP(S) URL, root-relative route (prefixed with the site base), or fragment. */
  link: string;
  /** Desktop button variant; mobile More menus use uniform navigation links. */
  variant?: "default" | "primary";
  newTab?: boolean;
}

export interface SiteLogoConfig {
  /** Use one image, or supply both light and dark images instead. */
  src?: string;
  light?: string;
  dark?: string;
  alt?: string;
  /** Defaults to the localized documentation home. */
  href?: string;
  /** Intrinsic dimensions; normally inferred from the image. */
  width?: number;
  height?: number;
  /** True by default because the site title labels the same destination. */
  decorative?: boolean;
}

export interface SiteIconConfig {
  /** Local SVG, PNG, JPEG, WebP, AVIF, or GIF path, relative to the project root. */
  source: string;
  /** Opaque background for touch and maskable icons. */
  background?: string;
}

/** A language exposed by Cookbook's locale picker and routing. */
export interface LocaleConfig {
  label: string;
  /** BCP-47 language tag. Defaults to the locale key. */
  lang?: string;
  dir?: "ltr" | "rtl";
}

export interface EditLinkConfig {
  /** Base URL joined with each page's repository-relative source path. */
  baseUrl: string;
}

/** A custom HTML element rendered in the document head. */
export interface HeadConfig {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  content?: string;
}

export interface NavigationPlacement {
  label?: string;
  order?: number;
  group?: string;
}

export type DocsSource = {
  /** Stable name for cross-source links and repeated mounts. */
  id?: string;
  routeBase?: string;
} & (
  | {
      file: string;
      root?: string;
      route?: string;
      title?: string;
      description?: string;
      navigation?: false | NavigationPlacement;
    }
  | {
      glob: string | string[];
      root?: string;
      base?: string;
      routeBase?: string;
      exclude?: string[];
      navigation?: "auto" | false;
    }
  | {
      package: string;
      registry?: string;
      include?: string[];
      exclude?: string[];
      index?: string;
      routeBase?: string;
      trust?: "markdown" | "mdx";
    }
  | {
      /** Local OpenAPI 3.x JSON or YAML document. */
      openapi: string;
      root?: string;
      routeBase?: string;
    }
);

export interface ContentConfig {
  sources?: DocsSource[];
  allowOutsideRoot?: boolean;
  /** Rewrite absolute links into the current repository to matching Cookbook routes. */
  localizeRepositoryLinks?: boolean;
  /** Preserve custom metadata for content queries and renderer middleware, or reject unknown fields. */
  frontmatter?: "preserve" | "reject";
}

export type NavigationItem =
  | string
  | { label: string; link?: string; items: NavigationItem[] }
  | { label: string; link?: string; autogenerate: { directory: string } }
  | { label: string; link: string };

export interface NavigationTab {
  label: string;
  link: string;
  /** Sidebar tree shown while this tab is active. */
  items?: NavigationItem[];
}

export interface NavigationConfig {
  items?: NavigationItem[];
  /** Optional primary navigation rendered as a compact row below the header. */
  tabs?: NavigationTab[];
}

export type BrandDeclaration = Pick<GlazeColorInput, "hue" | "saturation"> & {
  /** Single tone for the brand seed; contrast targets adapt it per mode. */
  tone: number;
  contrast?: { apca: number | [number, number] };
  unsafeContrast?: boolean;
};

export type BrandConfig =
  | GlazeColorValue
  | {
      from: GlazeColorValue;
      contrast?: { apca: number | [number, number] };
      unsafeContrast?: boolean;
    }
  | BrandDeclaration;

export type ThemeTokenValue = string | number;

/**
 * Tasty design tokens. `$name` is emitted as `--name`; existing `--name`
 * custom-property keys remain supported for compatibility.
 */
export interface ThemeTokens {
  $gap?: ThemeTokenValue;
  $radius?: ThemeTokenValue;
  /** Independent pill/circle radius for header controls and drawer close buttons. */
  "$header-control-radius"?: ThemeTokenValue;
  "$card-radius"?: ThemeTokenValue;
  "$border-width"?: ThemeTokenValue;
  "$outline-width"?: ThemeTokenValue;
  "$outline-offset"?: ThemeTokenValue;
  "$layout-width"?: ThemeTokenValue;
  "$content-width"?: ThemeTokenValue;
  "$sidebar-width"?: ThemeTokenValue;
  "$control-height"?: ThemeTokenValue;
  [name: `$${string}`]: ThemeTokenValue | undefined;
  [customProperty: `--${string}`]: ThemeTokenValue | undefined;
}

export interface TypographyPreset {
  fontFamily?: string;
  fontSize?: ThemeTokenValue;
  lineHeight?: ThemeTokenValue;
  letterSpacing?: ThemeTokenValue;
  fontWeight?: ThemeTokenValue;
  boldFontWeight?: ThemeTokenValue;
  iconSize?: ThemeTokenValue;
  textTransform?: ThemeTokenValue;
  fontStyle?: ThemeTokenValue;
}

/** Built-in presets can be overridden and additional Tasty presets may be added. */
export interface TypographyPresets {
  body?: TypographyPreset;
  heading?: TypographyPreset;
  h1?: TypographyPreset;
  h2?: TypographyPreset;
  h3?: TypographyPreset;
  h4?: TypographyPreset;
  h5?: TypographyPreset;
  h6?: TypographyPreset;
  navigation?: TypographyPreset;
  small?: TypographyPreset;
  code?: TypographyPreset;
  [name: string]: TypographyPreset | undefined;
}

/** A font file served from the site's `public/` directory. */
export interface ThemeFontFile {
  /** Root-relative public URL, for example `/fonts/brand.woff2`. */
  src: string;
  /** A single weight or a variable-font range such as `"100 900"`. */
  weight?: number | `${number} ${number}`;
  style?: "normal" | "italic";
}

/** A Google Fonts family or a set of files hosted by the site. */
export type ThemeFont =
  | string
  | {
      google: string;
      /** Individual weights or variable ranges, using the same syntax as local files. */
      weights?: Array<number | `${number} ${number}`>;
      /** Defaults to normal and italic; omit unavailable styles explicitly. */
      styles?: Array<"normal" | "italic">;
    }
  | { family: string; files: ThemeFontFile[] };

export interface FontLoadingConfig {
  /** Download Google font files into the site by default. */
  google?: "self-hosted" | "remote";
  /** Reuse verified cache entries by default. Offline never performs network requests. */
  cache?: "reuse" | "refresh" | "offline";
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
}

export interface ThemeFonts {
  body?: ThemeFont;
  heading?: ThemeFont;
  code?: ThemeFont;
}

/** A Glaze declaration, or a literal color retained as a convenient seed shorthand. */
export type ThemePaletteColor = GlazeColorValue | ColorDef;

export const COOKBOOK_PALETTE_NAMES = [
  "surface",
  "header",
  "surface-2",
  "surface-3",
  "text",
  "heading",
  "text-soft",
  "text-muted",
  "sidebar-text",
  "surface-2-hover",
  "surface-2-pressed",
  "surface-3-hover",
  "surface-3-pressed",
  "accent-text",
  "focus",
  "accent-surface",
  "accent-surface-text",
  "logo-surface",
  "logo-mark",
  "accent-surface-subtle",
  "accent-surface-2-subtle",
  "shadow",
  "clear",
  "info",
  "info-text",
  "info-surface",
  "success",
  "success-text",
  "success-surface",
  "warning",
  "warning-text",
  "warning-surface",
  "danger",
  "danger-text",
  "danger-surface",
  "orange",
  "orange-text",
  "orange-surface",
  "green",
  "green-text",
  "green-surface",
  "blue",
  "blue-text",
  "blue-surface",
  "purple",
  "purple-text",
  "purple-surface",
  "red",
  "red-text",
  "red-surface",
  "overlay",
  "border",
  "border-strong",
  "syntax-bg",
  "syntax-text",
  "syntax-comment",
  "syntax-punctuation",
  "syntax-keyword",
  "syntax-string",
  "syntax-token",
  "syntax-property",
  "syntax-number",
  "syntax-function",
  "syntax-value",
  "syntax-operator",
] as const;
export type CookbookPaletteName = (typeof COOKBOOK_PALETTE_NAMES)[number];

/** Semantic palette declarations resolved for every appearance mode. */
export interface ThemePaletteConfig extends Partial<
  Record<CookbookPaletteName, ThemePaletteColor>
> {
  /** Additional Glaze roles, exposed as Tasty #name tokens. Use lowercase hyphenated names. */
  [name: string]: ThemePaletteColor | undefined;
  info?: ThemePaletteColor;
  success?: ThemePaletteColor;
  warning?: ThemePaletteColor;
  danger?: ThemePaletteColor;
  /** Light-scheme page surface; dark and high-contrast values adapt. */
  surface?: ThemePaletteColor;
  /** Translucent header surface; defaults to the page surface declaration. */
  header?: ThemePaletteColor;
  /** Fixed underlay; defaults to black at 50% opacity in every scheme. */
  overlay?: ThemePaletteColor;
  /** Primary reading text, resolved against `surface`. */
  text?: ThemePaletteColor;
  /** Heading text; follows an explicit `text` declaration unless configured. */
  heading?: ThemePaletteColor;
  /** Secondary reading text, resolved against `surface`. */
  textSoft?: ThemePaletteColor;
}

/** Cookbook UI surfaces whose default Tasty styles can be customized. */
export const COOKBOOK_COMPONENT_NAMES = [
  "Card",
  "Callout",
  "CodeGroup",
  "Tab",
  "Footer",
  "PageActions",
  "MobileTableOfContents",
  "Hero",
  "PageFrame",
  "HeaderFrame",
  "HeaderLinks",
  "Heading",
  "Layout",
  "SearchButton",
  "TableOfContentsLayout",
  "LanguageSelect",
  "Logo",
  "SiteLogo",
  "MarkdownCodeBlock",
  "MarkdownHeading",
  "MarkdownInlineCode",
  "MarkdownTable",
  "Mermaid",
  "MobileMenuFooter",
  "MobileMenuToggle",
  "MobileNavigationTabs",
  "PackageVersion",
  "VersionSwitcher",
  "Preview",
  "Sidebar",
  "SocialIcons",
  "Steps",
  "Tabs",
  "TableOfContents",
  "ThemeSelect",
  "TopNavigation",
  "Header",
  "Document",
  "MainPane",
  "MainContent",
  "Banner",
  "SkipLink",
  "Search",
  "Pagination",
  "Markdown",
  "MermaidSource",
  "MarkdownAlert",
  "SearchResults",
  "SyntaxHighlight",
] as const;

export type CookbookComponentName = (typeof COOKBOOK_COMPONENT_NAMES)[number];

/** Named Tasty sub-elements available on each configurable Cookbook surface. */
export const COOKBOOK_COMPONENT_SUB_ELEMENTS = {
  SyntaxHighlight: [
    "Scroll",
    "Wrap",
    "Marker",
    "Comment",
    "Punctuation",
    "Keyword",
    "String",
    "Token",
    "Property",
    "Number",
    "Function",
    "Value",
    "Operator",
    "Text",
    "Bg",
    "Inserted",
    "Deleted",
    "Italic",
    "Strong",
    "Underline",
  ],
  SearchResults: [
    "UI",
    "Form",
    "Drawer",
    "Input",
    "Clear",
    "Results",
    "Result",
    "ResultLink",
    "SearchIcon",
    "ClearIcon",
    "SuppressedClear",
    "Message",
    "List",
    "Title",
    "Excerpt",
    "NestedResult",
    "Match",
    "More",
    "HoverMore",
  ],
  MarkdownAlert: ["Note", "Tip", "Caution", "Danger", "Title", "FirstContent"],
  MermaidSource: [],
  Markdown: [
    "Block",
    "BlockSpacing",
    "HeadingSpacing",
    "List",
    "CompactItem",
    "ListItem",
    "DefinitionTerm",
    "DefinitionDescription",
    "Link",
    "HoverLink",
    "Quote",
    "Rule",
    "Details",
    "HoverDetails",
    "Summary",
    "OpenSummary",
    "SummaryMarker",
    "SummaryIcon",
    "OpenSummaryIcon",
    "Code",
  ],
  Pagination: [
    "Link",
    "PreviousLink",
    "NextLink",
    "NextIcon",
    "NextLabel",
    "HoverLink",
    "ActiveLink",
    "Title",
    "LoneNextLink",
    "Icon",
    "PreviousIconRtl",
    "NextIconRtl",
  ],
  Search: [
    "Status",
    "Dialog",
    "CloseIcon",
    "OpenDialog",
    "EnteredDialog",
    "Backdrop",
    "EnteredBackdrop",
    "Frame",
    "Container",
    "Close",
    "HoverClose",
    "ActiveClose",
  ],
  SkipLink: ["Focus"],
  Banner: ["Link"],
  MainContent: [
    "ContentSpacing",
    "Container",
    "Panel",
    "FirstPanel",
    "BodyPanel",
  ],
  MainPane: ["WithSidebars"],
  Document: [
    "All",
    "Body",
    "Control",
    "Pointer",
    "ResponsiveWidth",
    "ResponsiveHeight",
    "Hidden",
    "PrintHidden",
    "DesktopBlock",
    "DesktopFlex",
    "ScreenReaderOnly",
    "Strong",
    "Link",
    "NarrowBlock",
    "MobileBlock",
    "Code",
    "FocusRing",
    "CurrentLink",
    "SearchOpen",
  ],
  PageFrame: ["MainFrame", "SidebarFrame", "Columns"],
  HeaderFrame: [],
  Heading: [
    "Level1",
    "Level2",
    "Level3",
    "Level4",
    "Level5",
    "Level6",
    "PageTitle",
  ],
  HeaderLinks: [
    "Desktop",
    "DesktopLink",
    "Link",
    "HoverLink",
    "PrimaryLink",
    "HoverPrimaryLink",
    "Trigger",
    "HoverTrigger",
    "Panel",
    "OpenPanel",
    "PanelNavigation",
    "PanelLink",
    "FirstPanelLink",
    "Close",
    "HoverClose",
  ],
  Layout: ["Islands", "LockedPage", "Light", "Auto"],
  SearchButton: [
    "PendingShortcut",
    "Label",
    "Shortcut",
    "Hover",
    "Active",
    "NativeIcon",
    "Icon",
  ],
  TableOfContentsLayout: ["WithMobile", "Content"],
  Card: ["Heading2", "Heading3", "Paragraph"],
  Callout: ["Title", "Body", "Tip", "Caution", "Danger"],
  CodeGroup: ["Caption", "Pre", "Code"],
  Tab: ["Heading", "Hidden", "HiddenHeading"],
  MobileTableOfContents: [
    "Summary",
    "List",
    "NestedList",
    "Item",
    "Link",
    "HoverLink",
    "Focus",
  ],
  PageActions: ["Control", "Hover", "Focus", "Pending", "Status"],
  Footer: [
    "Meta",
    "LoneMetaItem",
    "MetaLink",
    "HoverMetaLink",
    "Credit",
    "CreditLink",
    "HoverCreditLink",
  ],
  Hero: [
    "Visual",
    "DarkVisual",
    "LightVisual",
    "Stack",
    "Copy",
    "Title",
    "Tagline",
    "Actions",
    "Action",
    "HoverAction",
    "PrimaryAction",
    "SecondaryAction",
    "MinimalAction",
    "ActionIcon",
  ],
  LanguageSelect: [
    "Label",
    "HoverLabel",
    "LabelIcon",
    "Select",
    "Caret",
    "Option",
  ],
  Logo: ["Svg", "Mark"],
  SiteLogo: ["Image", "Light", "Dark"],
  MarkdownCodeBlock: [
    "Pre",
    "CopyButton",
    "HoverCopyButton",
    "CopiedButton",
    "CopyIcon",
    "CopiedIcon",
    "Code",
    "Diff",
    "DiffCode",
    "DiffLine",
    "EmptyDiffLine",
    "InsertedLine",
    "DeletedLine",
  ],
  MarkdownHeading: [
    "Heading",
    "Heading1",
    "Heading2",
    "Heading3",
    "Heading4",
    "Heading5",
    "Heading6",
    "Link",
    "RevealedLink",
    "HoverLink",
    "LinkIcon",
    "CopiedLink",
    "CopiedLinkIcon",
    "CopiedIcon",
  ],
  MarkdownTable: ["Table", "Cell", "LastBodyRowCell", "HeaderCell", "Scroll"],
  MarkdownInlineCode: [],
  Mermaid: ["Diagram", "Text", "MonoText"],
  MobileMenuFooter: ["Social"],
  MobileMenuToggle: [
    "Control",
    "Icon",
    "Section",
    "Page",
    "HoverControl",
    "ActiveControl",
  ],
  MobileNavigationTabs: [
    "Trigger",
    "Marker",
    "Caret",
    "ExpandedCaret",
    "Label",
    "List",
    "Item",
    "Link",
    "HoverLink",
    "CurrentLink",
  ],
  PackageVersion: [],
  VersionSwitcher: ["Trigger", "Panel", "OpenPanel", "Link", "CurrentLink"],
  Preview: [
    "Caption",
    "Stage",
    "Frame",
    "Code",
    "Summary",
    "HoverSummary",
    "ActiveSummary",
    "Pre",
  ],
  Sidebar: [
    "Backdrop",
    "OpenBackdrop",
    "MobileHeading",
    "HomeLink",
    "HomeLogo",
    "HomeLabel",
    "Close",
    "HoverClose",
    "CloseIcon",
    "CurrentLink",
    "OpenPane",
    "EnteredPane",
    "Content",
    "Tree",
    "List",
    "Item",
    "TopLevelSpacing",
    "GroupSpacing",
    "NestedItem",
    "SectionHeading",
    "Control",
    "Summary",
    "GroupLabel",
    "GroupLabelText",
    "Link",
    "LinkLabel",
    "InteractiveControl",
    "SummaryMarker",
    "Caret",
    "ExpandedCaret",
    "LinkedSummary",
    "GroupLink",
    "LinkedSectionHeading",
    "SectionLink",
    "Badge",
    "TopLevelLink",
  ],
  Steps: ["Item", "Marker"],
  SocialIcons: ["Link", "HoverLink", "Icon"],
  Tabs: ["List", "Button", "SelectedButton", "FocusedButton"],
  TableOfContents: [
    "Heading",
    "List",
    "Item",
    "Link",
    "LinkLabel",
    "HoverLink",
    "CurrentLink",
  ],
  ThemeSelect: [
    "Trigger",
    "HoverTrigger",
    "ActiveTrigger",
    "Icon",
    "Panel",
    "OpenPanel",
    "Section",
    "SectionSpacing",
    "SectionLabel",
    "Option",
    "HoverOption",
    "CheckedOption",
    "FocusedOption",
    "Input",
    "OptionIcon",
    "Checkmark",
    "SelectedCheckmark",
  ],
  TopNavigation: [
    "Scrollbar",
    "Link",
    "HoverLink",
    "CurrentLink",
    "ActiveIndicator",
  ],
  Header: [
    "Primary",
    "TitleAndSearch",
    "Title",
    "LogoLink",
    "Logo",
    "SiteTitle",
    "Search",
    "SearchElement",
    "Tools",
    "ToolItem",
    "Social",
    "MobileTheme",
  ],
} as const satisfies Record<CookbookComponentName, readonly string[]>;

export type CookbookComponentSubElementName<
  Name extends CookbookComponentName,
> = (typeof COOKBOOK_COMPONENT_SUB_ELEMENTS)[Name][number];

/** A serializable partial Tasty style object, merged into the base internally. */
export type ComponentStyles = StylesWithoutSelectors & {
  $?: string;
  mode?: never;
  recipe?: string;
  [token: `$${string}`]: Styles[string];
  [color: `#${string}`]: Styles[string];
  [state: `@${string}`]: Styles[string];
};

/** Style properties supplied by the user to override Cookbook defaults. */
export type ComponentStyleConfig = ComponentStyles;

/** A component override with typed suggestions for its named sub-elements. */
export type CookbookComponentStyles<Name extends CookbookComponentName> =
  ComponentStyles &
    Partial<Record<CookbookComponentSubElementName<Name>, ComponentStyles>>;

export type ComponentStylesConfig = {
  [Name in CookbookComponentName]?: CookbookComponentStyles<Name>;
};

export interface ThemeConfig {
  brand?: BrandConfig;
  palette?: ThemePaletteConfig;
  /** Glaze tone windows and adaptation settings; contrastLevel remains a top-level theme option. */
  glaze?: Omit<GlazeConfigOverride, "contrastLevel">;
  /** Named CSS length expressions used as custom Tasty units. */
  units?: Record<string, string>;
  /** Flat reusable Tasty style bundles. Recipes cannot reference other recipes. */
  recipes?: Record<string, RecipeStyles>;
  fonts?: ThemeFonts;
  fontLoading?: FontLoadingConfig;
  states?: Record<string, string>;
  tokens?: ThemeTokens;
  presets?: TypographyPresets;
  /** Tasty UI styles, keyed by Cookbook component or bridge name. */
  styles?: ComponentStylesConfig;
  /** Explicit registration and overrides for user-authored components. */
  customStyles?: Record<string, Styles>;
  contrastLevel?: number | "auto";
}

export interface MarkdownConfig {
  stripLeadingBadges?: boolean;
  /** Raw HTML policy for trusted Markdown. Untrusted package Markdown is always sanitized. */
  rawHtml?: "allow" | "sanitize" | "strip" | "reject";
}

export interface SearchConfig {
  enabled?: boolean;
}

export interface ComponentsConfig {
  /** Astro component paths keyed by Cookbook component name. `Footer` also accepts `false`. */
  overrides?: Record<string, string | false>;
}

export interface BuildConfig {
  strict?: boolean;
  ci?: boolean;
  cacheDir?: string;
  maxArtifactBytes?: number;
  maxUnpackedBytes?: number;
  maxFiles?: number;
  maxPathDepth?: number;
  maxAssetBytes?: number;
}

export interface TableOfContentsConfig {
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
  mobile?: boolean;
}

export interface DocsConfig {
  tableOfContents?: false | TableOfContentsConfig;
  /** Content and lock directory, relative to docs.config.ts (or the inline root). */
  root?: string;
  /** Old public routes mapped to current document routes. */
  redirects?: Record<string, string>;
  site?: SiteConfig;
  head?: HeadConfig[];
  /** Enable source-aware “Edit page” links. */
  editLink?: EditLinkConfig;
  /** Show the most recent Git commit date for each local page. */
  lastUpdated?: boolean;
  /** Languages keyed by their URL segment, or `root` for `/`. */
  locales?: Record<string, LocaleConfig>;
  /** Cookbook interface messages, keyed by language code. Missing keys use English. */
  translations?: Record<string, Record<string, string>>;
  /** Locale key used for fallback content. */
  defaultLocale?: string;
  content?: ContentConfig;
  navigation?: NavigationConfig | NavigationItem[];
  theme?: ThemeConfig;
  markdown?: MarkdownConfig;
  search?: SearchConfig;
  components?: ComponentsConfig;
  build?: BuildConfig;
}

export interface NormalizedDocsConfig {
  tableOfContents?: false | TableOfContentsConfig;
  redirects: Record<string, string>;
  site: SiteConfig;
  head: HeadConfig[];
  editLink?: EditLinkConfig;
  lastUpdated: boolean;
  locales?: Record<string, LocaleConfig>;
  /** Cookbook interface messages, keyed by language code. Missing keys use English. */
  translations?: Record<string, Record<string, string>>;
  defaultLocale?: string;
  content: Required<
    Pick<ContentConfig, "allowOutsideRoot" | "localizeRepositoryLinks">
  > &
    ContentConfig;
  navigation: NavigationConfig;
  theme: ThemeConfig & { brand: BrandConfig };
  markdown: Required<Pick<MarkdownConfig, "stripLeadingBadges" | "rawHtml">> &
    MarkdownConfig;
  search: Required<SearchConfig>;
  components: ComponentsConfig;
  build: Required<BuildConfig> & { base: string };
}

export interface DocsFrontmatter {
  seo?: PageSeoConfig;
  aliases?: string[];
  title?: string;
  description?: string;
  slug?: string;
  draft?: boolean;
  sidebar?: false | { label?: string; order?: number; group?: string };
  tableOfContents?: false | TableOfContentsConfig;
  editUrl?: false | string;
  /** Cookbook page layout. */
  template?: "doc" | "splash";
  hero?: {
    title?: string;
    tagline?: string;
    image?:
      | { html: string }
      | { file: string; alt?: string; width?: number; height?: number }
      | {
          dark: string;
          light: string;
          alt?: string;
          width?: number;
          height?: number;
        };
    actions?: Array<{
      text: string;
      link: string;
      variant?: "primary" | "secondary" | "minimal";
    }>;
  };
  lastUpdated?: boolean | Date;
  prev?: false | string | { link?: string; label?: string };
  next?: false | string | { link?: string; label?: string };
  banner?: { content: string };
  pagefind?: boolean;
  head?: Array<Record<string, unknown>>;
}

export interface DocsHeading {
  depth: number;
  text: string;
  slug: string;
  line?: number;
}

export interface DocsReference {
  original: string;
  resolved?: string;
  targetSource?: string;
  fragment?: string;
  line?: number;
}

export interface DocsAsset extends DocsReference {
  sourcePath?: string;
  publicPath?: string;
  hash?: string;
  bytes?: number;
}

export interface DocsEntry {
  id: string;
  sourceId: string;
  routeBase: string;
  metadata: Record<string, unknown>;
  sourcePath: string;
  absolutePath: string;
  sourceRoot: string;
  route: string;
  title: string;
  description?: string;
  frontmatter: DocsFrontmatter;
  headings: DocsHeading[];
  body: string;
  transformedBody: string;
  ast: Root;
  links: DocsReference[];
  assets: DocsAsset[];
  trust: "markdown" | "mdx";
  package?: { requested: string; resolved: string };
}

export interface DocsRoute {
  route: string;
  entryId: string;
  sourcePath: string;
  title: string;
  /** False for public routes excluded from automatic navigation and indexes. */
  discoverable?: boolean;
  /** Search-engine eligibility, independent from navigation visibility. */
  indexable?: boolean;
  /** False for a canonical alias or a noindex page. */
  sitemap?: boolean;
  canonical?: string;
  sidebar?: false | NavigationPlacement;
}

export interface DocsGraph {
  redirects: Record<string, string>;
  root: string;
  config: NormalizedDocsConfig;
  entries: DocsEntry[];
  routes: DocsRoute[];
  assets: DocsAsset[];
  diagnostics: DocsDiagnostic[];
  entryByRoute(route: string): DocsEntry | undefined;
  entryBySource(sourcePath: string, sourceId?: string): DocsEntry | undefined;
}

export interface PackageLockSource {
  requested: string;
  resolved: string;
  registry: string;
  integrity: string;
  vendored?: string;
}

export interface CookbookLock {
  schemaVersion: 1;
  sources: PackageLockSource[];
}

export interface PackageManifest {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  repository?: string | { type?: string; url?: string; directory?: string };
  cookbook?: {
    index?: string;
    include?: string[];
    exclude?: string[];
    theme?: { brand?: BrandConfig };
  };
  _integrity?: string;
  _resolved?: string;
}

export interface PackageDiscovery {
  root: string;
  manifest: PackageManifest;
  home?: string;
  pages: string[];
  assets: string[];
}

export interface CreateDocsGraphOptions {
  root?: string;
  config?: DocsConfig;
  lock?: CookbookLock;
  /** Public URL base used when rewriting routes and assets. */
  base?: string;
}
