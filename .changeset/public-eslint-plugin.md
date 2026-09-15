---
"@tenphi/cookbook": minor
"@tenphi/starlight": minor
---

Re-export the Tasty ESLint plugin, recommended and strict rule maps, and a
Cookbook validation preset through `/eslint-plugin`. Document and verify
consumer style linting with ESLint and oxlint, including shared tokens,
responsive aliases, typography presets, and Cookbook styling imports.
Support `extends: "@tenphi/cookbook"` and `extends: "@tenphi/starlight"` so
consumers can add theme names without copying the preset's arrays.
