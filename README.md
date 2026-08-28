# Tasty Docs

Static, repository-native documentation built with Astro, Starlight, Tasty,
and Glaze.

[Read the documentation](https://tastydocs.tenphi.me) or browse the
[repository-native source](docs/index.md).

## Quick start

```sh
npm create tasty-docs@latest my-package-docs -- --package your-package
```

For an existing Astro project:

```sh
npx astro add tasty-docs
```

The workspace contains four fixed-version packages:

- `create-tasty-docs` — package-first project creator.
- `tasty-docs` — the public Astro integration and command facade.
- `@tenphi/docs` — configuration, package acquisition, content graph, and diagnostics.
- `@tenphi/starlight` — the official static renderer and theme.

Node.js 22.14 or newer is required.
