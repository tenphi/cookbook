import { createRequire } from "node:module";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, URL } from "node:url";
import {
  parseMarkdown,
  serializeMarkdown,
} from "../packages/docs/dist/markdown/index.js";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const facadeRoot = join(repositoryRoot, "packages/facade");

/** Build local reference docs from the same dependencies as the renderer. */
export async function packDocs(output = join(facadeRoot, "docs")) {
  const rendererRequire = createRequire(
    join(repositoryRoot, "packages/starlight/package.json"),
  );
  const upstream = [];
  for (const name of ["tasty", "glaze"]) {
    const packageName = `@tenphi/${name}`;
    const root = await packageRoot(
      rendererRequire.resolve(packageName),
      packageName,
    );
    const manifest = JSON.parse(
      await readFile(join(root, "package.json"), "utf8"),
    );
    upstream.push({
      root,
      name: packageName,
      version: manifest.version,
      license: manifest.license,
      repository: `https://github.com/tenphi/${name}`,
      ref: manifest.gitHead || `v${manifest.version}`,
      directory: `upstream/${name}`,
    });
  }

  await rm(output, { recursive: true, force: true });
  await cp(join(repositoryRoot, "docs"), output, { recursive: true });
  for (const source of upstream) {
    const destination = join(output, source.directory);
    await mkdir(destination, { recursive: true });
    for (const entry of ["README.md", "LICENSE", "docs"]) {
      await cp(join(source.root, entry), join(destination, entry), {
        recursive: true,
      });
    }
  }
  await writeFile(
    join(output, "upstream/manifest.json"),
    `${JSON.stringify(
      upstream.map(
        ({ name, version, license, repository, ref, directory }) => ({
          name,
          version,
          license,
          repository,
          ref,
          directory,
        }),
      ),
      null,
      2,
    )}\n`,
  );

  const files = new Set(await listFiles(output));
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = upstream.find((entry) =>
      file.startsWith(`${entry.directory}/`),
    );
    const path = join(output, file);
    const markdown = await readFile(path, "utf8");
    const rewritten = rewriteDocumentation(
      markdown,
      (url, image) => {
        const local = localReference(url, files);
        if (local) return relativeUrl(file, local);
        if (!source || !isLocalUrl(url)) return url;
        const { pathname, suffix } = splitUrl(url);
        const target = normalizePath(
          join(dirname(file), decodeURIComponent(pathname)),
        );
        if (files.has(target)) return url;
        const upstreamPath = normalizePath(relative(source.directory, target));
        if (upstreamPath.startsWith("../") || isAbsolute(upstreamPath)) {
          throw new Error(`Upstream link escapes its package: ${file}: ${url}`);
        }
        // Source files and artwork omitted from npm remain available at the release ref.
        const encoded = upstreamPath
          .split("/")
          .map(encodeURIComponent)
          .join("/");
        return image
          ? `https://raw.githubusercontent.com/tenphi/${source.name.split("/")[1]}/${source.ref}/${encoded}${suffix}`
          : `${source.repository}/blob/${source.ref}/${encoded}${suffix}`;
      },
      file.endsWith(".mdx"),
    );
    await writeFile(path, rewritten);
  }
  await validateDocumentation(output);
}

/** Rewrite actual Markdown/HTML destinations without touching code examples. */
export function rewriteDocumentation(markdown, rewrite, mdx = false) {
  const frontmatter =
    markdown.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0] ?? "";
  const body = markdown.slice(frontmatter.length);
  const { ast } = parseMarkdown(body, { mdx });
  const imageReferences = new Set();
  walk(ast, (node) => {
    if (node.type === "imageReference") imageReferences.add(node.identifier);
  });
  let changed = false;
  walk(ast, (node) => {
    if (["link", "image", "definition"].includes(node.type)) {
      const url = rewrite(
        node.url,
        node.type === "image" || imageReferences.has(node.identifier),
      );
      changed ||= url !== node.url;
      node.url = url;
    } else if (node.type === "html") {
      node.value = node.value.replace(
        /\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi,
        (match, attribute, double, single, unquoted) => {
          const url = double ?? single ?? unquoted;
          const next = rewrite(url, attribute.toLowerCase() === "src");
          changed ||= next !== url;
          return next === url ? match : `${attribute}="${next}"`;
        },
      );
    } else if (["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type)) {
      for (const attribute of node.attributes) {
        if (
          ["href", "src"].includes(attribute.name) &&
          typeof attribute.value === "string"
        ) {
          const next = rewrite(attribute.value, attribute.name === "src");
          changed ||= next !== attribute.value;
          attribute.value = next;
        }
      }
    }
  });
  return changed ? frontmatter + serializeMarkdown(ast, { mdx }) : markdown;
}

/** Check the shipped files, including references and HTML assets, without network access. */
export async function validateDocumentation(root) {
  const files = new Set(await listFiles(root));
  const headings = new Map();
  const documents = new Map();
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const markdown = await readFile(join(root, file), "utf8");
    const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
    headings.set(
      file,
      new Set(
        parseMarkdown(body, { mdx: file.endsWith(".mdx") }).headings.map(
          (heading) => heading.slug,
        ),
      ),
    );
    documents.set(file, markdown);
  }
  for (const [file, markdown] of documents) {
    rewriteDocumentation(
      markdown,
      (url) => {
        if (!isLocalUrl(url) && !url.startsWith("#")) return url;
        const { pathname, suffix } = splitUrl(url);
        const target = pathname
          ? normalizePath(join(dirname(file), decodeURIComponent(pathname)))
          : file;
        if (!files.has(target))
          throw new Error(`Missing documentation target: ${file}: ${url}`);
        const fragment = suffix.includes("#")
          ? decodeURIComponent(suffix.slice(suffix.indexOf("#") + 1))
          : "";
        if (
          fragment &&
          headings.has(target) &&
          !headings.get(target).has(fragment)
        ) {
          throw new Error(`Missing documentation heading: ${file}: ${url}`);
        }
        return url;
      },
      file.endsWith(".mdx"),
    );
  }
}

function localReference(url, files) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  let target;
  const path = parsed.pathname.replace(/\/$/, "");
  if (parsed.origin === "https://tasty.style") {
    target = !path
      ? "upstream/tasty/README.md"
      : path === "/docs"
        ? "upstream/tasty/docs/README.md"
        : `upstream/tasty${path}.md`;
  } else if (parsed.origin === "https://glaze.tenphi.me") {
    target = !path
      ? "upstream/glaze/README.md"
      : `upstream/glaze/docs${path}.md`;
  } else if (parsed.origin === "https://cookbook.tenphi.me") {
    target = !path ? "index.md" : `${path.slice(1)}.md`;
    if (!files.has(target)) target += "x";
  }
  if (target && files.has(target))
    return `${target}${parsed.search}${parsed.hash}`;
}

function relativeUrl(from, to) {
  const { pathname, suffix } = splitUrl(to);
  const path = normalizePath(relative(dirname(from), pathname));
  return `${path.startsWith(".") ? path : `./${path}`}${suffix}`;
}

function isLocalUrl(url) {
  return url && !/^(?:[a-z][a-z\d+.-]*:|\/|#|\?)/i.test(url);
}

function splitUrl(url) {
  const index = url.search(/[?#]/);
  return index < 0
    ? { pathname: url, suffix: "" }
    : { pathname: url.slice(0, index), suffix: url.slice(index) };
}

function normalizePath(path) {
  return path.split(sep).join("/");
}

async function packageRoot(entry, name) {
  let directory = dirname(entry);
  while (true) {
    try {
      const manifest = JSON.parse(
        await readFile(join(directory, "package.json"), "utf8"),
      );
      if (manifest.name === name) return directory;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const parent = dirname(directory);
    if (parent === directory)
      throw new Error(`Cannot locate ${name} from ${entry}.`);
    directory = parent;
  }
}

async function listFiles(root, directory = "") {
  const files = [];
  for (const entry of await readdir(join(root, directory), {
    withFileTypes: true,
  })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, path)));
    else if (entry.isFile()) files.push(normalizePath(path));
    else throw new Error(`Documentation must contain regular files: ${path}`);
  }
  return files.sort();
}

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await packDocs();
  console.log("Packaged Cookbook, Tasty, and Glaze documentation.");
}
