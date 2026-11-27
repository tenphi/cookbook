---
title: Agent harness
description: Give a coding agent Cookbook's rules, the docs of the installed version, Tasty and Glaze tools that read the site's theme, and Tasty lint tools, with harnesspm.
---

`@tenphi/cookbook` ships a harness for coding agents. [harnesspm](https://harnesspm.tenphi.me)
puts it into the agent instructions of the project that installs Cookbook and
keeps it current with every install. The harness is optional: a site builds the
same without it, and the [installed docs](./agents.md#what-is-installed) stay
where they are.

## What the harness gives an agent

| Unit                                                                                                          | What it does                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cookbook:rules/usage`                                                                                        | An always-on rule: where a site's files are, how to change its look, and how to check it.                                                                                                                                           |
| `cookbook:docs`                                                                                               | The index of these docs, at the installed version.                                                                                                                                                                                  |
| `tasty:rules/usage`, `tasty:styles`, `tasty:docs`                                                             | Tasty's style rule, its docs, and a tool that prints the CSS a styles object produces. Cookbook's patch points the tool at the site's theme.                                                                                        |
| `glaze:rules/colors`, `glaze:inspect`, `glaze:color`, `glaze:contrast`, `glaze:docs`, the `glaze-theme` skill | Glaze's color rule, docs, and tools. Cookbook's patch says that a site's colors live in `theme.brand` and `theme.palette`, and how to check them. Cookbook replaces Glaze's skill with one that has the steps for a site's palette. |
| `tasty-lint:rules/usage`, `tasty-lint:check`, `tasty-lint:docs`, an edit hook                                 | The Tasty lint plugin's rule and docs, a tool that runs only its rules, and, in Claude Code, a hook that lints each file the agent edits. Cookbook's patch says what the rules need in a site.                                      |

The Tasty, Glaze, and lint units come from the versions that Cookbook depends
on. `npx -y @harnesspm/cli help @tenphi/cookbook` prints Cookbook's rule.
`help @tenphi/glaze`, `help @tenphi/tasty`, and `help @tenphi/eslint-plugin-tasty`
print the rules that Cookbook patches, as agents get them.

## Set it up

The harness ships in `@tenphi/cookbook` 0.34.0 and later: in an older site,
[upgrade Cookbook](./migration.md) first. harnesspm changes `AGENTS.md`,
`CLAUDE.md`, `package.json`, and the lockfile, so set it up only when the person
asks. Run, in the folder with the site's `package.json`:

```sh
npm i -D @harnesspm/cli
npx -y @harnesspm/cli init
```

With pnpm, run `pnpm add -D @harnesspm/cli` and `pnpm exec harnesspm init`.
With Yarn, run `yarn add -D @harnesspm/cli` and `yarn harnesspm init`.
Use harnesspm 0.10.1 or later. Versions before 0.10 cannot replace a skill, and
0.10.0 applies Cookbook's changes to the other workspaces of a monorepo too.

`init` adds a block to `AGENTS.md`, links skills for Claude Code and Codex, and
makes every install run `harnesspm sync`. Commit `AGENTS.md`, `CLAUDE.md`,
`harnesspm.json`, `harnesspm.lock.json`, `package.json`, and the lockfile.
harnesspm's [setup guide](https://harnesspm.tenphi.me/guides/setup) lists every
file it writes.

In a monorepo, install harnesspm and run `init` at the repository root (with pnpm,
`pnpm add -Dw @harnesspm/cli`). Each workspace gets the harness
of its own dependencies, so Cookbook's rule and its changes to the Tasty, Glaze,
and lint rules reach only the workspace of the docs site. Skills are shared by
the whole repository: when another workspace gets Glaze's harness without
Cookbook, directly or through a package such as UI Kit, harnesspm keeps Glaze's
own `glaze-theme` skill and `sync` warns about it. The site's agent then reads
Cookbook's steps in
`node_modules/.harnesspm/pkgs/@tenphi/cookbook/harness/skills/glaze-theme/SKILL.md`,
as the patched Glaze rule says.

## Turn on the tools

Rules, docs, and skills work at once. Scripts and hooks run code, so they stay
off until the person trusts their packages:

| Package                       | Tools                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `@tenphi/tasty`               | `tasty:styles` prints the CSS of a styles object.                                               |
| `@tenphi/glaze`               | `glaze:inspect`, `glaze:color`, and `glaze:contrast` resolve colors and measure contrast.       |
| `@tenphi/eslint-plugin-tasty` | `tasty-lint:check` lints files, and in Claude Code a hook lints each file that the agent edits. |
| `@tenphi/cookbook`            | No tools. Trust lets Claude Code run its `glaze-theme` skill without asking.                    |

Cookbook's own harness runs no code. harnesspm counts its `glaze-theme` skill as
Cookbook's file, though, so until the person trusts `@tenphi/cookbook` too,
Claude Code asks before it runs the skill and a run without a person denies it.
Never add a package
to `trust` yourself: tell the person what each pending tool does, and ask how far
the trust goes. `"pin"` trusts only the installed version and asks again for
each new one, as harnesspm advises for packages that their team does not
control; `true` follows upgrades. When they agree, add the packages to `harnesspm.json` and run
`npx -y @harnesspm/cli sync`:

```json
{
  "trust": {
    "@tenphi/eslint-plugin-tasty": "pin",
    "@tenphi/glaze": "pin",
    "@tenphi/tasty": "pin"
  }
}
```

The tools then run, with a prompt. The lint hook and the allow rules that skip
the prompt wait until the person runs `npx -y @harnesspm/cli approve` in their own
terminal. See harnesspm's
[Trust and safety](https://harnesspm.tenphi.me/guides/trust).

## Check styles and colors with the site's theme

Cookbook builds its Tasty configuration and its Glaze palette from
`docs.config.ts`. The harness ships a module that loads them the same way,
`harness/dev.harnesspm/theme.mjs`, and the patched rules point the Tasty and Glaze
tools at it. Run them from the folder with `docs.config.ts`:

```sh
npx -y @harnesspm/cli run tasty:styles '{"fill":"#surface-2","padding":"2x","preset":"h4"}' --setup @tenphi/cookbook/harness/dev.harnesspm/theme.mjs
npx -y @harnesspm/cli run glaze:inspect @tenphi/cookbook/harness/dev.harnesspm/theme.mjs --color text
```

- `tasty:styles` prints the CSS with the site's tokens, units, presets, and
  states, and flags unknown units, presets, recipes, colors, and tokens. It
  knows the names that Cookbook's components define on their own roots, such
  as `#callout-text`, so a `theme.styles` override can use them.
- `glaze:inspect` prints each color in light, dark, and both high-contrast
  schemes, with its contrast against its base.
- The module reads the `docs.config.*` of the folder you run the tool in. `-C`
  does not change that folder, so `cd` into the site first. Without one, the
  module says so and loads Cookbook's default theme. A site that passes its
  configuration to `cookbook()` in `astro.config.ts`, or names another file
  with `configFile`, gets the defaults too.
- `cookbook doctor` still has the last word on colors. It adds Cookbook's own
  contrast checks to Glaze's floors and fails on any that a theme misses.

## Lint styles in a site

The lint rules recognize Cookbook's styling helpers and the site's theme names
only through the site's `tasty.config.ts`. Without it, `tasty-lint:check` and
the edit hook check nothing in a Cookbook site: `tasty-lint:check` notes each
file you name that it found no styles in, and the edit hook stays quiet. The
tool and the hook need only that file and the `eslint` package, not an ESLint
or oxlint setup of the site's own. When the site has one, as
[Custom components](./custom-components.md#linting-custom-styles) shows, they
follow its rule levels:

- In a Yarn site, add `eslint` as a dev dependency: `yarn add -D eslint`. npm
  and pnpm install it with Cookbook, as a peer of the lint plugin, but Yarn
  does not. Without it, `tasty-lint:check` stops and asks for it, and the edit
  hook tells the agent once per session that it did not lint the edit.
- Build `tasty.config.ts` with `createValidationConfig(docs.theme)` from
  `@tenphi/cookbook/eslint-plugin`, as [Custom theme names](./custom-components.md#custom-theme-names)
  shows. The rules then know the site's palette colors, tokens, units, states,
  presets, and recipes. With `extends: "@tenphi/cookbook"` alone, they report
  a color from `theme.palette` as an unknown token.
- Keep styles in `.js`, `.mjs`, `.ts`, or `.tsx` modules, not in `.astro`
  files. The tool and the hook lint `.ts` modules in TypeScript 7 sites too.
- The rules do not read `theme.styles`, `theme.customStyles`, or
  `theme.recipes` in `docs.config.ts`, and neither `cookbook doctor` nor the
  build checks their values. Check each changed object there with
  `tasty:styles` instead.

## Keep it current

- A full install, such as `npm install` or `pnpm install`, runs
  `harnesspm sync`. After `npm install <package>` or `pnpm add <package>`, run
  `npx -y @harnesspm/cli sync` yourself.
- A Cookbook upgrade brings the harness of the new version. Commit the changed
  `harnesspm.lock.json` and `AGENTS.md` with the upgrade. When it brings a new
  version of a package trusted with `"pin"`, such as Cookbook itself or Tasty,
  Glaze, or the lint plugin, that package's tools and allow rules wait, and
  `npx -y @harnesspm/cli sync --check` fails in CI, until the person runs
  `npx -y @harnesspm/cli approve` in their own terminal. Ask them to, and say so in your
  report.
- To change Cookbook's rule for one project, patch it:
  `npx -y @harnesspm/cli new patch cookbook:rules/usage`. See harnesspm's
  [Change upstream units](https://harnesspm.tenphi.me/guides/change-upstream).
- In CI, `npx -y @harnesspm/cli sync --check` after the install catches a missed sync.
