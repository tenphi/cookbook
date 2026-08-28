import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";

export default defineConfig({
  base: "/manual/",
  integrations: [tastyDocs()],
});
