import { fileURLToPath } from "node:url";
import { defineCollection } from "astro:content";
import { createStarlightCollection } from "@tenphi/starlight/content";
import docs from "../docs.config.js";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));

export const collections = {
  docs: defineCollection(createStarlightCollection(docs, repositoryRoot)),
};
