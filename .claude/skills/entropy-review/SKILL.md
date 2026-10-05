---
name: entropy-review
description: Review Cookbook changes for justified complexity in code, public APIs, configuration, documentation workflows and UX. Use for a focused local Entropy pass, including a read-only subagent.
metadata:
  version: "1.0.0"
---

# Cookbook Entropy review

Apply [the Entropy policy](../../rules/entropy.md) to the requested change and
return the assessment in this conversation. The policy defines requirements,
change levels and exceptions; this skill defines the review procedure.

For a focused pass, use the workflow below. In a broader local review, apply the
assessment, evidence limits and reporting sections to that review's scope and
revision. Existing implementation validation and broader review duties still apply.

## Focused workflow

1. Use the requested files, diff or branch/base. By default review staged, unstaged
   and relevant untracked changes; if clean, compare with `origin/main...HEAD`.
   State scope and revision/base. Diff and supporting sources must match that
   revision. Supplied artifacts are sufficient; no fetch or environment preparation
   is required.
2. Read the policy, relevant owners, consumers and contracts. Use task requirements,
   constraints, existing verification evidence and recorded developer acceptance.
   When delegating, supply this context and the exact diff/base to the subagent.
3. Work read-only from repository sources. Do not edit files, post comments, install
   dependencies, build, start services, run tests or perform probes. Inspect tests
   as source and use supplied verification results where useful. This pass does not
   certify unexamined behavior or waive implementation checks.

## Assessment

Review complexity introduced or amplified by the requested change, including API
or configuration changes without a demonstrated benefit. Read owners and consumers
for context without requiring migrations or cleanup of untouched code.

1. Identify validated requirements and constraints. If missing context prevents
   judging a design, state the uncertainty instead of inventing requirements.
2. Identify added and removed complexity across implementation, public contracts,
   consumer configuration, authoring/build workflows and applicable UX. Use the
   policy's [change levels](../../rules/entropy.md#entropy-change-level) for each
   materially distinct affected context, with a concrete before/after scenario.
3. For each candidate, name who bears the cost and a maintenance, authoring or
   reader scenario. Check whether the complexity is required, whether an existing
   abstraction fits and whether a simpler alternative preserves the requirements.
   Check demonstrated API/configuration benefits against new obligations, problems
   and migration cost even when the level is Neutral. Keeping the existing contract
   can be the smallest improvement.
4. Check recorded developer exceptions and required follow-up tasks. Respect their
   scope and continue reviewing the rest of the change. Distinguish a proposed
   exception from developer acceptance. Do not count deferred refactoring as a
   completed reduction or treat an Entropy exception as waiving another rule.

These signals guide investigation; none is an automatic violation:

| Signal                    | Code, APIs, configuration and authoring                                                                              | Reader UX                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Additional concepts       | New abstraction, configuration mode, plugin boundary or build step that maintainers or site authors must learn.      | New terminology, choices or interaction patterns.                                |
| Fragmented responsibility | Duplicate configuration/state, parallel implementations or coordinated edits across packages and consuming sites.    | Multiple places to navigate, search or control the same setting.                 |
| Hidden rules              | Surprising defaults, implicit build order, undocumented option combinations or rollout assumptions.                  | Invisible prerequisites or inconsistent behavior between comparable controls.    |
| Extra work                | Repeated consumer workarounds, copied default style trees, manual generated-file edits or redundant authoring steps. | Extra navigation, repeated input or information to remember between steps.       |
| Unnecessary flexibility   | Options, recipes or extension points without an actual supported use case.                                           | Rare choices competing with the common path without helping the intended reader. |

For public contracts, inspect the source types/schema, facade exports, CLI/plugin
entrypoints, style registries and representative consumers. Read applicable
repository-native documentation as contract evidence. Generated packaged docs are
supporting context; fixes belong in their source. For dependencies, use recorded
versions and available source/API references; missing installed docs or declarations
do not require an install for a focused review. For UX, name the audience and goal,
then compare concepts, decisions, steps and information the user must remember.

## Evidence limits

Actively try to disprove candidates using source evidence. A concrete structural
or contract burden can be established without execution. Missing requirements,
dependency contracts or acceptance records may prevent a conclusion even with a
complete diff.

Do not present source-inferred rendering, accessibility, performance, build output
or task difficulty as observed behavior. Screenshots alone cannot prove difficulty.
If a candidate depends on unavailable evidence, mark the claim unverified, name
what would settle it and omit an established defect finding. Unexamined behavior
outside the Entropy assessment does not prevent a scoped conclusion; missing
evidence that could change that conclusion does.

## Reporting

State scope and revision/base, then report
`Entropy change: <level> — <affected context>; <brief rationale>` for each
materially distinct context. If the evidence does not support a level, mark the
assessment unverified and name the missing context. Keep migration cost and benefits
separate from ongoing effort.

Report only established findings, most severe first. Each needs a file and line,
the policy rule, concrete burden, evidence and the smallest verified improvement.
Describe a tradeoff awaiting acceptance as a design decision, not a behavior defect.
Include material accepted exceptions, required follow-ups and verification limits.

Do not block on vague entropy claims, personal preference, raw counts or speculative
future maintenance. Severity follows the demonstrated consequence. Drop refuted
candidates and omit routine passed checks; do not claim a pass for unexamined behavior.

A focused review concludes:

- `pass`: no established violation or remaining tradeoff requiring an exception,
  and evidence supports the scoped conclusion. A justified increase can pass.
- `changes needed`: an avoidable burden or API/configuration change without a
  demonstrated benefit remains unresolved, or its proposed exception lacks acceptance.
- `exception accepted`: all remaining tradeoffs requiring an exception have recorded
  developer acceptance, with no other violation or material verification gap.
- `unverified`: missing context or evidence prevents a conclusion.

In a broader local review, include the brief change-level assessment even when
there are no findings. Combine Entropy findings, exceptions, follow-ups and limits
with the other results; do not produce a duplicate report.
