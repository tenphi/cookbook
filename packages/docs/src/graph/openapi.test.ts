import { expect, it } from "vitest";
import { openApiPages } from "./openapi.js";
import { createDocsFixture } from "../testing/index.js";
import { createDocsGraph } from "./index.js";
function spec() {
  return {
    openapi: "3.1.0",
    info: { title: "Example API", version: "1" },
    security: [{ Token: [], Key: [] }, { OAuth: ["read"] }],
    components: {
      parameters: {
        Id: {
          name: "id",
          in: "path",
          required: true,
          description: "path default",
          schema: { type: "string" },
        },
      },
      examples: {
        Empty: { summary: "Zero result", value: 0 },
        Payload: { value: { $ref: "literal data" } },
      },
      securitySchemes: {
        Token: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        Key: { type: "apiKey", in: "header", name: "X-API-Key" },
        OAuth: { type: "oauth2", flows: {} },
      },
    },
    paths: {
      "/things/{id}": {
        parameters: [
          { $ref: "#/components/parameters/Id" },
          { name: "id", in: "query", description: "query id", example: false },
        ],
        get: {
          operationId: "readThing",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "operation override",
              example: 0,
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  examples: {
                    empty: { $ref: "#/components/examples/Empty" },
                    payload: { $ref: "#/components/examples/Payload" },
                    download: {
                      externalValue: "https://example.com/example.json",
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: "createThing",
          security: [],
          requestBody: { content: { "application/json": { example: null } } },
          responses: {},
        },
        delete: {
          operationId: "deleteThing",
          security: [{}, { Token: [] }],
          responses: {},
        },
      },
    },
  };
}
it("merges parameters by name and location and renders singular/referenced examples", () => {
  const pages = openApiPages("api.json", "/api", JSON.stringify(spec()));
  const body = pages.find((p) => p.route === "/api/read-thing")!.body;
  expect(body.match(/\| id \| path \|/g)).toHaveLength(1);
  expect(body).not.toContain("path default");
  expect(body).toContain("operation override");
  expect(body).toContain("| id | query |");
  for (const text of [
    "false",
    "Zero result",
    "literal data",
    "[External example](<https://example.com/example.json>)",
    "```json\n0\n```",
    "All of the following",
    "Alternative 2",
    "HTTP bearer (JWT)",
    "API key X-API-Key in header",
    "Required scopes: read",
  ])
    expect(body).toContain(text);
  const create = pages.find((p) => p.route === "/api/create-thing")!.body;
  expect(create).toContain("No authentication required.");
  expect(create).not.toContain("Required scopes");
  expect(create).toContain("```json\nnull\n```");
  expect(pages.find((p) => p.route === "/api/delete-thing")!.body).toContain(
    "anonymous access",
  );
});
it("rejects missing security schemes and duplicate same-level parameters", () => {
  const input = spec();
  input.security = [{ Missing: [] }] as never;
  expect(() => openApiPages("api.json", "/api", JSON.stringify(input))).toThrow(
    "Unknown OpenAPI security scheme: Missing",
  );
  const duplicate = spec();
  duplicate.paths["/things/{id}"].parameters.push({
    $ref: "#/components/parameters/Id",
  });
  expect(() =>
    openApiPages("api.json", "/api", JSON.stringify(duplicate)),
  ).toThrow("Duplicate OpenAPI parameter");
});
it("produces routable reference links under a deployment base with complete content", async () => {
  const root = await createDocsFixture({ "api.json": JSON.stringify(spec()) });
  const graph = await createDocsGraph({
    root,
    base: "/manual",
    config: {
      content: { sources: [{ openapi: "api.json", routeBase: "/api" }] },
    },
  });
  expect(graph.diagnostics).toEqual([]);
  expect(graph.routes).toHaveLength(4);
  expect(graph.entryByRoute("/api")!.transformedBody).toContain(
    "/manual/api/read-thing",
  );
  expect(graph.entryByRoute("/api/read-thing")!.transformedBody).toContain(
    "[All operations](/manual/api)",
  );
});

it("resolves escaped and encoded reference names and preserves reference descriptions", () => {
  const input = spec();
  Object.assign(input.components.examples, { "a/b ~": { value: false } });
  Object.assign(
    input.paths["/things/{id}"].get.responses["200"].content["application/json"]
      .examples,
    {
      special: {
        $ref: "#/components/examples/a~1b%20~0",
        description: "Reference description",
      },
    },
  );
  const body = openApiPages("api.json", "/", JSON.stringify(input)).find(
    (p) => p.route === "/read-thing",
  )!;
  expect(body.body).toContain("Reference description");
  expect(body.sourcePath).toBe("api.json#read-thing.md");
});
