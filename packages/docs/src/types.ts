import type { GlazeColorValue } from "@tenphi/glaze";
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

export interface SiteConfig {
  title?: string;
  /** Version of the documented package, rendered beside the site title. */
  version?: string;
  description?: string;
  url?: string;
  repository?: string;
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

export type DocsSource =
  | {
      file: string;
      route?: string;
      title?: string;
      description?: string;
      navigation?: false | NavigationPlacement;
    }
  | {
      glob: string | string[];
      base?: string;
      routeBase?: string;
      exclude?: string[];
      navigation?: "auto" | false;
    }
  | {
      package: string;
      include?: string[];
      exclude?: string[];
      index?: string;
      routeBase?: string;
      trust?: "markdown" | "mdx";
    };

export interface ContentConfig {
  sources?: DocsSource[];
  allowOutsideRoot?: boolean;
  localizeRepositoryLinks?: boolean;
}

export type NavigationItem =
  | string
  | { label: string; items: NavigationItem[] }
  | { label: string; autogenerate: { directory: string } }
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

export type BrandConfig =
  | GlazeColorValue
  | {
      from: GlazeColorValue;
      contrast?: { apca: number | [number, number] };
      unsafeContrast?: boolean;
    };

export type ThemeTokenValue = string | number;

/**
 * Tasty design tokens. `$name` is emitted as `--name`; existing `--name`
 * custom-property keys remain supported for compatibility.
 */
export interface ThemeTokens {
  $gap?: ThemeTokenValue;
  $radius?: ThemeTokenValue;
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

/** Semantic palette inputs. Glaze resolves every value for all appearance modes. */
export interface ThemePaletteConfig {
  /** Light-scheme page surface; dark and high-contrast values adapt. */
  surface?: GlazeColorValue;
  /** Primary reading text seed, resolved against `surface`. */
  text?: GlazeColorValue;
  /** Secondary text seed, resolved against `surface`. */
  textSoft?: GlazeColorValue;
}

/** Cookbook UI surfaces whose default Tasty styles can be customized. */
export const COOKBOOK_COMPONENT_NAMES = [
  "Card",
  "ContrastSelect",
  "Footer",
  "Logo",
  "MarkdownTable",
  "Mermaid",
  "MobileMenuFooter",
  "MobileNavigationTabs",
  "MobileTableOfContents",
  "PackageVersion",
  "Preview",
  "Sidebar",
  "Steps",
  "Tabs",
  "TableOfContents",
  "ThemeSelect",
  "TopNavigation",
  "StarlightHeader",
] as const;

export type CookbookComponentName = (typeof COOKBOOK_COMPONENT_NAMES)[number];

/** A serializable Tasty style object. */
export type ComponentStyles = Record<string, unknown>;

/**
 * Plain style objects extend Cookbook defaults. Use `mode: "replace"` to
 * discard a UI surface's defaults and supply the complete style object.
 */
export type ComponentStyleConfig =
  | ComponentStyles
  | {
      mode: "extend" | "replace";
      styles: ComponentStyles;
    };

export type ComponentStylesConfig = Partial<
  Record<CookbookComponentName, ComponentStyleConfig>
> &
  Record<string, ComponentStyleConfig | undefined>;

export interface ThemeConfig {
  variant?: string;
  brand?: BrandConfig;
  palette?: ThemePaletteConfig;
  states?: Record<string, string>;
  tokens?: ThemeTokens;
  presets?: TypographyPresets;
  /** Tasty UI styles, keyed by Cookbook component or bridge name. */
  styles?: ComponentStylesConfig;
  contrastLevel?: number | "auto";
}

export interface MarkdownConfig {
  stripLeadingBadges?: boolean;
  rawHtml?: "sanitize" | "allow" | "reject";
  strictLanguages?: boolean;
  executablePreviews?: boolean;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
}

export interface SearchConfig {
  enabled?: boolean;
}

export interface ComponentsConfig {
  /** Astro component paths keyed by Starlight component name. `Footer` also accepts `false`. */
  overrides?: Record<string, string | false>;
}

export interface BuildConfig {
  strict?: boolean;
  ci?: boolean;
  base?: string;
  cacheDir?: string;
  maxArtifactBytes?: number;
  maxUnpackedBytes?: number;
  maxFiles?: number;
  maxPathDepth?: number;
  maxAssetBytes?: number;
}

export interface DocsConfig {
  site?: SiteConfig;
  head?: HeadConfig[];
  content?: ContentConfig;
  navigation?: NavigationConfig | NavigationItem[];
  theme?: ThemeConfig;
  markdown?: MarkdownConfig;
  search?: SearchConfig;
  components?: ComponentsConfig;
  build?: BuildConfig;
}

export interface NormalizedDocsConfig {
  site: SiteConfig;
  head: HeadConfig[];
  content: Required<
    Pick<ContentConfig, "allowOutsideRoot" | "localizeRepositoryLinks">
  > &
    ContentConfig;
  navigation: NavigationConfig;
  theme: ThemeConfig & { brand: BrandConfig };
  markdown: Required<
    Pick<
      MarkdownConfig,
      | "stripLeadingBadges"
      | "rawHtml"
      | "strictLanguages"
      | "executablePreviews"
    >
  > &
    MarkdownConfig;
  search: Required<SearchConfig>;
  components: ComponentsConfig;
  build: Required<BuildConfig>;
}

export interface DocsFrontmatter {
  title?: string;
  description?: string;
  slug?: string;
  draft?: boolean;
  sidebar?: false | { label?: string; order?: number; group?: string };
  toc?: false | { minHeadingLevel?: number; maxHeadingLevel?: number };
  editUrl?: false | string;
  prev?: false | string;
  next?: false | string;
  search?: boolean;
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
}

export interface DocsGraph {
  root: string;
  config: NormalizedDocsConfig;
  entries: DocsEntry[];
  routes: DocsRoute[];
  assets: DocsAsset[];
  diagnostics: DocsDiagnostic[];
  entryByRoute(route: string): DocsEntry | undefined;
  entryBySource(sourcePath: string): DocsEntry | undefined;
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
}
