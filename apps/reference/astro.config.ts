import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";
import docs from "./docs.config.js";

export default defineConfig({
  output: "static",
  integrations: [tastyDocs({ config: docs })],
});
