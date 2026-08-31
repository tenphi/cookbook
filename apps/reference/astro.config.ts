import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";
import docs from "./docs.config.js";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  site: "https://cookbook.tenphi.me",
  output: "static",
  integrations: [cookbook({ config: docs, root: repositoryRoot })],
});
