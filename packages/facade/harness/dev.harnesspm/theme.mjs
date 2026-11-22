/**
 * The theme of the Cookbook site in the current folder, for Tasty's and
 * Glaze's agent tools. It reads `docs.config.ts` (or `.mts`, `.js`, `.mjs`)
 * as `cookbook doctor` does.
 *
 * - `tasty:styles --setup` imports it: on import, it configures Tasty as a
 *   Cookbook build does, with the site's tokens, units, presets and states.
 * - `glaze:inspect` reads its `theme` export: the site's colors as one Glaze
 *   theme, with every color Cookbook derives from `theme.brand` and
 *   `theme.palette`.
 */
import { createColorTheme, resolveDocsProject } from "@tenphi/docs";
import { configureTastyTheme } from "@tenphi/renderer";

const { config, configFile } = await resolveDocsProject({
  root: process.cwd(),
});

// Both tools collect console.warn output, and glaze:inspect hides warnings
// that name no color it shows. Write to stderr so the notice always shows.
if (configFile === undefined)
  process.stderr.write(
    `cookbook: no docs.config.* in ${process.cwd()}, so this is Cookbook's default theme. Run the tool from the folder with the site's docs.config.ts; -C does not change it. A site whose configuration is inline in astro.config.ts, or in another file named by configFile, gets the default theme here.\n`,
  );

configureTastyTheme(config.theme);

export const theme = createColorTheme(config.theme);
