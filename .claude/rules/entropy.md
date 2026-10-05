# Entropy rule

**Project entropy is complexity that increases the effort required to understand,
change or use the system.** The rule distinguishes required complexity from
avoidable burden. In Cookbook, consider engine maintainers, developers configuring
or extending a site, documentation authors and people reading the rendered site.
Entropy is an engineering metaphor, not a numeric score or a thermodynamic quantity.

This policy applies to Cookbook repository maintenance and local agent reviews.
The repository's existing validation, styling and public-contract rules still apply.

## Rule

Every task may introduce only complexity justified by its validated requirements.
Prefer a safe reduction of complexity in the affected area when it helps deliver
those requirements.

- Choose the simplest viable design that preserves correctness, accessibility,
  security, reliable builds, demonstrated performance needs and supported public
  contracts. Necessary complexity is valid; fewer lines, files, packages, options
  or visible controls do not by themselves establish simplicity.
- Keep added concepts, state, configuration and special cases proportional to the
  capability delivered. Consider whether a materially simpler design satisfies the
  same requirements; task size and implementation time do not justify complexity.
- Put responsibility in its owning component or layer. Evaluate the whole affected
  path: moving work into another package, dependency, build step, public API or every
  consuming site does not by itself reduce complexity.
- Require a demonstrated benefit for an API or configuration change. Merely
  exchanging one obligation or problem for another without improving the validated
  requirements does not justify a change, even when ongoing complexity is unchanged.
  Include migration work, new failure modes and lost contracts in that judgment.
- Prefer existing patterns and implementations when their contracts fit. Do not
  force different contracts into one abstraction, invent speculative flexibility
  or add indirection merely to remove similar-looking code.
- Simplify safely within the task's scope. Preserve behavior and supported
  customization, and verify refactoring using the applicable repository checks.
  Do not demand unrelated cleanup, a rewrite or removal of compatibility the task
  must preserve.
- Document accepted avoidable complexity through the exception procedure below.
  An exception does not waive correctness, accessibility, security or other
  repository requirements.

During implementation, identify the required capability and constraints before
choosing a design. Before requesting review, be able to explain what complexity
was added or removed, who bears its cost and why it is justified. Routine work
needs no separate report or approval; record material tradeoffs and exceptions
in the task record or PR description.

## Applying the rule in Cookbook

Keep package responsibilities coherent: `@tenphi/create-cookbook` owns project
creation, `@tenphi/cookbook` is the public integration and CLI facade,
`@tenphi/docs` owns configuration, content acquisition and the graph, and
`@tenphi/renderer` owns static rendering and site interactions. Consumers should
not need to compose internals or reproduce engine work to use a supported feature.

Public exports, configuration keys and defaults, CLI behavior, plugin contracts,
component names and sub-element paths affect consuming sites. Preserve supported
contracts unless the task explicitly calls for a justified contract change, with
the applicable migration guidance, documentation and Changeset. Reducing engine
code by making every consumer copy a default tree or implement the same workaround
can increase complexity.

Preserve the styling architecture in `AGENTS.md`: styles belong to their component
owners, customization uses registered partial overrides, and semantic palettes,
tokens, presets and states retain their responsibilities. Style evaluation stays
on the build/server side and produces static CSS. Removing customization hooks or
moving Tasty/Glaze configuration into the browser is not simplification. A verified
upstream limitation can justify a scoped workaround, but the limitation itself is
not acceptance.

Documentation authors should not maintain parallel copies of source content.
Keep repository Markdown read-only during the content pipeline, generate packaged
documentation from its owners, and preserve the distinction between Cookbook's
runtime version and locked documentation-source versions. Required source safety,
diagnostics, reproducibility and output validation remain valid constraints.

For rendered UX and authoring workflows, complexity depends on the intended
audience's goal and the concepts, decisions, steps and information needed to
complete it. Use familiar navigation, search, appearance and control semantics.
Hiding a frequently needed action or removing a helpful label can increase burden
even when the screen looks simpler. Preserve keyboard access, focus, responsive
behavior, localization and supported appearance modes. Necessary translations and
documented extension surfaces are not a burden merely because they add files.

## Entropy change level

The change level describes ongoing effort before and after the change in the
component, package, public API, configuration, authoring/build workflow or reader
flow it affects. Include necessary effects on owners and consumers, but judge
magnitude relative to that context, not the whole project. Assess materially
different directions separately; do not average them away or offset an unjustified
burden with unrelated cleanup.

| Level                   | Meaning within the affected context                                                  |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Neutral                 | No material change in ongoing effort to understand, change or use the affected path. |
| Slightly Increased      | A small, straightforward addition to ongoing effort.                                 |
| Moderately Increased    | Noticeably more reasoning, coordination or decision-making on relevant tasks.        |
| Significantly Increased | The affected path becomes substantially harder to understand, change or use.         |
| Slightly Decreased      | A small, straightforward reduction in ongoing effort.                                |
| Moderately Decreased    | Noticeably less reasoning, coordination or decision-making on relevant tasks.        |
| Significantly Decreased | The affected path becomes substantially easier to understand, change or use.         |

These are qualitative judgments supported by concrete before/after scenarios, not
numeric scores or count thresholds. Migration costs and demonstrated benefits are
separate from ongoing effort. A level does not determine severity or approval:
Neutral can still require changes for an API/configuration change without a
demonstrated benefit, and an increase can be justified or explicitly accepted.
The level describes the current implementation; a promised follow-up does not make
its present burden Neutral or Decreased.

## Developer exceptions

A developer may explicitly accept a scoped complexity tradeoff in task instructions,
a PR description or a PR comment. Agents may propose and document exceptions and
must honor existing developer acceptance that covers the change. They must not
infer acceptance from silence or approve their own exception.

Possible reasons include a verified limitation in Tasty, Glaze, Astro or another
dependency, a platform constraint, supported compatibility or an urgent fix where
a broader change would add disproportionate risk. First consider a safe fix in the
owning layer. A dependency issue or deadline alone does not exempt the change.

A concrete follow-up task can support acceptance of a bounded, temporary increase
when the required refactoring is too large or risky for this task. Record its
reference, the complexity it will remove, completion criteria, the reason for
deferral and the developer's scoped acceptance. A tracked issue or a defined task
in a developer-accepted plan can supply this evidence; a vague cleanup promise
cannot. The acceptance record must describe the current increase and pending
follow-up. Reassess if the task is cancelled or the accepted scope changes.

Record:

- **Cause and evidence:** the concrete limitation or constraint and an existing
  issue reference when available.
- **Alternative and cost:** the simpler design considered and why this task cannot
  use it.
- **Scope and acceptance:** the exact workaround or tradeoff and the developer's
  acceptance reference.
- **Removal condition:** the upstream fix, version or event permitting removal of
  a temporary workaround. A permanent constraint needs a durable rationale rather
  than an invented cleanup promise.

An accepted exception covers only that tradeoff. Later expansion requires
reassessment. It does not waive other repository rules or their separately required
evidence; for example, a narrow styling compatibility ignore still needs the
explanation and browser verification required by `AGENTS.md`.

## Background

These sources motivate the policy, rather than provide a formula for scoring
changes. They are attribution only, not required reading. Agents must not search
for, retrieve or read the cited works during implementation or review; this policy
is self-contained.

- Lehman and colleagues, Metrics and Laws of Software Evolution: evolving software
  requires deliberate work to maintain or reduce complexity.
- Frederick P. Brooks Jr., No Silver Bullet — Essence and Accident in Software
  Engineering: distinguish difficulty inherent in the problem from difficulty in
  its implementation.
- John Ousterhout, A Philosophy of Software Design: investigate change amplification,
  cognitive load and hard-to-discover dependencies.
- John Sweller, Jeroen J. G. van Merriënboer and Fred Paas, Cognitive Architecture
  and Instructional Design: 20 Years Later: distinguish inherent learning difficulty
  from burden introduced by presentation. Applying this distinction to developer
  experience and UX is this policy's design interpretation.
