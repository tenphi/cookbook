import { parse as parseYaml } from "yaml";

export interface OpenApiPage {
  route: string;
  sourcePath: string;
  title: string;
  description?: string;
  body: string;
}

type Data = Record<string, unknown>;

const METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
];

/** Turn a local OpenAPI 3 document into static, searchable Markdown pages. */
export function openApiPages(
  source: string,
  routeBase: string,
  text: string,
): OpenApiPage[] {
  let document: unknown;
  try {
    document = source.endsWith(".json")
      ? JSON.parse(text)
      : parseYaml(text, { uniqueKeys: true });
  } catch (error) {
    throw new Error(`Invalid OpenAPI document ${source}: ${String(error)}`);
  }
  if (
    !record(document) ||
    typeof document.openapi !== "string" ||
    !document.openapi.startsWith("3.")
  ) {
    throw new Error(`OpenAPI source ${source} must use OpenAPI 3.x.`);
  }
  if (
    !record(document.info) ||
    typeof document.info.title !== "string" ||
    !record(document.paths)
  ) {
    throw new Error(`OpenAPI source ${source} needs info.title and paths.`);
  }
  assertLocalReferences(document, document, source);

  const title = document.info.title;
  const description = string(document.info.description);
  const operations: Array<{
    method: string;
    path: string;
    operation: Data;
    route: string;
    title: string;
  }> = [];
  const routes = new Set<string>([routeBase]);
  for (const [path, rawItem] of Object.entries(document.paths)) {
    const item = resolveReference(rawItem, document);
    if (!path.startsWith("/") || !record(item))
      throw new Error(`Invalid OpenAPI path ${path} in ${source}.`);
    for (const method of METHODS) {
      const operation = item[method];
      if (operation === undefined) continue;
      if (!record(operation))
        throw new Error(
          `Invalid ${method.toUpperCase()} ${path} in ${source}.`,
        );
      const name = string(operation.operationId) ?? `${method}-${path}`;
      const slug = slugify(name);
      if (!slug)
        throw new Error(
          `Cannot generate a route for ${method.toUpperCase()} ${path} in ${source}.`,
        );
      const route = `${routeBase === "/" ? "" : routeBase}/${slug}`;
      if (routes.has(route))
        throw new Error(
          `Duplicate OpenAPI operation route ${route} in ${source}. Give operations distinct operationId values.`,
        );
      routes.add(route);
      operations.push({
        method,
        path,
        operation,
        route,
        title: string(operation.summary) ?? `${method.toUpperCase()} ${path}`,
      });
    }
  }

  const overview: string[] = [`# ${escapeText(title)}`, ""];
  if (description) overview.push(description, "");
  if (typeof document.info.version === "string")
    overview.push(`**API version:** ${escapeText(document.info.version)}`, "");
  if (Array.isArray(document.servers) && document.servers.length) {
    overview.push("## Servers", "");
    for (const server of document.servers) {
      if (record(server) && typeof server.url === "string")
        overview.push(
          `- \`${escapeCode(server.url)}\`${string(server.description) ? ` — ${escapeText(server.description as string)}` : ""}`,
        );
    }
    overview.push("");
  }
  overview.push("## Operations", "");
  for (const operation of operations)
    overview.push(
      `- [${escapeText(operation.method.toUpperCase())} ${escapeText(operation.path)} — ${escapeText(operation.title)}](${operation.route})`,
    );
  if (!operations.length) overview.push("No operations are defined.");
  overview.push("");

  const schemas =
    record(document.components) && record(document.components.schemas)
      ? document.components.schemas
      : undefined;
  if (schemas && Object.keys(schemas).length) {
    overview.push("## Schemas", "");
    for (const [name, schema] of Object.entries(schemas)) {
      overview.push(`### ${escapeText(name)}`, "", jsonBlock(schema), "");
    }
  }
  const pages: OpenApiPage[] = [
    {
      route: routeBase,
      sourcePath: `${source}#overview.md`,
      title,
      ...(description ? { description } : {}),
      body: overview.join("\n"),
    },
  ];
  for (const {
    method,
    path,
    operation,
    route,
    title: operationTitle,
  } of operations) {
    const body: string[] = [
      `# ${escapeText(operationTitle)}`,
      "",
      `**${method.toUpperCase()}** \`${escapeCode(path)}\``,
      "",
      `[All operations](${routeBase})`,
      "",
    ];
    if (string(operation.description))
      body.push(operation.description as string, "");
    if (Array.isArray(operation.tags) && operation.tags.length)
      body.push(
        `**Tags:** ${operation.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map(escapeText)
          .join(", ")}`,
        "",
      );
    const pathItem = resolveReference(document.paths[path], document) as Data;
    const parameters = [
      ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
      ...(Array.isArray(operation.parameters) ? operation.parameters : []),
    ];
    if (parameters.length) {
      body.push(
        "## Parameters",
        "",
        "| Name | In | Required | Description |",
        "| --- | --- | --- | --- |",
      );
      for (const parameter of parameters) {
        const item = resolveReference(parameter, document);
        if (!record(item)) continue;
        const schema = record(item.schema)
          ? ` (${schemaLabel(item.schema)})`
          : "";
        body.push(
          `| ${tableCell(string(item.name) ?? "—")} | ${tableCell(string(item.in) ?? "—")} | ${item.required === true ? "Yes" : "No"} | ${tableCell(`${string(item.description) ?? ""}${schema}`)} |`,
        );
      }
      body.push("");
    }
    if (operation.requestBody !== undefined) {
      const request = resolveReference(operation.requestBody, document);
      if (record(request)) {
        body.push("## Request body", "");
        if (string(request.description))
          body.push(request.description as string, "");
        body.push(
          `**Required:** ${request.required === true ? "Yes" : "No"}`,
          "",
        );
        renderContent(body, request.content);
      }
    }
    if (record(operation.responses)) {
      body.push("## Responses", "");
      for (const [status, value] of Object.entries(operation.responses)) {
        const response = resolveReference(value, document);
        if (!record(response)) continue;
        body.push(
          `### ${escapeText(status)}${string(response.description) ? ` — ${escapeText(response.description as string)}` : ""}`,
          "",
        );
        renderContent(body, response.content);
      }
    }
    pages.push({
      route,
      sourcePath: `${source}#${route.slice(routeBase.length + 1)}.md`,
      title: operationTitle,
      ...(string(operation.description)
        ? { description: operation.description as string }
        : {}),
      body: body.join("\n"),
    });
  }
  return pages;
}

function renderContent(lines: string[], content: unknown): void {
  if (!record(content)) return;
  for (const [mediaType, media] of Object.entries(content)) {
    lines.push(`#### ${escapeText(mediaType)}`, "");
    if (record(media) && media.schema !== undefined)
      lines.push(jsonBlock(media.schema), "");
    if (record(media) && record(media.examples)) {
      for (const [name, example] of Object.entries(media.examples)) {
        const value =
          record(example) && "value" in example ? example.value : example;
        lines.push(
          `**Example: ${escapeText(name)}**`,
          "",
          jsonBlock(value),
          "",
        );
      }
    }
  }
}

function assertLocalReferences(
  value: unknown,
  document: Data,
  source: string,
  seen = new Set<object>(),
): void {
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value)
      assertLocalReferences(item, document, source, seen);
  } else {
    for (const [key, item] of Object.entries(value)) {
      if (
        key === "$ref" &&
        (typeof item !== "string" || !item.startsWith("#/"))
      )
        throw new Error(
          `OpenAPI source ${source} has an external or invalid $ref; bundle references into the document first.`,
        );
      if (
        key === "$ref" &&
        typeof item === "string" &&
        lookupReference(item, document) === undefined
      )
        throw new Error(
          `OpenAPI source ${source} has an unresolved reference: ${item}.`,
        );
      assertLocalReferences(item, document, source, seen);
    }
  }
}

function resolveReference(value: unknown, document: Data): unknown {
  const visited = new Set<string>();
  while (record(value) && typeof value.$ref === "string") {
    const ref = value.$ref;
    if (visited.has(ref))
      throw new Error(`Circular OpenAPI reference: ${ref}.`);
    visited.add(ref);
    value = lookupReference(ref, document);
    if (value === undefined)
      throw new Error(`Unresolved OpenAPI reference: ${ref}.`);
  }
  return value;
}

function lookupReference(ref: string, document: Data): unknown {
  return ref
    .slice(2)
    .split("/")
    .reduce<unknown>(
      (current, part) =>
        record(current)
          ? current[part.replace(/~1/g, "/").replace(/~0/g, "~")]
          : undefined,
      document,
    );
}

function record(value: unknown): value is Data {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value.length ? value : undefined;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeText(value: string): string {
  return value.replace(/[\\`*_\[\]<>|]/g, "\\$&").replace(/\r?\n/g, " ");
}

function escapeCode(value: string): string {
  return value.replace(/`/g, "\\`").replace(/\r?\n/g, " ");
}

function tableCell(value: string): string {
  return escapeText(value);
}

function schemaLabel(schema: Data): string {
  return typeof schema.$ref === "string"
    ? (schema.$ref.split("/").at(-1) ?? "schema")
    : (string(schema.type) ?? "schema");
}

function jsonBlock(value: unknown): string {
  const body = JSON.stringify(value, null, 2);
  let longest = 0;
  for (const [run] of body.matchAll(/`+/g))
    longest = Math.max(longest, run.length);
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}json\n${body}\n${fence}`;
}
