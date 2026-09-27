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
    const parameters = mergeParameters(
      pathItem.parameters,
      operation.parameters,
      document,
    );
    renderSecurity(
      body,
      operation.security !== undefined ? operation.security : document.security,
      document,
    );
    if (parameters.length) {
      body.push(
        "## Parameters",
        "",
        "| Name | In | Required | Description |",
        "| --- | --- | --- | --- |",
      );
      for (const item of parameters) {
        const schema = record(item.schema)
          ? ` (${schemaLabel(item.schema)})`
          : "";
        body.push(
          `| ${tableCell(string(item.name) ?? "—")} | ${tableCell(string(item.in) ?? "—")} | ${item.required === true ? "Yes" : "No"} | ${tableCell(`${string(item.description) ?? ""}${schema}`)} |`,
        );
      }
      body.push("");
      for (const item of parameters) {
        if ("example" in item || "examples" in item || "content" in item) {
          body.push(
            `### ${escapeText(String(item.name))} (${escapeText(String(item.in))})`,
            "",
          );
          renderExamples(body, item, document);
          renderContent(body, item.content, document);
        }
      }
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
        renderContent(body, request.content, document);
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
        renderContent(body, response.content, document);
      }
    }
    pages.push({
      route,
      sourcePath: `${source}#${route.split("/").at(-1)}.md`,
      title: operationTitle,
      ...(string(operation.description)
        ? { description: operation.description as string }
        : {}),
      body: body.join("\n"),
    });
  }
  return pages;
}

function mergeParameters(
  path: unknown,
  operation: unknown,
  document: Data,
): Data[] {
  const merged = new Map<string, Data>();
  for (const list of [path, operation]) {
    if (list === undefined) continue;
    if (!Array.isArray(list))
      throw new Error("OpenAPI parameters must be an array.");
    const seen = new Set<string>();
    for (const value of list) {
      const item = resolveReference(value, document);
      if (
        !record(item) ||
        !string(item.name) ||
        !["query", "header", "path", "cookie"].includes(String(item.in))
      )
        throw new Error(
          "OpenAPI parameters need a name and a valid in location.",
        );
      const identity = JSON.stringify([item.name, item.in]);
      if (seen.has(identity))
        throw new Error(
          `Duplicate OpenAPI parameter ${item.name} in ${item.in}.`,
        );
      seen.add(identity);
      merged.set(identity, item);
    }
  }
  return [...merged.values()];
}

function renderContent(
  lines: string[],
  content: unknown,
  document: Data,
): void {
  if (!record(content)) return;
  for (const [mediaType, media] of Object.entries(content)) {
    lines.push(`#### ${escapeText(mediaType)}`, "");
    if (record(media) && media.schema !== undefined)
      lines.push(jsonBlock(media.schema), "");
    if (record(media)) renderExamples(lines, media, document);
  }
}

function renderExamples(lines: string[], owner: Data, document: Data): void {
  if ("example" in owner)
    lines.push("**Example**", "", jsonBlock(owner.example), "");
  if (!record(owner.examples)) return;
  for (const [name, raw] of Object.entries(owner.examples)) {
    const example = resolveReference(raw, document);
    if (!record(example))
      throw new Error(`OpenAPI example ${name} must be an Example Object.`);
    lines.push(`**Example: ${escapeText(name)}**`, "");
    if (string(example.summary))
      lines.push(escapeText(example.summary as string), "");
    if (string(example.description))
      lines.push(example.description as string, "");
    if ("value" in example) lines.push(jsonBlock(example.value), "");
    if (string(example.externalValue)) {
      const url = example.externalValue as string;
      // External examples are linked, never downloaded during a build.
      lines.push(
        /^https?:\/\/[^\s<>]+$/i.test(url)
          ? `[External example](<${url}>)`
          : `External example: ${escapeText(url)}`,
        "",
      );
    }
  }
}

function renderSecurity(
  lines: string[],
  security: unknown,
  document: Data,
): void {
  lines.push("## Authentication", "");
  if (security === undefined || (Array.isArray(security) && !security.length)) {
    lines.push("No authentication required.", "");
    return;
  }
  if (!Array.isArray(security))
    throw new Error("OpenAPI security must be an array.");
  const schemes =
    record(document.components) && record(document.components.securitySchemes)
      ? document.components.securitySchemes
      : {};
  if (security.length > 1) lines.push("Use any one of these alternatives:", "");
  for (const [index, requirement] of security.entries()) {
    if (!record(requirement))
      throw new Error("OpenAPI security requirements must be objects.");
    if (security.length > 1) lines.push(`### Alternative ${index + 1}`, "");
    const names = Object.keys(requirement);
    if (!names.length) {
      lines.push("No authentication required (anonymous access).", "");
      continue;
    }
    if (names.length > 1)
      lines.push("All of the following are required together:", "");
    for (const name of names) {
      const scheme = resolveReference(schemes[name], document);
      if (!record(scheme))
        throw new Error(`Unknown OpenAPI security scheme: ${name}.`);
      const scopes = requirement[name];
      if (
        !Array.isArray(scopes) ||
        scopes.some((scope) => typeof scope !== "string")
      )
        throw new Error(`OpenAPI security scopes for ${name} must be strings.`);
      let detail = string(scheme.type) ?? "security scheme";
      if (scheme.type === "http")
        detail = `HTTP ${string(scheme.scheme) ?? "authentication"}${string(scheme.bearerFormat) ? ` (${scheme.bearerFormat})` : ""}`;
      else if (scheme.type === "apiKey")
        detail = `API key ${string(scheme.name) ?? name} in ${string(scheme.in) ?? "request"}`;
      else if (scheme.type === "oauth2") detail = "OAuth 2.0";
      else if (scheme.type === "openIdConnect") detail = "OpenID Connect";
      else if (scheme.type === "mutualTLS") detail = "Mutual TLS";
      lines.push(
        `- **${escapeText(name)}:** ${escapeText(detail)}${scopes.length ? `. Required scopes: ${scopes.map((scope) => escapeText(String(scope))).join(", ")}` : ""}`,
      );
      if (string(scheme.description))
        lines.push("", scheme.description as string, "");
    }
    lines.push("");
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
      if (["example", "default", "const", "enum"].includes(key)) continue;
      if (key === "examples") {
        if (record(item))
          for (const example of Object.values(item)) {
            if (record(example)) {
              const { value: _payload, ...metadata } = example;
              assertLocalReferences(metadata, document, source, seen);
            }
          }
        continue;
      }
      if (key === "properties" && record(item)) {
        for (const schema of Object.values(item))
          assertLocalReferences(schema, document, source, seen);
        continue;
      }
      assertLocalReferences(item, document, source, seen);
    }
  }
}

function resolveReference(value: unknown, document: Data): unknown {
  const visited = new Set<string>();
  const overrides: Data = {};
  while (record(value) && typeof value.$ref === "string") {
    for (const key of ["summary", "description"])
      if (!(key in overrides) && typeof value[key] === "string")
        overrides[key] = value[key];
    const ref = value.$ref;
    if (visited.has(ref))
      throw new Error(`Circular OpenAPI reference: ${ref}.`);
    visited.add(ref);
    value = lookupReference(ref, document);
    if (value === undefined)
      throw new Error(`Unresolved OpenAPI reference: ${ref}.`);
  }
  return record(value) ? { ...value, ...overrides } : value;
}

function lookupReference(ref: string, document: Data): unknown {
  return decodeURIComponent(ref.slice(2))
    .split("/")
    .reduce<unknown>(
      (current, part) =>
        record(current) || Array.isArray(current)
          ? (current as Record<string, unknown>)[
              part.replace(/~1/g, "/").replace(/~0/g, "~")
            ]
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
  const body = JSON.stringify(value, null, 2) ?? "null";
  let longest = 0;
  for (const [run] of body.matchAll(/`+/g))
    longest = Math.max(longest, run.length);
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}json\n${body}\n${fence}`;
}
