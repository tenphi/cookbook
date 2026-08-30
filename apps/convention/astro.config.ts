import { defineConfig } from "astro/config";
import tastyDocs from "tasty-docs";

export default defineConfig({
  base: "/manual/",
  integrations: [
    tastyDocs({
      config: {
        navigation: {
          tabs: [
            { label: "Home", link: "/", items: ["/"] },
            {
              label: "Guide",
              link: "/guide",
              items: [
                {
                  label: "Level one",
                  items: [
                    {
                      label: "Level two",
                      items: [{ label: "Level three", items: ["/guide"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }),
  ],
});
