---
"@tenphi/renderer": patch
---

Use the official Tasty ESLint plugin 1.17.1 for code validation and published lint configurations. It avoids false runtime-mutation warnings for style objects constructed once at module load, while retaining checks inside functions and instance fields.
