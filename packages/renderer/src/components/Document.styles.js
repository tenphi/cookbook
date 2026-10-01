import { useFontFace, useGlobalStyles } from "@tenphi/tasty";
import jetBrainsMonoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import { resolveComponentStyles } from "./component-styles.js";
import { configureCookbookStates } from "./tasty-states.js";
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
      colorScheme: "dark",
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
        "": "clamp(1.5rem, 4vw, 4rem)",
        "@mobile": "1rem",
      },
      "$docs-menu-button-size": { "": "2.5rem", "@mobile": "2.25rem" },
      "$docs-mobile-toc-height": "0rem",
      Islands: {
        $: "astro-island, astro-slot, astro-static-slot",
        display: "contents",
      },
      LockedPage: {
        $: "&:has(#cookbook__sidebar:popover-open)",
        overflow: { "@mobile": "hidden" },
      },
      Light: { $: '&[data-theme="light"]', colorScheme: "light" },
      Auto: {
        $: "&:not([data-theme])",
        colorScheme: {
          "@system-light": "light",
        },
      },
    }),
  );

  useGlobalStyles(
    ":where(html)",
    resolveComponentStyles("Document", {
      minBlockSize: "100%",
      scrollPaddingBlockStart:
        "(1.5rem + $docs-nav-height + $docs-mobile-toc-height)",
      All: {
        $: "&:where(*), &::before, &::after, *, *::before, *::after",
        boxSizing: "border-box",
        scrollBehavior: {
          "@reduced-motion": "auto",
        },
        transitionDuration: {
          "@reduced-motion": "0.01ms",
        },
      },
      Body: {
        $: "body",
        minInlineSize: "0",
        minBlockSize: "100%",
        margin: "0",
        color: "#text",
        fill: "#surface",
        preset: "body",
      },
      Control: {
        $: ":where(button), :where(input), :where(select), :where(textarea)",
        preset: "body",
        minBlockSize: "$control-height",
        radius: "$radius",
        boxShadow: "none",
      },
      Pointer: {
        $: ":where(button), :where(summary), :where(select)",
        cursor: "pointer",
      },
      ResponsiveWidth: {
        $: "img:not([width]), :where(picture), video:not([width]), canvas:not([width]), svg:not([width]), iframe:not([width])",
        maxInlineSize: "100%",
      },
      ResponsiveHeight: {
        $: "img:not([height]), :where(picture), video:not([height]), canvas:not([height]), svg:not([height])",
        blockSize: "auto",
      },
      Hidden: { $: ":where([hidden]), :where(.cookbook-hidden)", hide: true },
      PrintHidden: {
        $: ".cookbook-print-hidden",
        display: { "@media:print": "none" },
      },
      DesktopBlock: {
        $: '[class~="md:cookbook-block"]',
        display: { "": "block", "@mobile": "none" },
      },
      DesktopFlex: {
        $: '[class~="md:cookbook-flex"]',
        display: { "": "flex", "@mobile": "none" },
      },
      ScreenReaderOnly: {
        $: ".sr-only",
        position: "absolute",
        inlineSize: "1px",
        blockSize: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      },
      Strong: { $: ":where(strong), :where(b)", preset: "strong" },
      Link: { $: "a", color: "#accent-text" },
      NarrowBlock: {
        $: '[class~="lg:cookbook-hidden"]',
        display: { "": "none", "@narrow-layout": "block" },
      },
      MobileBlock: {
        $: '[class~="md:cookbook-hidden"]',
        display: { "": "none", "@mobile": "block" },
      },
      Code: {
        $: ":where(code), :where(kbd), :where(samp), :where(pre)",
        preset: "code",
      },
      FocusRing: {
        $: ":where(a):focus-visible, :where(button):focus-visible, :where(input):focus-visible, :where(select):focus-visible, :where(textarea):focus-visible, :where(summary):focus-visible",
        outline: "$outline-width solid #focus",
        outlineOffset: "$outline-offset",
      },
      CurrentLink: { $: 'a[aria-current="page"]', radius: "$radius" },
      SearchOpen: { $: "body[data-search-modal-open]", overflow: "hidden" },
    }),
  );

  useGlobalStyles(
    ":where(h1, h2, h3, h4, h5, h6, .site-title)",
    resolveComponentStyles("Heading", {
      color: "#heading",
      preset: "heading",
      textWrap: "balance",
      Level1: { $: "&:is(h1)", preset: "h1" },
      Level2: { $: "&:is(h2)", preset: "h2" },
      Level3: { $: "&:is(h3)", preset: "h3" },
      Level4: { $: "&:is(h4)", preset: "h4" },
      Level5: { $: "&:is(h5)", preset: "h5" },
      Level6: { $: "&:is(h6)", preset: "h6" },
      PageTitle: { $: '&[id="_top"]', marginBlockStart: "($gap * 2)" },
    }),
  );

  return null;
}
