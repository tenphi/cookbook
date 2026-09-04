import type {
  DocsConfig,
  DocsDiagnostic,
  NormalizedDocsConfig,
} from "../types.js";

const DEFAULT_BRAND = "#315efb";
const ROOT_KEYS = new Set([
  "site",
  "content",
  "navigation",
  "theme",
  "markdown",
  "search",
  "components",
  "build",
]);

const OBJECT_KEYS: Record<string, Set<string>> = {
  site: new Set(["title", "version", "description", "url", "repository"]),
  content: new Set(["sources", "allowOutsideRoot", "localizeRepositoryLinks"]),
  markdown: new Set([
    "stripLeadingBadges",
    "rawHtml",
    "strictLanguages",
    "executablePreviews",
    "remarkPlugins",
    "rehypePlugins",
  ]),
  search: new Set(["enabled"]),
  components: new Set(["overrides"]),
  theme: new Set([
    "variant",
    "brand",
    "palette",
    "states",
    "tokens",
    "presets",
    "styles",
    "contrastLevel",
  ]),
  build: new Set([
    "strict",
    "ci",
    "base",
    "cacheDir",
    "maxArtifactBytes",
    "maxUnpackedBytes",
    "maxFiles",
    "maxPathDepth",
    "maxAssetBytes",
  ]),
};

export class DocsConfigError extends Error {
  readonly diagnostics: DocsDiagnostic[];

  constructor(diagnostics: DocsDiagnostic[]) {
    super(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
    this.name = "DocsConfigError";
    this.diagnostics = diagnostics;
  }
}

export function validateConfig(config: DocsConfig): DocsDiagnostic[] {
  const diagnostics: DocsDiagnostic[] = [];
  for (const key of Object.keys(config)) {
    if (!ROOT_KEYS.has(key)) unknown(diagnostics, key);
  }
  for (const [section, keys] of Object.entries(OBJECT_KEYS)) {
    const value = config[section as keyof DocsConfig];
    if (
      value === undefined ||
      Array.isArray(value) ||
      typeof value !== "object"
    ) {
      continue;
    }
    for (const key of Object.keys(value)) {
      if (!keys.has(key)) unknown(diagnostics, `${section}.${key}`);
    }
  }

  const sources = config.content?.sources ?? [];
  for (const [index, source] of sources.entries()) {
    const variants = ["file", "glob", "package"].filter((key) => key in source);
    if (variants.length !== 1) {
      diagnostics.push({
        code: "DOCS_CONFIG_INVALID",
        severity: "error",
        message: `content.sources[${index}] must select exactly one of file, glob, or package.`,
      });
    }
  }

  const brand = config.theme?.brand;
  if (
    typeof brand === "object" &&
    brand !== null &&
    "contrast" in brand &&
    !brand.unsafeContrast
  ) {
    const target = brand.contrast?.apca;
    const normal = Array.isArray(target) ? target[0] : target;
    if (typeof normal === "number" && normal < 45) {
      diagnostics.push({
        code: "DOCS_CONFIG_INVALID",
        severity: "error",
        message:
          "theme.brand.contrast.apca cannot be below 45 without unsafeContrast.",
        hint: "Remove the override, use 45 or higher, or explicitly set unsafeContrast: true.",
      });
    }
  }

  for (const [name, entry] of Object.entries(config.theme?.styles ?? {})) {
    if (!isRecord(entry)) {
      invalid(
        diagnostics,
        `theme.styles.${name} must be a Tasty style object.`,
      );
      continue;
    }
    if (
      "mode" in entry &&
      entry.mode !== "extend" &&
      entry.mode !== "replace"
    ) {
      invalid(
        diagnostics,
        `theme.styles.${name}.mode must be "extend" or "replace".`,
      );
    }
    if ("mode" in entry && !isRecord(entry.styles)) {
      invalid(
        diagnostics,
        `theme.styles.${name}.styles must be a Tasty style object.`,
      );
    }
  }

  const componentOverrides = config.components?.overrides;
  if (componentOverrides !== undefined && !isRecord(componentOverrides)) {
    invalid(diagnostics, "components.overrides must be an object.");
  } else {
    for (const [name, override] of Object.entries(componentOverrides ?? {})) {
      if (typeof override === "string") continue;
      if (name === "Footer" && override === false) continue;
      invalid(
        diagnostics,
        `components.overrides.${name} must be an Astro component path${name === "Footer" ? " or false" : ""}.`,
      );
    }
  }
  return diagnostics;
}

function unknown(diagnostics: DocsDiagnostic[], path: string): void {
  diagnostics.push({
    code: "DOCS_CONFIG_UNKNOWN_KEY",
    severity: "error",
    message: `Unknown configuration key "${path}".`,
  });
}

function invalid(diagnostics: DocsDiagnostic[], message: string): void {
  diagnostics.push({
    code: "DOCS_CONFIG_INVALID",
    severity: "error",
    message,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeDocsConfig(
  config: DocsConfig = {},
): NormalizedDocsConfig {
  const diagnostics = validateConfig(config);
  if (diagnostics.length > 0) throw new DocsConfigError(diagnostics);
  const navigation = Array.isArray(config.navigation)
    ? { items: config.navigation }
    : (config.navigation ?? {});

  return {
    site: { ...config.site },
    content: {
      allowOutsideRoot: false,
      localizeRepositoryLinks: false,
      ...config.content,
    },
    navigation,
    theme: { ...config.theme, brand: config.theme?.brand ?? DEFAULT_BRAND },
    markdown: {
      stripLeadingBadges: true,
      rawHtml: "sanitize",
      strictLanguages: false,
      executablePreviews: true,
      ...config.markdown,
    },
    search: { enabled: true, ...config.search },
    components: { ...config.components },
    build: {
      strict: true,
      ci: process.env.CI === "true",
      base: "/",
      cacheDir: "",
      maxArtifactBytes: 25 * 1024 * 1024,
      maxUnpackedBytes: 100 * 1024 * 1024,
      maxFiles: 10_000,
      maxPathDepth: 24,
      maxAssetBytes: 20 * 1024 * 1024,
      ...config.build,
    },
  };
}

export function defineDocsConfig<const T extends DocsConfig>(config: T): T {
  const diagnostics = validateConfig(config);
  if (diagnostics.length > 0) throw new DocsConfigError(diagnostics);
  return config;
}

export type {
  BrandConfig,
  BuildConfig,
  ComponentStyleConfig,
  ComponentStyles,
  ComponentStylesConfig,
  CookbookComponentName,
  ComponentsConfig,
  ContentConfig,
  DocsConfig,
  DocsSource,
  MarkdownConfig,
  NavigationConfig,
  NavigationItem,
  NavigationTab,
  NormalizedDocsConfig,
  SearchConfig,
  SiteConfig,
  ThemeConfig,
  ThemePaletteConfig,
  ThemeTokens,
  ThemeTokenValue,
  TypographyPreset,
  TypographyPresets,
} from "../types.js";
