import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    components: "src/components.ts",
    cli: "src/cli.ts",
  },
  format: "esm",
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "node",
  external: [/^astro(?:\/|$)/, /^@tenphi\//],
  banner: { js: "#!/usr/bin/env node" },
});
