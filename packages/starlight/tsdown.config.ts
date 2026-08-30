import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    content: "src/content.ts",
    components: "src/components.ts",
    navigation: "src/navigation.ts",
    "client/appearance": "src/client/appearance.ts",
    "client/search": "src/client/search.ts",
  },
  format: "esm",
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "node",
  deps: {
    neverBundle: [
      /^astro(?:\/|$)/,
      /^@astrojs\//,
      /^@tenphi\//,
      /^react(?:\/|$)/,
      /^tsx(?:\/|$)/,
      /\.astro$/,
    ],
  },
});
