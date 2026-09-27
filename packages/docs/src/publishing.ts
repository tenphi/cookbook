import type { DocsConfig, DocsEntry, SiteVersion } from "./types.js";

export type PublishingConfig = Pick<
  DocsConfig,
  "site" | "locales" | "defaultLocale"
> & {
  build?: DocsConfig["build"] & { base?: string };
};

export function routeUrl(route: string, base = "/", site?: string): string {
  const path = `${base.replace(/\/$/, "")}${route === "/" ? "/" : `${route}/`}`;
  return site ? new URL(path, site).href : path;
}

/** Version roots follow any locale prefix, e.g. /fr/v1/guide. */
export function routeVersion(
  route: string,
  config: Pick<DocsConfig, "site" | "locales">,
): SiteVersion | undefined {
  const first = route.split("/")[1];
  const path =
    first && first !== "root" && config.locales?.[first]
      ? route.slice(first.length + 1) || "/"
      : route;
  return [...(config.site?.versions ?? [])]
    .sort((a, b) => b.routeBase.length - a.routeBase.length)
    .find(
      (v) =>
        v.routeBase === "/" ||
        path === v.routeBase ||
        path.startsWith(`${v.routeBase}/`),
    );
}

export function pagePublishing(
  entry: Pick<DocsEntry, "route" | "frontmatter" | "title">,
  config: PublishingConfig,
) {
  const seo = config.site?.seo;
  const page = entry.frontmatter.seo;
  const version = routeVersion(entry.route, config);
  const index =
    !entry.frontmatter.draft &&
    seo?.index !== false &&
    version?.index !== false &&
    page?.index !== false;
  const url = routeUrl(entry.route, config.build?.base, config.site?.url);
  const canonical = page?.canonical ?? url;
  const siteTitle = config.site?.title ?? "Documentation";
  const title =
    page?.title ??
    (seo?.titleTemplate
      ? seo.titleTemplate
          .replaceAll("{title}", entry.title)
          .replaceAll("{site}", siteTitle)
      : entry.title === siteTitle
        ? entry.title
        : `${entry.title} | ${siteTitle}`);
  return {
    index,
    sitemap: index && canonical === url,
    canonical,
    title,
    version,
    image: page?.image ?? seo?.image,
  };
}

export function validateSeo(value: unknown, kind: "site" | "page"): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return ["seo must be an object."];
  const seo = value as Record<string, unknown>;
  const errors: string[] = [];
  const allowed =
    kind === "site"
      ? ["titleTemplate", "image", "index", "breadcrumbs", "copyPage"]
      : ["title", "canonical", "image", "index", "breadcrumbs"];
  for (const key of Object.keys(seo))
    if (!allowed.includes(key)) errors.push(`seo.${key} is not supported.`);
  for (const key of ["index", "copyPage"])
    if (seo[key] !== undefined && typeof seo[key] !== "boolean")
      errors.push(`seo.${key} must be a boolean.`);
  if (
    seo.title !== undefined &&
    (typeof seo.title !== "string" || !seo.title.trim())
  )
    errors.push("seo.title must be non-empty text.");
  if (
    seo.titleTemplate !== undefined &&
    (typeof seo.titleTemplate !== "string" ||
      !seo.titleTemplate.includes("{title}") ||
      /\{(?!title\}|site\})[^}]*\}/.test(seo.titleTemplate))
  )
    errors.push(
      "seo.titleTemplate must include {title} and may include {site}; other placeholders are not supported.",
    );
  if (seo.canonical !== undefined && !absoluteUrl(seo.canonical))
    errors.push(
      "seo.canonical must be an absolute HTTP(S) URL without credentials or a fragment.",
    );
  if (seo.image !== undefined && seo.image !== false) {
    const image = seo.image;
    if (!image || typeof image !== "object" || Array.isArray(image))
      errors.push("seo.image must be false or {src, alt, width?, height?}.");
    else {
      const img = image as Record<string, unknown>;
      for (const key of Object.keys(img))
        if (!["src", "alt", "width", "height"].includes(key))
          errors.push(`seo.image.${key} is not supported.`);
      if (
        !absoluteUrl(img.src) &&
        !(
          typeof img.src === "string" &&
          /^\/(?!\/)[^\\\s?#]+$/.test(img.src) &&
          !img.src.split("/").some((x) => x === ".." || x === ".")
        )
      )
        errors.push(
          "seo.image.src must be an HTTP(S) URL or root-relative public asset path.",
        );
      if (typeof img.alt !== "string" || !img.alt.trim())
        errors.push("seo.image.alt must be non-empty text.");
      for (const key of ["width", "height"])
        if (
          img[key] !== undefined &&
          (!Number.isInteger(img[key]) || Number(img[key]) <= 0)
        )
          errors.push(`seo.image.${key} must be a positive integer.`);
      if ((img.width === undefined) !== (img.height === undefined))
        errors.push(
          "seo.image requires both width and height when dimensions are provided.",
        );
    }
  }
  if (seo.breadcrumbs !== undefined) {
    if (kind === "site") {
      if (typeof seo.breadcrumbs !== "boolean")
        errors.push("seo.breadcrumbs must be a boolean.");
    } else if (seo.breadcrumbs !== false) {
      if (!Array.isArray(seo.breadcrumbs) || seo.breadcrumbs.length < 2)
        errors.push(
          "seo.breadcrumbs must be false or at least two {name, url} items.",
        );
      else
        for (const item of seo.breadcrumbs) {
          if (
            !item ||
            typeof item !== "object" ||
            Object.keys(item).some((k) => k !== "name" && k !== "url") ||
            typeof item.name !== "string" ||
            !item.name.trim() ||
            !absoluteUrl(item.url)
          )
            errors.push(
              "Each seo.breadcrumbs item needs a name and absolute HTTP(S) url.",
            );
        }
    }
  }
  return errors;
}
function absoluteUrl(value: unknown): boolean {
  if (typeof value !== "string" || /[\s\\]/.test(value)) return false;
  try {
    const u = new URL(value);
    return (
      /^https?:$/.test(u.protocol) && !u.hash && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
