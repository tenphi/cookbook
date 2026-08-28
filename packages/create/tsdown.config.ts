import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts", cli: "src/cli.ts" },
  format: "esm",
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "node",
  external: [/^@tenphi\//],
  banner: { js: "#!/usr/bin/env node" },
});
