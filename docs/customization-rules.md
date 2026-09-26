---
title: Customization rules
description: The customization contract for Cookbook consumers and coding agents, with local Tasty and Glaze references.
sidebar:
  order: 5
---

Read this guide before changing a Cookbook site's appearance. It applies to
consumer projects and custom components. Cookbook's repository `AGENTS.md`
also covers engine maintenance; consumers do not need to edit its component
registries or internal helpers.

## Read the configuration first

Inspect `docs.config.ts`, `tasty.config.ts`, and the components you are changing.
Reuse the site's existing semantic colors, tokens, presets, responsive states,
and named sub-elements. Do not invent configuration names. Consult the complete
[component anatomy reference](./theme-and-components.md#style-customization)
before overriding a built-in component.

## Choose the customization surface

| Change                        | Supported surface                                      |
| ----------------------------- | ------------------------------------------------------ |
| Brand and semantic colors     | `theme.brand` and the supported `theme.palette` inputs |
| Shared dimensions and spacing | `theme.tokens`                                         |
| Font loading and family roles | `theme.fonts`                                          |
| Typography                    | `theme.presets`                                        |
| Responsive conditions         | `theme.states`                                         |
| Existing component appearance | Partial Tasty objects in `theme.styles.<Name>`         |
| Custom component appearance   | `defineComponent()` and `theme.customStyles.<Name>`    |
| Markup or behavior            | `components.overrides` with an owned Astro component   |

Prefer configuration changes when the markup and behavior already fit. Supply
only the properties you want to change: Cookbook merges partial overrides into
its complete base styles using Tasty's `mergeStyles`. Do not copy the entire
default style tree or rebuild it in user configuration. Built-in names belong
in `theme.styles`; custom names belong in `theme.customStyles`.

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  theme: {
    styles: {
      StarlightHeader: { SiteTitle: { preset: "h4 / strong" } },
    },
  },
});
```

## Write styles through Cookbook

Import `defineComponent`, `tasty`, `useGlobalStyles`, `resolveComponentStyles`,
and `mergeStyles` from `@tenphi/cookbook/styling` as needed. Cookbook supplies
the configured runtime and extracts static CSS; installing another Tasty
integration or calling upstream `configure()` is unnecessary. Shared settings
belong in `docs.config.ts`.

- Express styles with Tasty. Do not add CSS files, CSS modules, Astro `<style>`
  blocks, inline `style` attributes, or imported Starlight styles to customize
  the documentation interface. The isolated content of `Preview` is a separate
  demonstration surface.
- Model descendants and pseudo-elements as named sub-elements inside the
  owning style object. Keep their selectors and base styles together instead
  of spreading component anatomy across unrelated global rules.
- Use semantic color tokens such as `#text`, `#surface`, and `#accent-text`
  in component styles. Configure Glaze color declarations through `theme.brand`
  and the supported `theme.palette` roles so Glaze can resolve every scheme and
  contrast mode. Do not hard-code component colors or invent palette keys.
- Apply semantic typography with `preset`, for example `"small"` or
  `"h2 / strong"`. Do not reconstruct presets from individual font tokens or
  wire modifier internals such as `$bold-font-weight` yourself.
- Use `defineComponent(name, options)` for customizable component roots.
  For global style trees, pass `resolveComponentStyles(name, baseStyles)` to
  `useGlobalStyles()`. Both read partial overrides from `theme.customStyles`.
  Document each custom component's name and complete named sub-element list.
- When replacing a component, own its markup and behavior. Keep keyboard
  access, focus, semantics, responsive behavior, and appearance modes intact.

The [custom component examples](./theme-and-components.md#authoring-custom-components)
show both a component root and a global style tree using these APIs.

## Read the underlying references

Cookbook's rules govern its integration and supported customization surfaces.
Use the upstream references for syntax and color behavior. Upstream examples
may configure standalone applications or other frameworks; keep Cookbook's
imports, configuration, and rendering setup when adapting them.

- [Tasty style rules for AI agents](https://tasty.style/docs/ai-agents): concise
  rules for values, state maps, tokens, selectors, and sub-elements.
- [Tasty style DSL](https://tasty.style/docs/dsl) and
  [style properties](https://tasty.style/docs/styles): syntax and property reference.
- [Tasty methodology](https://tasty.style/docs/methodology) and
  [configuration](https://tasty.style/docs/configuration): component design and shared settings.
- [Glaze methodology](https://glaze.tenphi.me/methodology/): semantic palettes
  and contrast relationships.
- [Glaze API](https://glaze.tenphi.me/api/): color inputs, schemes, and contrast solving.

## Documentation in the installed package

The public `@tenphi/cookbook` package includes this guide and the rest of the
Cookbook documentation in `docs/`. Its `docs/upstream/` directory contains
generated Tasty and Glaze documentation snapshots, their READMEs, and licenses.
`docs/upstream/manifest.json` records the source package versions and release
references. These match the dependencies used to build that Cookbook release;
consumer dependency overrides can change the installed runtime independently.

In the packaged copies, links to available upstream reference pages point to
these local snapshots. The Markdown references work offline. Links to source
code and artwork absent from the npm packages point to their upstream release
and still need internet access. The published website keeps its online links.

Start at `node_modules/@tenphi/cookbook/docs/customization-rules.md`. When the
package manager uses a different layout, resolve the exported documentation
path from the consuming project:

```sh
node --input-type=module -e "console.log(import.meta.resolve('@tenphi/cookbook/docs/customization-rules.md'))"
```

Read the resolved file as Markdown; documentation exports are file references,
not JavaScript modules. The snapshots are generated during Cookbook's build
and packaging, with no network fetch or consumer installation hook.

## Guide coding agents explicitly

Having documentation installed does not ensure an agent reads it. Add a short
instruction to your project's existing agent guidance, adjusting the path for
the app that depends on Cookbook:

```md
Before customizing this Cookbook site, read
node_modules/@tenphi/cookbook/docs/customization-rules.md and follow its linked
Tasty and Glaze references. Inspect docs.config.ts and tasty.config.ts first.
Use Cookbook's public styling APIs, semantic palette tokens, typography
presets, and partial component overrides. Run the project's style lint,
cookbook doctor, and build commands after changes.
```

## Check the result

Adopt the [Cookbook Tasty lint configuration](./theme-and-components.md#linting-custom-styles)
and extend its built-in vocabulary in `tasty.config.ts`:

```ts
export default { extends: "@tenphi/cookbook" };
```

Run the configured style linter, `cookbook doctor`, and the site build. The
linter checks supported Tasty rules; it does not enforce every architectural
rule above or inspect arbitrary CSS. Review custom components at mobile and
desktop sizes, with keyboard navigation, in light and dark schemes, and with
normal and high contrast.
