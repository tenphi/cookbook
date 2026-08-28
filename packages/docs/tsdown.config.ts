import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "config/index": "src/config/index.ts",
    "content/index": "src/content/index.ts",
    "markdown/index": "src/markdown/index.ts",
    "testing/index": "src/testing/index.ts",
  },
  format: "esm",
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "node",
});
