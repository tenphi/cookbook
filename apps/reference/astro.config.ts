import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
