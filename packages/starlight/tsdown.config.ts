import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    components: "src/components.ts",
    "components/props": "src/components/props.ts",
    "client/tabs": "src/client/tabs.ts",
    styling: "src/styling.ts",
    "eslint-plugin": "src/eslint-plugin.ts",
    navigation: "src/navigation.ts",
    "client/appearance": "src/client/appearance.ts",
    "client/code-copy": "src/client/code-copy.ts",
    "client/search": "src/client/search.ts",
    "markdown/rendered-content": "src/markdown/rendered-content.ts",
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
      /\.astro$/,
    ],
  },
});
