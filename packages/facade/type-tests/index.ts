import { defineDocsConfig } from "../dist/config.js";
import type { ThemeFont } from "../dist/config.js";
import type { ComponentProps } from "astro/types";
import { Tab, Preview, Logo } from "../dist/components.js";

defineDocsConfig({
  theme: { styles: { Sidebar: { LinkLabel: { whiteSpace: "normal" } } } },
});
const localFont: ThemeFont = {
  family: "Project Mono",
  files: [{ src: "/fonts/project-mono.woff2", weight: "100 900" }],
};
void localFont;
defineDocsConfig({
  theme: {
    fonts: {
      body: "Inter",
      heading: { google: "Newsreader", weights: [400, 700] },
      code: {
        family: "Project Mono",
        files: [{ src: "/fonts/project-mono.woff2", weight: "100 900" }],
      },
    },
  },
});
// @ts-expect-error Font roles are fixed.
defineDocsConfig({ theme: { fonts: { sidebar: "Inter" } } });
defineDocsConfig({
  theme: {
    fonts: {
      // @ts-expect-error Local fonts need a family name.
      body: { files: [{ src: "/fonts/brand.woff2" }] },
    },
  },
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

defineDocsConfig({
  navigation: [
    { label: "Guides", link: "/guides", items: ["/guide"] },
    { label: "API", link: "/api", autogenerate: { directory: "/api" } },
  ],
});
// @ts-expect-error Group page links must be strings.
defineDocsConfig({ navigation: [{ label: "Guides", link: 123, items: [] }] });

defineDocsConfig({
  site: {
    headerLinks: [
      { label: "Start", link: "/start", variant: "primary", newTab: false },
    ],
  },
  theme: {
    palette: { header: "#fafaff" },
    styles: {
      HeaderFrame: { backdropFilter: "blur(12px)" },
      HeaderLinks: { PrimaryLink: { radius: "999px" } },
      SearchButton: { Icon: { inlineSize: "1.25rem" } },
      Sidebar: { Close: { color: "#text" } },
      MobileNavigationTabs: { Trigger: { radius: "1r" } },
    },
  },
});
defineDocsConfig({
  site: {
    headerLinks: [
      // @ts-expect-error Header links must use a supported variant.
      { label: "Start", link: "/start", variant: "danger" },
    ],
  },
});
