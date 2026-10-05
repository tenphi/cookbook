# Cookbook

Static, repository-native documentation built with Astro,
[Tasty](https://tasty.style), and [Glaze](https://glaze.tenphi.me).

[Read the documentation](https://cookbook.tenphi.me) or browse the
[repository-native source](docs/index.md).

Before customizing a site, read the [customization rules](docs/customization-rules.md).
For agent-assisted setup and publishing, see the [AI agent guide](docs/ai-agents.md).
The published `@tenphi/cookbook` package includes these docs and versioned Tasty
and Glaze references for local use by consumers and coding agents.

## Quick start

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

Use `--source .` to document an existing repository or `--package your-package`
to document a published npm artifact.

For an existing Astro project:

```sh
npx astro add @tenphi/cookbook
```

The workspace contains four fixed-version packages:

- `@tenphi/create-cookbook` — package-first project creator.
- `@tenphi/cookbook` — the public Astro integration and command facade.
- `@tenphi/docs` — configuration, package acquisition, content graph, and diagnostics.
- `@tenphi/renderer` — the official static renderer and theme.

Node.js 22.19 or newer is required.

## Local agent review

For work on this repository, follow [the repository instructions](AGENTS.md) and
[the Entropy rule](.claude/rules/entropy.md). The policy covers code, public APIs,
configuration, documentation workflows and UX; the review skills define the
assessment and report format.

Use `$review` in Codex or `/review` in Claude Code for a local review against
the repository rules, including Entropy. Use `$entropy-review` or
`/entropy-review` for a focused pass. Both agents use the same skill sources.

A focused review can run in a read-only subagent with the diff, relevant sources
and task requirements/accepted exceptions. It needs no dependency installation,
services, tests or probes; claims needing unavailable runtime evidence remain
unverified. Implementation checks still follow [the contributing guide](CONTRIBUTING.md).
