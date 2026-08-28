import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";
import docs from "./docs.config.js";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  site: "https://tastydocs.tenphi.me",
  output: "static",
  integrations: [tastyDocs({ config: docs, root: repositoryRoot })],
});
