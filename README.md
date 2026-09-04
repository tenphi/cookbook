# Cookbook

Static, repository-native documentation built with Astro, Starlight,
[Tasty](https://tasty.style), and [Glaze](https://glaze.tenphi.me).

[Read the documentation](https://cookbook.tenphi.me) or browse the
[repository-native source](docs/index.md).

## Quick start

```sh
npm create @tenphi/cookbook@latest my-package-docs -- --package your-package
```

For an existing Astro project:

```sh
npx astro add @tenphi/cookbook
```

The workspace contains four fixed-version packages:

- `@tenphi/create-cookbook` — package-first project creator.
- `@tenphi/cookbook` — the public Astro integration and command facade.
- `@tenphi/docs` — configuration, package acquisition, content graph, and diagnostics.
- `@tenphi/starlight` — the official static renderer and theme.

Node.js 22.14 or newer is required.
