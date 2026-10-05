---
name: review
description: Review local Cookbook changes against repository rules, supported contracts and the Entropy policy. Use for code review, UI review or implementation self-review in this repository.
metadata:
  version: "1.0.0"
---

# Cookbook local review

Review the requested change and return findings in this conversation. Do not edit
files, commit, push or post comments. This workflow covers repository maintenance;
the consumer project's own rules govern work in a generated Cookbook site.

1. Use the requested files, diff or branch/base. By default review staged, unstaged
   and relevant untracked changes; if clean, use `origin/main...HEAD`. State the
   scope and revision/base and use matching sources for context.
2. Read [the repository rules](../../../AGENTS.md) and
   [the contributing guide](../../../CONTRIBUTING.md). Apply rules in their actual
   scope, with their documented exceptions. For affected public contracts, inspect
   source types/schema, exports, configuration/defaults and representative consumers,
   plus relevant guides in `docs/`. Use
   [the architecture guide](../../../docs/architecture.md) when package or rendering
   responsibilities change; it is context, not a separate owner-approval protocol.
3. Trace each candidate through its owning implementation and callers. Check
   correctness and supported behavior, package ownership, style customization,
   build/browser boundaries, source/generated-doc ownership, and required release
   or migration updates where relevant. Use existing verification results and tests
   as source. Do not bootstrap an environment just to review; if a claim requires
   unavailable runtime evidence, report the limit rather than inventing a defect.
   Implementation must still run applicable validation, including the repository's
   zero-warning lint requirement. Review does not certify checks it did not examine.
4. Apply [the Entropy policy](../../rules/entropy.md) using the assessment, evidence
   limits and reporting sections of
   [the focused review skill](../entropy-review/SKILL.md) to the same scope/revision.
   Reuse a supplied assessment only if it covers that scope and revision; otherwise
   perform the source pass or delegate with the diff, requirements and acceptance
   records. An Entropy pass supplements the other rule checks.
5. Return one concise report, most severe findings first. Each finding needs a file
   and line, applicable rule or contract, concrete failure/burden, verified evidence
   and the smallest fix. Include the Entropy change-level assessment even when there
   are no findings, material exceptions/follow-ups and verification limits. Drop
   refuted candidates and unsupported stylistic preferences. If no violations were
   established, say so without claiming unavailable runtime checks passed.
