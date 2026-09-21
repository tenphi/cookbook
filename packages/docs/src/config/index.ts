import { glaze } from "@tenphi/glaze";
import { mergeStyles, type Styles } from "@tenphi/tasty/core";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "../types.js";
import type {
  DocsConfig,
  DocsDiagnostic,
  NormalizedDocsConfig,
} from "../types.js";

const DEFAULT_BRAND = "okhsl(266 68% 48%)";
const HEAD_KEYS = new Set(["tag", "attrs", "content"]);
const SITE_ICON_KEYS = new Set(["source", "background"]);
const ROOT_KEYS = new Set([
  "root",
  "redirects",
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
    "headerLinks",
  ]),
  content: new Set([
    "sources",
    "allowOutsideRoot",
    "localizeRepositoryLinks",
    "frontmatter",
  ]),
  markdown: new Set(["stripLeadingBadges", "rawHtml"]),
  search: new Set(["enabled"]),
  components: new Set(["overrides"]),
  theme: new Set([
    "brand",
    "palette",
    "states",
    "tokens",
    "presets",
    "styles",
    "customStyles",
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
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    invalid(diagnostics, "Documentation configuration must be an object.");
    return diagnostics;
  }
  if (config.root !== undefined && typeof config.root !== "string") {
    invalid(diagnostics, "root must be a directory path.");
  }
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

  if (isRecord(config.site) && config.site.headerLinks !== undefined) {
    if (!Array.isArray(config.site.headerLinks)) {
      invalid(diagnostics, "site.headerLinks must be an array.");
    } else {
      config.site.headerLinks.forEach((item, index) => {
        const path = `site.headerLinks[${index}]`;
        if (!isRecord(item)) {
          invalid(diagnostics, `${path} must be an object.`);
          return;
        }
        for (const key of Object.keys(item)) {
          if (!["label", "link", "variant", "newTab"].includes(key))
            unknown(diagnostics, `${path}.${key}`);
        }
        if (typeof item.label !== "string" || !item.label.trim())
          invalid(diagnostics, `${path}.label must be a non-empty string.`);
        if (
          typeof item.link !== "string" ||
          /[\\\s]/.test(item.link) ||
          !(/^(?:\/(?!\/)|#)/.test(item.link) || isHttpUrl(item.link))
        )
          invalid(
            diagnostics,
            `${path}.link must be an HTTP(S) URL, root-relative route, or fragment.`,
          );
        if (
          item.variant !== undefined &&
          !["default", "primary"].includes(item.variant as string)
        )
          invalid(
            diagnostics,
            `${path}.variant must be "default" or "primary".`,
          );
        if (item.newTab !== undefined && typeof item.newTab !== "boolean")
          invalid(diagnostics, `${path}.newTab must be a boolean.`);
      });
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
  if (Array.isArray(config.navigation)) {
    validateNavigationItems(config.navigation, "navigation", diagnostics);
  } else if (isRecord(config.navigation)) {
    if (Array.isArray(config.navigation.items)) {
      validateNavigationItems(
        config.navigation.items,
        "navigation.items",
        diagnostics,
      );
    }
    if (Array.isArray(config.navigation.tabs)) {
      for (const [index, tab] of config.navigation.tabs.entries()) {
        const path = `navigation.tabs[${index}]`;
        if (
          !isRecord(tab) ||
          typeof tab.label !== "string" ||
          typeof tab.link !== "string"
        ) {
          invalid(diagnostics, `${path} must have a label and link.`);
        } else if (tab.items !== undefined) {
          validateNavigationItems(tab.items, `${path}.items`, diagnostics);
        }
      }
    }
  }

  if (
    config.redirects !== undefined &&
    (!isRecord(config.redirects) ||
      Object.values(config.redirects).some(
        (value) => typeof value !== "string",
      ))
  )
    invalid(diagnostics, "redirects must map old routes to document routes.");
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
  if (
    config.content?.localizeRepositoryLinks !== undefined &&
    typeof config.content.localizeRepositoryLinks !== "boolean"
  ) {
    invalid(diagnostics, "content.localizeRepositoryLinks must be a boolean.");
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
      file: new Set([
        "id",
        "root",
        "routeBase",
        "file",
        "route",
        "title",
        "description",
        "navigation",
      ]),
      glob: new Set([
        "id",
        "root",
        "glob",
        "base",
        "routeBase",
        "exclude",
        "navigation",
      ]),
      package: new Set([
        "id",
        "package",
        "registry",
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
    for (const field of [
      "id",
      "root",
      "route",
      "routeBase",
      "base",
      "index",
      "title",
      "description",
      "registry",
    ]) {
      if (
        sourceRecord[field] !== undefined &&
        typeof sourceRecord[field] !== "string"
      )
        invalid(
          diagnostics,
          `content.sources[${index}].${field} must be a string.`,
        );
    }
    if (
      typeof sourceRecord.id === "string" &&
      !/^[a-zA-Z0-9_-]+$/.test(sourceRecord.id)
    )
      invalid(
        diagnostics,
        `content.sources[${index}].id must contain only letters, numbers, underscores, and hyphens.`,
      );
    if (
      sourceRecord.trust !== undefined &&
      !["markdown", "mdx"].includes(String(sourceRecord.trust))
    )
      invalid(
        diagnostics,
        `content.sources[${index}].trust must be "markdown" or "mdx".`,
      );
    if (
      typeof sourceRecord.registry === "string" &&
      !isHttpUrl(sourceRecord.registry)
    )
      invalid(
        diagnostics,
        `content.sources[${index}].registry must be an absolute HTTP(S) URL.`,
      );
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
    config.markdown?.rawHtml !== undefined &&
    !["allow", "sanitize", "strip", "reject"].includes(config.markdown.rawHtml)
  ) {
    invalid(
      diagnostics,
      'markdown.rawHtml must be "allow", "sanitize", "strip", or "reject".',
    );
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

  if (
    config.content?.frontmatter !== undefined &&
    !["preserve", "reject"].includes(config.content.frontmatter)
  )
    invalid(diagnostics, 'content.frontmatter must be "preserve" or "reject".');
  for (const field of [
    "styles",
    "customStyles",
    "palette",
    "tokens",
    "states",
    "presets",
  ] as const) {
    if (config.theme?.[field] !== undefined && !isRecord(config.theme[field]))
      invalid(diagnostics, `theme.${field} must be an object.`);
  }
  for (const [name, entry] of Object.entries(config.theme?.styles ?? {})) {
    if (!(COOKBOOK_COMPONENT_NAMES as readonly string[]).includes(name)) {
      unknown(
        diagnostics,
        `theme.styles.${name}; register custom components under theme.customStyles`,
      );
      continue;
    }
    if (!isRecord(entry))
      invalid(
        diagnostics,
        `theme.styles.${name} must be a Tasty style object.`,
      );
    else {
      if ("mode" in entry)
        invalid(
          diagnostics,
          `theme.styles.${name} must contain only Tasty properties, without a mode wrapper.`,
        );
      const elements: readonly string[] =
        COOKBOOK_COMPONENT_SUB_ELEMENTS[
          name as keyof typeof COOKBOOK_COMPONENT_SUB_ELEMENTS
        ];
      for (const key of Object.keys(entry)) {
        if (/^[A-Z]/.test(key) && !elements.includes(key))
          unknown(diagnostics, `theme.styles.${name}.${key}`);
      }
    }
  }
  for (const [name, entry] of Object.entries(
    config.theme?.customStyles ?? {},
  )) {
    if ((COOKBOOK_COMPONENT_NAMES as readonly string[]).includes(name))
      invalid(
        diagnostics,
        `Use theme.styles.${name} for a built-in component.`,
      );
    if (
      !/^[A-Za-z][A-Za-z0-9_-]*$/.test(name) ||
      !isRecord(entry) ||
      "mode" in entry
    )
      invalid(
        diagnostics,
        `theme.customStyles.${name} must be a named partial Tasty style object.`,
      );
  }
  for (const [name, value] of Object.entries(config.theme?.palette ?? {})) {
    if (
      ![
        "surface",
        "header",
        "text",
        "textSoft",
        "info",
        "success",
        "warning",
        "danger",
      ].includes(name)
    )
      unknown(diagnostics, `theme.palette.${name}`);
    try {
      glaze.color({ from: value }).resolve();
    } catch (error) {
      invalid(
        diagnostics,
        `theme.palette.${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (brand !== undefined) {
    try {
      glaze
        .color({
          from:
            typeof brand === "object" && brand !== null && "from" in brand
              ? brand.from
              : brand,
        })
        .resolve();
    } catch (error) {
      invalid(
        diagnostics,
        `theme.brand: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  const contrast = config.theme?.contrastLevel;
  if (
    contrast !== undefined &&
    contrast !== "auto" &&
    (typeof contrast !== "number" ||
      !Number.isFinite(contrast) ||
      contrast < 0 ||
      contrast > 100)
  )
    invalid(
      diagnostics,
      'theme.contrastLevel must be "auto" or a number from 0 to 100.',
    );

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

function validateNavigationItems(
  items: unknown,
  path: string,
  diagnostics: DocsDiagnostic[],
): void {
  if (!Array.isArray(items)) {
    invalid(diagnostics, `${path} must be an array.`);
    return;
  }
  for (const [index, item] of items.entries()) {
    const itemPath = `${path}[${index}]`;
    if (typeof item === "string") continue;
    if (!isRecord(item) || typeof item.label !== "string") {
      invalid(
        diagnostics,
        `${itemPath} must be a route or a labeled navigation item.`,
      );
      continue;
    }
    const group = "items" in item || "autogenerate" in item;
    if (
      group &&
      item.link !== undefined &&
      (typeof item.link !== "string" ||
        !/^\/(?!\/)[^?#\\\s]*$/.test(item.link) ||
        item.link.includes("//") ||
        item.link
          .split("/")
          .some((segment) => segment === "." || segment === ".."))
    ) {
      invalid(
        diagnostics,
        `${itemPath}.link must be a root-relative page route without a query or fragment.`,
      );
    }
    if ("items" in item) {
      validateNavigationItems(item.items, `${itemPath}.items`, diagnostics);
    } else if ("autogenerate" in item) {
      if (
        !isRecord(item.autogenerate) ||
        typeof item.autogenerate.directory !== "string"
      ) {
        invalid(
          diagnostics,
          `${itemPath}.autogenerate.directory must be a directory path.`,
        );
      }
    } else if (typeof item.link !== "string") {
      invalid(diagnostics, `${itemPath}.link must be a URL or route.`);
    }
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
    redirects: { ...config.redirects },
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

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  const diagnostics = validateConfig(config);
  if (diagnostics.length > 0) throw new DocsConfigError(diagnostics);
  return config;
}

/** Compose presets. Objects merge, arrays replace, and styles use Tasty semantics. */
export function mergeDocsConfig(...configs: DocsConfig[]): DocsConfig {
  const merge = (
    base: Record<string, unknown>,
    next: Record<string, unknown>,
  ) => {
    const result = { ...base };
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) continue;
      result[key] = isRecord(value)
        ? merge(isRecord(result[key]) ? result[key] : {}, value)
        : Array.isArray(value)
          ? [...value]
          : value;
    }
    return result;
  };
  return defineDocsConfig(
    configs.reduce<DocsConfig>((base, next) => {
      const diagnostics = validateConfig(next);
      if (diagnostics.length) throw new DocsConfigError(diagnostics);
      const result = merge(
        base as Record<string, unknown>,
        next as Record<string, unknown>,
      ) as DocsConfig;
      for (const field of ["styles", "customStyles"] as const) {
        if (!next.theme?.[field]) continue;
        const styles = { ...base.theme?.[field] } as Record<string, Styles>;
        for (const [name, configured] of Object.entries(next.theme[field])) {
          styles[name] = mergeStyles(styles[name] ?? {}, configured);
        }
        result.theme![field] = styles;
      }
      return result;
    }, {}),
  );
}

export { COOKBOOK_COMPONENT_NAMES, COOKBOOK_COMPONENT_SUB_ELEMENTS };

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
  HeaderLink,
  SiteIconConfig,
  ThemeConfig,
  ThemePaletteConfig,
  ThemeTokens,
  ThemeTokenValue,
  TypographyPreset,
  TypographyPresets,
} from "../types.js";
