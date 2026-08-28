---
title: Configuration reference
description: Configure sources, navigation, theme, search, and strict builds.
---

## Source configuration

Use repository files, globs, or locked npm package sources. Every source gets a
canonical route before links are transformed.

## Brand colors

The `theme.brand.from` value is preserved when it already reaches APCA Lc 45
against the page surface and adjusted only as far as required otherwise.

## Diagnostics

Run `tasty-docs doctor` to validate routes, links, fragments, assets, navigation,
configuration, and theme contrast.
