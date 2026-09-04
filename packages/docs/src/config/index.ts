import type {
  DocsConfig,
  DocsDiagnostic,
  NormalizedDocsConfig,
} from "../types.js";

const DEFAULT_BRAND = "#315efb";
const HEAD_KEYS = new Set(["tag", "attrs", "content"]);
const ROOT_KEYS = new Set([
  "site",
  "head",
  "editLink",
  "lastUpdated",
  "locales",
  "defaultLocale",
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

  const head = config.head;
  if (head !== undefined && !Array.isArray(head)) {
    invalid(diagnostics, "head must be an array.");
  } else {
    for (const [index, entry] of (head ?? []).entries()) {
      if (!isRecord(entry)) {
        invalid(diagnostics, `head[${index}] must be an object.`);
        continue;
      }
      for (const key of Object.keys(entry)) {
        if (!HEAD_KEYS.has(key)) {
          unknown(diagnostics, `head[${index}].${key}`);
        }
      }
      if (typeof entry.tag !== "string") {
        invalid(diagnostics, `head[${index}].tag must be a string.`);
      }
      if (entry.attrs !== undefined && !isRecord(entry.attrs)) {
        invalid(diagnostics, `head[${index}].attrs must be an object.`);
      } else {
        for (const [name, value] of Object.entries(entry.attrs ?? {})) {
          if (
            value !== undefined &&
            typeof value !== "string" &&
            typeof value !== "boolean"
          ) {
            invalid(
              diagnostics,
              `head[${index}].attrs.${name} must be a string or boolean.`,
            );
          }
        }
      }
      if (entry.content !== undefined && typeof entry.content !== "string") {
        invalid(diagnostics, `head[${index}].content must be a string.`);
      }
    }
  }

  if (
    config.editLink !== undefined &&
    (!isRecord(config.editLink) || typeof config.editLink.baseUrl !== "string")
  ) {
    invalid(diagnostics, "editLink must contain a string baseUrl.");
  } else if (config.editLink !== undefined) {
    for (const key of Object.keys(config.editLink)) {
      if (key !== "baseUrl") unknown(diagnostics, `editLink.${key}`);
    }
    try {
      new URL(config.editLink.baseUrl);
    } catch {
      invalid(diagnostics, "editLink.baseUrl must be an absolute URL.");
    }
  }
  if (
    config.lastUpdated !== undefined &&
    typeof config.lastUpdated !== "boolean"
  ) {
    invalid(diagnostics, "lastUpdated must be a boolean.");
  }
  if (config.locales !== undefined && !isRecord(config.locales)) {
    invalid(diagnostics, "locales must be an object.");
  } else {
    for (const [key, locale] of Object.entries(config.locales ?? {})) {
      if (!isRecord(locale) || typeof locale.label !== "string") {
        invalid(diagnostics, `locales.${key} must contain a string label.`);
        continue;
      }
      for (const property of Object.keys(locale)) {
        if (!["label", "lang", "dir"].includes(property)) {
          unknown(diagnostics, `locales.${key}.${property}`);
        }
      }
      if (locale.lang !== undefined && typeof locale.lang !== "string") {
        invalid(diagnostics, `locales.${key}.lang must be a string.`);
      }
      if (
        locale.dir !== undefined &&
        locale.dir !== "ltr" &&
        locale.dir !== "rtl"
      ) {
        invalid(diagnostics, `locales.${key}.dir must be "ltr" or "rtl".`);
      }
    }
  }
  if (
    config.defaultLocale !== undefined &&
    typeof config.defaultLocale !== "string"
  ) {
    invalid(diagnostics, "defaultLocale must be a string.");
  } else if (
    config.defaultLocale !== undefined &&
    (config.locales === undefined || !(config.defaultLocale in config.locales))
  ) {
    invalid(
      diagnostics,
      `defaultLocale must match a key in locales; received "${config.defaultLocale}".`,
    );
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
    } else if ("mode" in entry) {
      invalid(
        diagnostics,
        `theme.styles.${name} must contain only the Tasty style properties to override, without a mode wrapper.`,
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
    head: [...(config.head ?? [])],
    ...(config.editLink ? { editLink: { ...config.editLink } } : {}),
    lastUpdated: config.lastUpdated ?? false,
    ...(config.locales ? { locales: { ...config.locales } } : {}),
    ...(config.defaultLocale ? { defaultLocale: config.defaultLocale } : {}),
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
  EditLinkConfig,
  HeadConfig,
  LocaleConfig,
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
