import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({
  base: "/manual/",
  integrations: [
    cookbook({
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
