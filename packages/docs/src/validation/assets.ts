import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { isAbsolute, resolve } from "node:path";
import type { DocsProject } from "../project/index.js";
import type { DocsDiagnostic, DocsGraph } from "../types.js";

/** Local preflight only: no remote font requests or MDX/component compilation. */
export async function validateProjectAssets(
  project: DocsProject,
  graph: DocsGraph,
  publicDirectory = resolve(project.root, "public"),
): Promise<DocsDiagnostic[]> {
  const diagnostics: DocsDiagnostic[] = [];
  const check = async (path: string, label: string) => {
    try {
      if (!(await stat(path)).isFile()) throw Error("not a file");
    } catch {
      diagnostics.push({
        code: "DOCS_CONFIG_ASSET_MISSING",
        severity: "error",
        file: path,
        message: `${label} references a missing local file.`,
        hint: "Correct the configured path or add the file before building.",
      });
    }
  };
  const publicFile = async (src: string, label: string) => {
    if (!src.startsWith("/") || src.startsWith("//")) return;
    await check(
      resolve(publicDirectory, `.${decodeURIComponent(src.split(/[?#]/)[0]!)}`),
      label,
    );
  };
  for (const [role, font] of Object.entries(project.config.theme?.fonts ?? {}))
    if (font && typeof font === "object" && "files" in font)
      for (const file of font.files)
        await publicFile(file.src, `theme.fonts.${role}`);
  const { logo, favicon, seo } = project.config.site ?? {};
  if (logo) {
    const images = typeof logo === "string" ? { src: logo } : logo;
    for (const key of ["src", "light", "dark"] as const)
      if (images[key])
        await check(resolve(project.root, images[key]), `site.logo.${key}`);
  }
  if (favicon)
    await check(
      resolve(
        project.root,
        typeof favicon === "string" ? favicon : favicon.source,
      ),
      "site.favicon",
    );
  if (seo?.image) await publicFile(seo.image.src, "site.seo.image");
  for (const entry of graph.entries) {
    if (entry.frontmatter.seo?.image)
      await publicFile(
        entry.frontmatter.seo.image.src,
        `${entry.sourcePath}: seo.image`,
      );
    const hero = entry.frontmatter.hero?.image;
    if (hero && !("html" in hero)) {
      for (const src of "file" in hero ? [hero.file] : [hero.light, hero.dark])
        if (
          !entry.assets.some(
            (asset) => asset.resolved === src || asset.publicPath === src,
          )
        )
          await publicFile(src, `${entry.sourcePath}: hero.image`);
    }
  }
  const require = createRequire(resolve(project.root, "package.json"));
  for (const [name, component] of Object.entries(
    project.config.components?.overrides ?? {},
  )) {
    if (typeof component !== "string") continue;
    if (
      isAbsolute(component) ||
      component.startsWith(".") ||
      component.startsWith("src/")
    )
      await check(
        resolve(project.root, component),
        `components.overrides.${name}`,
      );
    else {
      try {
        require.resolve(component);
      } catch {
        diagnostics.push({
          code: "DOCS_COMPONENT_UNRESOLVED",
          severity: "error",
          message: `components.overrides.${name} cannot resolve ${component}.`,
          hint: "Install the component package or use a path relative to the project root.",
        });
      }
    }
  }
  return diagnostics;
}
