import { defineCollection } from "astro:content";
import { createStarlightCollection } from "@tenphi/starlight/content";
import docs from "../docs.config.js";

export const collections = {
  docs: defineCollection(createStarlightCollection(docs)),
};
