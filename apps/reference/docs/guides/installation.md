# Installation

Add the complete integration to an Astro project:

```sh
npx astro add tasty-docs
```

The default setup discovers the repository `README.md` and `docs/` tree. It
produces static HTML and shared CSS without hydrating React on content pages.

## Package-first setup

```sh
npm create tasty-docs@latest my-docs -- --package example-package --yes
```

Continue with the [configuration reference](../reference.md).
