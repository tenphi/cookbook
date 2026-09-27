export {
  defineDocsConfig,
  mergeDocsConfig,
  normalizeDocsConfig,
  validateConfig,
  DocsConfigError,
} from "./config/index.js";
export { resolveDocsProject } from "./project/index.js";
export type { DocsProject, DocsProjectOptions } from "./project/index.js";
export { createDocsLoader } from "./content/index.js";
export {
  createDocsGraph,
  DOCS_FRONTMATTER_KEYS,
  normalizeRoute,
  routeForPath,
} from "./graph/index.js";
export {
  assertSafePackagePath,
  defaultLock,
  discoverPackage,
  lockForSource,
  materializePackage,
  packageNameFromSpecifier,
  readDocsLock,
  reconcileDocsLock,
  resolvePackageLock,
  validateLock,
  writeDocsLock,
} from "./npm/index.js";
export {
  assertValidDocs,
  DocsValidationError,
  formatDiagnostics,
  validateDocs,
} from "./validation/index.js";
export {
  COOKBOOK_PALETTE_NAMES,
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
} from "./types.js";
export type * from "./types.js";

export { resolveColorTheme } from "./theme/palette.js";

export { pagePublishing, routeUrl, routeVersion } from "./publishing.js";

export { renderAgentMarkdown } from "./agent-markdown.js";

export { validateProjectAssets } from "./validation/assets.js";
export { validateBuiltDocs } from "./validation/build.js";
export type { BuiltDocsOptions, BuiltDocsReport } from "./validation/build.js";
