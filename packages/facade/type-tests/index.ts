import { defineDocsConfig } from "../dist/config.js";
import type { ComponentProps } from "astro/types";
import { Tab, Preview, Logo } from "../dist/components.js";

defineDocsConfig({
  theme: { styles: { Sidebar: { LinkLabel: { whiteSpace: "normal" } } } },
});
// @ts-expect-error Unknown built-in component.
defineDocsConfig({ theme: { styles: { Sidebaar: {} } } });
// @ts-expect-error Unknown sub-element.
defineDocsConfig({ theme: { styles: { Sidebar: { LinkLable: {} } } } });
defineDocsConfig({
  theme: {
    styles: {
      Sidebar: {
        LinkLabel: {
          // @ts-expect-error Unknown Tasty property.
          colorr: "#text",
        },
      },
    },
  },
});
defineDocsConfig({
  theme: {
    styles: {
      Sidebar: {
        LinkLabel: {
          // @ts-expect-error Invalid property value.
          padding: [],
        },
      },
    },
  },
});
// @ts-expect-error Partial styles have no mode wrapper.
defineDocsConfig({ theme: { styles: { Sidebar: { mode: "replace" } } } });
const tab: ComponentProps<typeof Tab> = { label: "npm" };
// @ts-expect-error A tab requires an accessible label.
const missingTabLabel: ComponentProps<typeof Tab> = {};
// @ts-expect-error A preview requires its title.
const missingTitle: ComponentProps<typeof Preview> = { html: "<p>Preview</p>" };
const logo: ComponentProps<typeof Logo> = {
  label: "Product",
  decorative: true,
};
void [tab, missingTabLabel, missingTitle, logo];
