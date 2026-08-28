import { docsSchema } from "./starlight-schema-runtime.js";
import { createDocsLoader, type DocsConfig } from "@tenphi/docs";

export function createStarlightCollection(config?: DocsConfig, root?: string) {
  return {
    loader: createDocsLoader(config, root ? { root } : {}),
    schema: docsSchema(),
  };
}
