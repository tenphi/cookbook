import { useFontFace, useGlobalStyles } from "@tenphi/tasty";
import jetBrainsMonoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
import { TASTY_SPACING_PROPERTIES } from "../theme/tasty-config.js";
import { getDefaultFontUsage, getFontFaces } from "../theme/fonts.js";

configureCookbookStates();

export default function DocumentStyles() {
  const defaultFonts = getDefaultFontUsage();
  if (defaultFonts.onest)
    useFontFace("Onest Variable", {
      src: `url("${onestLatin}") format("woff2-variations")`,
      fontWeight: "100 900",
      fontDisplay: defaultFonts.display ?? "swap",
    });
  if (defaultFonts.mono)
    useFontFace("JetBrains Mono Variable", {
      src: `url("${jetBrainsMonoLatin}") format("woff2-variations")`,
      fontWeight: "100 800",
      fontDisplay: defaultFonts.display ?? "swap",
    });
  for (const face of getFontFaces()) useFontFace(face.family, face.descriptors);

  useGlobalStyles(
    ":root",
    resolveComponentStyles("Layout", {
      overflow: {
        "": null,
        ":has(#cookbook__sidebar:popover-open) & @mobile": "hidden",
      },
      colorScheme: {
        "": "dark",
        '[data-theme="light"]': "light",
        "![data-theme] & @system-light": "light",
      },
      "$docs-nav-height": {
        "": "4.5rem",
        ":has(.td-top-tabs)": "7.25rem",
        "@mobile": "3.5rem",
        "@mobile & [data-has-sidebar]": "6.5rem",
      },
      "$docs-nav-pad-x": {
        "": "clamp(1.25rem, 2.5vw, 2rem)",
        "@mobile": "1rem",
      },
      "$docs-nav-gap": { "": "0.75rem", "@mobile": "0.5rem" },
      "$docs-sidebar-pad-x": "1.5rem",
      "$docs-content-pad-x": {
        "": "clamp(1.5rem, calc((100% - $content-width) / 2), 4rem)",
        "@mobile": "1rem",
      },
      "$docs-menu-button-size": { "": "2.5rem", "@mobile": "2.25rem" },
      "$docs-mobile-toc-height": "0rem",
      Islands: {
        $: "astro-island, astro-slot, astro-static-slot",
        display: "contents",
      },
    }),
  );

  useGlobalStyles(
    ":where(html)",
    resolveComponentStyles("Document", {
      "@property": TASTY_SPACING_PROPERTIES,
      boxSizing: "border-box",
      scrollBehavior: { "@reduced-motion": "auto" },
      transitionDuration: { "@reduced-motion": "0.01ms" },
      "$margin-block-start": "0",
      "$margin-block-end": "0",
      blockSize: "min 100%",
      blockScrollPadding:
        "(1.5rem + $docs-nav-height + $docs-mobile-toc-height) start",
      All: {
        $: "&::before, &::after, *, *::before, *::after",
        boxSizing: "border-box",
        scrollBehavior: {
          "@reduced-motion": "auto",
        },
        transitionDuration: {
          "@reduced-motion": "0.01ms",
        },
      },
      BlockSpacing: {
        $: "*",
        // Reset on each element: spacing tokens must never leak into its children.
        "$margin-block-start": {
          "": "0",
          "@own(:is(p,ul,ol,dl,blockquote,pre,figure))": "1em",
          "@own(:is(hr))": "0.5em",
          "@own(:is(h1))": "0.67em",
          "@own(:is(h2))": "0.83em",
          "@own(:is(h3))": "1em",
          "@own(:is(h4))": "1.33em",
          "@own(:is(h5))": "1.67em",
          "@own(:is(h6))": "2.33em",
        },
        "$margin-block-end": {
          "": "0",
          "@own(:is(p,ul,ol,dl,blockquote,pre,figure))": "1em",
          "@own(:is(hr))": "0.5em",
          "@own(:is(h1))": "0.67em",
          "@own(:is(h2))": "0.83em",
          "@own(:is(h3))": "1em",
          "@own(:is(h4))": "1.33em",
          "@own(:is(h5))": "1.67em",
          "@own(:is(h6))": "2.33em",
        },
      },
      Body: {
        $: "body",
        inlineSize: "min 0",
        blockSize: "min 100%",
        margin: "0",
        color: "#text",
        fill: "#surface",
        preset: "body",
      },
      Control: {
        $: ":where(button), :where(input), :where(select), :where(textarea)",
        preset: "body",
        blockSize: "min $control-height",
        radius: "$radius",
        shadow: "none",
      },
      Pointer: {
        $: ":where(button), :where(summary), :where(select)",
        cursor: "pointer",
      },
      ResponsiveWidth: {
        $: "img, :where(picture), video, canvas, svg, iframe",
        inlineSize: {
          "": null,
          "@own(![width] | :is(picture))": "max 100%",
        },
      },
      ResponsiveHeight: {
        $: "img, :where(picture), video, canvas, svg",
        blockSize: {
          "": null,
          "@own(![height] | :is(picture))": "auto",
        },
      },
      Hidden: {
        $: ":where(*), :where(.cookbook-hidden)",
        hide: {
          "": null,
          "@own([hidden] | .cookbook-hidden)": true,
        },
      },
      PrintHidden: {
        $: ".cookbook-print-hidden",
        display: { "@media:print": "none" },
      },
      DesktopBlock: {
        $: ":is(.md\\:cookbook-block)",
        display: { "": "block", "@mobile": "none" },
      },
      DesktopFlex: {
        $: ":is(.md\\:cookbook-flex)",
        display: { "": "flex", "@mobile": "none" },
      },
      ScreenReaderOnly: {
        $: ".sr-only",
        "$visually-hidden-size": "1px",
        position: "absolute",
        inlineSize: "$visually-hidden-size",
        blockSize: "$visually-hidden-size",
        padding: "0",
        margin: "($visually-hidden-size * -1)",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      },
      Strong: { $: ":where(strong), :where(b)", preset: "strong" },
      Link: { $: "a", color: "#accent-text" },
      NarrowBlock: {
        $: ":is(.lg\\:cookbook-hidden)",
        display: { "": "none", "@narrow-layout": "block" },
      },
      MobileBlock: {
        $: ":is(.md\\:cookbook-hidden)",
        display: { "": "none", "@mobile": "block" },
      },
      Code: {
        $: ":where(code), :where(kbd), :where(samp), :where(pre)",
        preset: "code",
      },
      FocusRing: {
        $: ":where(a), :where(button), :where(input), :where(select), :where(textarea), :where(summary)",
        outline: {
          "": null,
          "@own(:focus-visible)":
            "$outline-width solid #focus / $outline-offset",
        },
      },
      CurrentLink: {
        $: "a",
        radius: { "": null, '@own([aria-current="page"])': "$radius" },
      },
      SearchOpen: {
        $: "body",
        overflow: { "": null, "@own([data-search-modal-open])": "hidden" },
      },
    }),
  );

  useGlobalStyles(
    ":where(h1, h2, h3, h4, h5, h6, .site-title)",
    resolveComponentStyles("Heading", {
      color: "#heading",
      preset: {
        "": "heading",
        ":is(h1)": "h1",
        ":is(h2)": "h2",
        ":is(h3)": "h3",
        ":is(h4)": "h4",
        ":is(h5)": "h5",
        ":is(h6)": "h6",
      },
      textWrap: "balance",
      "$margin-block-start": { "": null, '[id="_top"]': "($gap * 2)" },
      blockMargin: "$margin-block-start $margin-block-end",
    }),
  );

  return null;
}
