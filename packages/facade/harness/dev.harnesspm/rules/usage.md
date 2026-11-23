# Cookbook site

## Site files

- `docs.config.ts` holds the site, its content sources, navigation and theme. `astro.config.ts` loads Cookbook. Read both before you change the site.
- Content stays where it lives. Edit the Markdown files that `root` and `content.sources` point at; never copy them into the site.
- Before a task, read "For AI agents" in the Cookbook docs index. It names the page for each task.

## Styling

- Change the look in `theme` in `docs.config.ts`. A built-in component takes a partial Tasty object in `theme.styles.<Name>`: the "Component styles" page lists every name and sub-element. Typography is `theme.presets`, applied with `preset`.
- Write no CSS files, `<style>` blocks or inline `style` attributes. Style your own components with `defineComponent()` from `@tenphi/cookbook/styling`.
- Tasty and Glaze run only during the build. Never import Cookbook styling, Tasty or Glaze into browser scripts or client islands.

## Checking a site

- After a change, run the site's `validate` script: type checking, `cookbook doctor`, the build and `cookbook check-build`.
