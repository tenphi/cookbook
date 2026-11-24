---
"@tenphi/create-cookbook": patch
---

New sites also get a `CLAUDE.md` that imports `AGENTS.md`. Claude Code reads `AGENTS.md` only when no `CLAUDE.md` exists in its folder or above, so a site created with `--source` inside a repository that has one lost its agent instructions in Claude Code. An existing `CLAUDE.md` is kept.
