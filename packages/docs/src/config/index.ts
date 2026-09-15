import type {
  DocsConfig,
  DocsDiagnostic,
  NormalizedDocsConfig,
} from "../types.js";

const DEFAULT_BRAND = "#315efb";
const HEAD_KEYS = new Set(["tag", "attrs", "content"]);
const SITE_ICON_KEYS = new Set(["source", "background"]);
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
  site: new Set([
    "title",
    "version",
    "description",
    "url",
    "repository",
    "favicon",
  ]),
  content: new Set(["sources", "allowOutsideRoot"]),
  markdown: new Set(["stripLeadingBadges"]),
  search: new Set(["enabled"]),
  components: new Set(["overrides"]),
  theme: new Set([
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
    if (value === undefined) continue;
    if (!isRecord(value)) {
      invalid(diagnostics, `${section} must be an object.`);
      continue;
    }
    for (const key of Object.keys(value)) {
      if (!keys.has(key)) unknown(diagnostics, `${section}.${key}`);
    }
  }

  if (config.navigation !== undefined && !Array.isArray(config.navigation)) {
    if (!isRecord(config.navigation)) {
      invalid(diagnostics, "navigation must be an array or object.");
    } else {
      for (const key of Object.keys(config.navigation)) {
        if (!new Set(["items", "tabs"]).has(key)) {
          unknown(diagnostics, `navigation.${key}`);
        }
      }
      if (
        config.navigation.items !== undefined &&
        !Array.isArray(config.navigation.items)
      ) {
        invalid(diagnostics, "navigation.items must be an array.");
      }
      if (
        config.navigation.tabs !== undefined &&
        !Array.isArray(config.navigation.tabs)
      ) {
        invalid(diagnostics, "navigation.tabs must be an array.");
      }
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

  const favicon = config.site?.favicon;
  if (favicon !== undefined) {
    if (typeof favicon === "string") {
      if (favicon.trim() === "") {
        invalid(diagnostics, "site.favicon must be a non-empty local path.");
      }
    } else if (!isRecord(favicon)) {
      invalid(
        diagnostics,
        "site.favicon must be a local path or an object with a source path.",
      );
    } else {
      for (const key of Object.keys(favicon)) {
        if (!SITE_ICON_KEYS.has(key)) {
          unknown(diagnostics, `site.favicon.${key}`);
        }
      }
      if (typeof favicon.source !== "string" || favicon.source.trim() === "") {
        invalid(diagnostics, "site.favicon.source must be a non-empty string.");
      }
      if (
        favicon.background !== undefined &&
        (typeof favicon.background !== "string" ||
          favicon.background.trim() === "")
      ) {
        invalid(
          diagnostics,
          "site.favicon.background must be a non-empty color string.",
        );
      }
    }
  }
  for (const field of ["url", "repository"] as const) {
    const value = config.site?.[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || !isHttpUrl(value)) {
      invalid(diagnostics, `site.${field} must be an absolute HTTP(S) URL.`);
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

  if (
    config.content?.allowOutsideRoot !== undefined &&
    typeof config.content.allowOutsideRoot !== "boolean"
  ) {
    invalid(diagnostics, "content.allowOutsideRoot must be a boolean.");
  }
  const configuredSources = config.content?.sources;
  if (configuredSources !== undefined && !Array.isArray(configuredSources)) {
    invalid(diagnostics, "content.sources must be an array.");
  }
  const sources = Array.isArray(configuredSources) ? configuredSources : [];
  for (const [index, source] of sources.entries()) {
    if (!isRecord(source)) {
      invalid(diagnostics, `content.sources[${index}] must be an object.`);
      continue;
    }
    const sourceRecord = source as unknown as Record<string, unknown>;
    const variants = ["file", "glob", "package"].filter((key) => key in source);
    if (variants.length !== 1) {
      diagnostics.push({
        code: "DOCS_CONFIG_INVALID",
        severity: "error",
        message: `content.sources[${index}] must select exactly one of file, glob, or package.`,
      });
      continue;
    }
    const variant = variants[0] as "file" | "glob" | "package";
    const allowed = {
      file: new Set(["file", "route", "title", "description", "navigation"]),
      glob: new Set(["glob", "base", "routeBase", "exclude", "navigation"]),
      package: new Set([
        "package",
        "include",
        "exclude",
        "index",
        "routeBase",
        "trust",
      ]),
    }[variant];
    for (const key of Object.keys(source)) {
      if (!allowed.has(key))
        unknown(diagnostics, `content.sources[${index}].${key}`);
    }
    const selector = sourceRecord[variant];
    if (
      variant === "glob"
        ? typeof selector !== "string" &&
          (!Array.isArray(selector) ||
            selector.some((value) => typeof value !== "string"))
        : typeof selector !== "string" || selector.trim() === ""
    ) {
      invalid(
        diagnostics,
        `content.sources[${index}].${variant} must be ${variant === "glob" ? "a string or string array" : "a non-empty string"}.`,
      );
    }
    for (const list of ["include", "exclude"] as const) {
      const value = sourceRecord[list];
      if (
        value !== undefined &&
        (!Array.isArray(value) ||
          value.some((entry) => typeof entry !== "string"))
      ) {
        invalid(
          diagnostics,
          `content.sources[${index}].${list} must be a string array.`,
        );
      }
    }
  }

  if (
    config.markdown?.stripLeadingBadges !== undefined &&
    typeof config.markdown.stripLeadingBadges !== "boolean"
  ) {
    invalid(diagnostics, "markdown.stripLeadingBadges must be a boolean.");
  }
  if (
    config.search?.enabled !== undefined &&
    typeof config.search.enabled !== "boolean"
  ) {
    invalid(diagnostics, "search.enabled must be a boolean.");
  }
  for (const key of ["strict", "ci"] as const) {
    const value = config.build?.[key];
    if (value !== undefined && typeof value !== "boolean") {
      invalid(diagnostics, `build.${key} must be a boolean.`);
    }
  }
  for (const key of [
    "maxArtifactBytes",
    "maxUnpackedBytes",
    "maxFiles",
    "maxPathDepth",
    "maxAssetBytes",
  ] as const) {
    const value = config.build?.[key];
    if (value !== undefined && (!Number.isSafeInteger(value) || value <= 0)) {
      invalid(diagnostics, `build.${key} must be a positive integer.`);
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

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
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
      ...config.content,
    },
    navigation,
    theme: { ...config.theme, brand: config.theme?.brand ?? DEFAULT_BRAND },
    markdown: {
      stripLeadingBadges: true,
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
  NavigationPlacement,
  NavigationTab,
  NormalizedDocsConfig,
  SearchConfig,
  SiteConfig,
  SiteIconConfig,
  ThemeConfig,
  ThemePaletteConfig,
  ThemeTokens,
  ThemeTokenValue,
  TypographyPreset,
  TypographyPresets,
} from "../types.js";
