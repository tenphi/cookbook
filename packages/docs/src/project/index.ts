import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createJiti } from "jiti";
import { normalizeDocsConfig } from "../config/index.js";
import type { DocsConfig } from "../types.js";

export interface DocsProjectOptions {
  /** Directory to search for configuration; defaults to the current directory. */
  root?: string;
  /** Explicit configuration path, relative to root. False disables discovery. */
  configFile?: string | false;
  /** Inline configuration takes precedence over discovery. */
  config?: DocsConfig;
}

export interface DocsProject {
  root: string;
  config: DocsConfig;
  configFile?: string;
}

/** Resolve the same configuration and content root for the CLI and renderer. */
export async function resolveDocsProject(
  options: DocsProjectOptions = {},
): Promise<DocsProject> {
  const directory = resolve(options.root ?? process.cwd());
  let config = options.config;
  let configFile: string | undefined;
  if (config === undefined && options.configFile !== false) {
    configFile = options.configFile
      ? resolve(directory, options.configFile)
      : [
          "docs.config.ts",
          "docs.config.mts",
          "docs.config.js",
          "docs.config.mjs",
        ]
          .map((name) => resolve(directory, name))
          .find(existsSync);
    if (configFile) {
      if (!existsSync(configFile)) {
        throw new Error(
          `Documentation configuration does not exist: ${configFile}.`,
        );
      }
      const jiti = createJiti(import.meta.url, {
        interopDefault: true,
        moduleCache: false,
      });
      // Native ESM imports remain cached even with moduleCache disabled.
      // Transpile the entry so configuration restarts see edits in every format.
      const loaded = (await jiti.evalModule(
        await readFile(configFile, "utf8"),
        {
          filename: configFile,
          async: true,
          forceTranspile: true,
        },
      )) as { default?: DocsConfig };
      config = loaded.default ?? (loaded as DocsConfig);
    }
  }
  config ??= {};
  normalizeDocsConfig(config);
  return {
    root: resolve(
      configFile ? dirname(configFile) : directory,
      config.root ?? ".",
    ),
    config,
    ...(configFile ? { configFile } : {}),
  };
}
