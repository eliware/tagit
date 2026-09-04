# Command behavior

## `tagit notes`

`notes` reports changes since the latest tag, summarizes commits and changed
files, suggests a release level, and gives follow-up instructions. It is
read-only and does not change versions, files, commits, tags, or registries.

## `tagit preflight`

`preflight` aggregates release-readiness blockers. It checks repository state,
metadata, required documentation and workflow policy, the target project's
declared `npm test` harness, and exact-commit CI evidence. A dirty worktree,
missing evidence, stale CI, failed CI, or cancelled required check blocks handoff.

Windows CI is optional. If a Windows workflow is present, its required jobs
must pass.

`--ignore-100x4` is a documented workflow waiver for the coverage threshold.
It does not waive any other check. The decision to use it is an organizational
DevOps decision; Tagit does not authenticate or enforce that decision.

## `tagit push`

`push` pushes commits that already exist on the current branch, ignores
untracked files, and reports available exact-commit CI links. It does not stage,
commit, tag, publish, or wait for CI.

`tagit push --dry-run` performs no push and no CI lookup.

## `tagit release --version X.Y.Z`

The release command requires an explicit version matching repository metadata.
It runs preflight, creates or reuses the matching release tag, and pushes only
that tag. It does not rewrite files or create a release commit.

## `tagit release-wait`

`release-wait` resolves the latest release tag, monitors its CI, and verifies
publication in applicable registries. It fails for missing, stale, mismatched,
incomplete, or failed evidence. Registry propagation checks are bounded.

## Help and errors

Help is concise and actionable. Invalid commands, options, versions, and
argument combinations exit nonzero without performing release operations.
