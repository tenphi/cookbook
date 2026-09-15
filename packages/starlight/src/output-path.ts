function normalizedBasePath(base: string): string {
  const path = base.replace(/^\/+|\/+$/g, "");
  return path ? `/${path}/` : "/";
}

export function outputPathForPublicAsset(
  publicPath: string,
  base: string,
): string {
  const normalizedPublicPath = `/${publicPath.replace(/^\/+/, "")}`;
  const prefix = normalizedBasePath(base);
  if (!normalizedPublicPath.startsWith(prefix)) {
    throw new Error(
      `Cookbook asset path ${publicPath} is outside the configured base ${base}.`,
    );
  }

  const outputPath = normalizedPublicPath.slice(prefix.length);
  if (
    !outputPath ||
    outputPath.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new Error(`Cookbook asset path ${publicPath} is not safe to emit.`);
  }
  return outputPath;
}
