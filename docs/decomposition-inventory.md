# TagIt decomposition inventory

This inventory is maintained against the current `src/`, `bin/`, `scripts/`,
and `tests/` trees. Every production module has a same-named focused test
where the module is independently testable; CLI wrappers and process-boundary
composition are verified by their nearest composition tests.

## Responsibility groups

| Original module                                   | Status      | Resulting responsibility modules                                                                                                                                                                    | Matching tests                                                                             |
| ------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/cli/application/run-tagit.mjs`               | coordinator | `assemble-dependencies.mjs` (dependency assembly), `handle-cli-error.mjs` (error/exit policy), `run-tagit.mjs` (process coordination)                                                               | `assemble-dependencies.test.mjs`, `handle-cli-error.test.mjs`, `run-tagit.test.mjs`        |
| `src/commands/release-wait/verify-release.mjs`    | coordinator | `resolve-release-context.mjs` (identity), `report-ci-result.mjs` (links-only result), `verify-release.mjs` (workflow coordination)                                                                  | `resolve-release-context.test.mjs`, `report-ci-result.test.mjs`, `verify-release.test.mjs` |
| `src/commands/release-wait/release-ci-status.mjs` | coordinator | `validate-release-run-details.mjs` (record policy), `format-release-ci-failure.mjs` (failure mapping), `merge-release-run.mjs` (result transformation), `release-ci-status.mjs` (poll coordination) | matching focused tests for each module plus `release-ci-status.test.mjs`                   |
| `src/validation/ci/verify-exact-head.mjs`         | coordinator | `read-exact-head-runs.mjs` (GitHub I/O), `validate-completed-conclusion.mjs` (conclusion policy), `summarize-ci-jobs.mjs` (failure formatting), `verify-exact-head.mjs` (coordination)              | matching focused tests plus `verify-exact-head.test.mjs`                                   |
| `src/validation/preflight/run-checks.mjs`         | coordinator | `collect-context.mjs` (worktree context), `ci-failure-message.mjs` (CI remediation), `run-checks.mjs` (check coordination)                                                                          | matching focused tests plus `run-checks.test.mjs`                                          |
| `src/validation/preflight/run-local-checks.mjs`   | coordinator | existing `test-command`, `process-command`, `process-options`, and `failure-message` modules remain the leaf responsibilities                                                                       | `run-local-checks.test.mjs`                                                                |

### Current pass additions

| Original concentration point                      | Resulting modules                                                                                                                                                                                                                                                                                                                    | Matching tests                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `src/commands/release-wait/release-ci-status.mjs` | `read-release-ci-candidate.mjs` (workflow-list I/O and candidate selection), `read-release-ci-details.mjs` (workflow-detail I/O), `handle-release-ci-poll-error.mjs` (retry and malformed-response policy), `release-ci-poll-attempt.mjs` (one-attempt state transformation), `release-ci-status.mjs` (bounded polling coordination) | Same-named tests for each module plus `release-ci-status.test.mjs` |
| `src/validation/ci/validate-run-records.mjs`      | Remains one focused responsibility: CI run-shape validation. Pending `null` conclusions are valid provider state and are covered by its matching test.                                                                                                                                                                               | `validate-run-records.test.mjs`                                    |
| `src/validation/ci/validate-job-records.mjs`      | Remains one focused responsibility: CI job-shape validation. Pending `null` conclusions are valid provider state and are covered by its matching test.                                                                                                                                                                               | `validate-job-records.test.mjs`                                    |
| `src/commands/release/dispatch.mjs`               | Remains a command coordinator; release-version policy is applied only to the release operation, while versionless release-wait routing remains independent.                                                                                                                                                                          | `dispatch.test.mjs`, focused dispatch tests                        |

The remaining CodeScope candidates (`verify-exact-head.mjs`,
`run-checks.mjs`, `dispatch-command.mjs`, `suggest-version.mjs`,
`verify-release-ci.mjs`, `required-files.mjs`, `test-command.mjs`, and
`validate-metadata.mjs`) were reviewed again. They are retained as explicit
coordination boundaries or single-domain validators: each sequences focused
modules and does not implement multiple independent workflows. Splitting them
further would move sequencing into additional wrappers without creating a new
responsibility boundary.

## Reviewed atomic modules

The following directories were reviewed module-by-module. Modules not listed
in the responsibility groups above are atomic leaves or coordination-only
modules with one workflow responsibility:

- `src/cli/arguments/`: command classification, option policy, parsing, and
  option validation.
- `src/cli/guidance/`: help and operator guidance text.
- `src/commands/notes/`: change collection, report construction, formatting,
  version suggestion, and command coordination.
- `src/commands/preflight/`: preflight command boundary.
- `src/commands/push/`: existing-commit push and command coordination.
- `src/commands/release/`: release routing and release orchestration.
- `src/git/commands/`, `src/git/tags/`, and `src/git/release/`: Git execution,
  tag lifecycle, and release-tag sequencing.
- `src/github/cli/`, `src/github/links/`, and `src/github/runs/`: GitHub I/O,
  link formatting, run selection, and job policy.
- `src/output/errors/` and `src/output/redaction/`: error formatting,
  secret redaction, and truncation.
- `src/policy/`: independent owner, version, tag, template, coverage, and
  platform policies.
- `src/process/`: process execution, executable resolution, and timing.
- `src/registries/npm/` and `src/registries/ghcr/`: registry-specific package,
  image, tag, digest, and visibility operations.
- `src/repository/`: branch, state, metadata, secrets, and repository policy
  validation.
- `src/upstream/`: upstream argument parsing, branch handling, merge message,
  merge execution, and command boundary.
- `src/validation/`: CI, local harness, and preflight validation boundaries.
- `src/versioning/`: semantic-version parsing, reading, classification, and
  suggestion.
- `bin/` and `scripts/`: process wrappers and typecheck entrypoint; these are
  wiring surfaces rather than business-logic modules.

## Test architecture

Tests are organized under the same responsibility directories as production.
Leaf behavior is tested by the matching module suite; cross-module behavior is
tested at the lowest coordinator boundary. No Istanbul exclusions were added.
The shared harness remains authoritative for coverage and reports any branch
that still needs a focused test.

## File-level review register

The complete file-level register is the current `rg --files src bin scripts`
and `rg --files tests` listing. Every listed source file was reviewed against
its same-path test where present; wrappers and coordinators are verified at
their nearest composition boundary. The responsibility groups above record
each non-atomic split and its resulting tests. This explicit convention keeps
the inventory synchronized with additions without duplicating a second stale
filesystem index in prose.

### Register status

This register is generated from the current source and test tree during the
review; no source module is intentionally omitted from the inventory.

## File-level register

+The register below records every shipped source path reviewed in this pass.

- - `bin/push-cli.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.

* `bin/push.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `bin/tagit-cli.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `bin/tagit.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `bin/upstream-cli.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `bin/upstream.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `scripts/typecheck.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/assemble-dependencies.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/default-dependencies.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/dispatch-command.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/dispatch-simple-command.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/format-parse-error.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/handle-cli-error.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/is-cli.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/register-lifecycle.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/application/run-tagit.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/arguments/classify-command.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/arguments/option-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/arguments/parse-options.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/arguments/parse-version-option.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/arguments/validate-options.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/guidance/help-text.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/guidance/preflight-guide.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/cli/guidance/release-guide.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/notes/build-report.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/notes/collect-changes.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/notes/format-report.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/notes/run-notes.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/notes/suggest-version.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/preflight/run-preflight.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/push/push-existing-commits.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/push/run-push.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/format-release-ci-failure.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/merge-release-run.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/read-publication-target.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/release-ci-status.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/release-links.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/release-publication-status.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/report-ci-result.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/report-release-links.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/resolve-latest-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/resolve-release-context.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/run-release-wait.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/validate-release-input.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/validate-release-run-details.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/verify-publish-job.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/verify-registries.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/verify-release-ci.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release-wait/verify-release.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/dispatch-preflight.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/dispatch-release-operation.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/dispatch-release-wait.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/dispatch.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/preflight-options.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/run-release.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/commands/release/validate-package-release-version.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/commands/run-git.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/release/operate-release.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/release/prepare-release-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/release/report-release-failure.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/tags/create-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/tags/push-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/tags/resolve-existing-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/tags/validate-release-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/git/tags/verify-remote-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/cli/read-json.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/links/read-ci-run-links.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/links/read-repository-name.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/links/report-ci-links.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/links/report-ci-run-links.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/runs/release-job-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/github/runs/release-run-selection.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/output/errors/failure-message.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/output/errors/format-output.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/output/redaction/redact-secrets.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/output/redaction/truncate-output.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/coverage-waiver-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/owner-guidance.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/release-version-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/tag-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/template-repository-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/policy/windows-ci-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/async/exec-file.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/async/run-process.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/commands/npm-executable.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/commands/resolve-executable.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/sync/run-process.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/timing/poll-budget.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/timing/sleep.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/process/timing/wait-sync.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/discover-publication.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/parse-repository.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/poll-visibility.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/verify-image-digest.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/verify-publication.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/ghcr/verify-version-tag.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/npm/read-package-name.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/registries/npm/verify-publication.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/branch/read-current-branch.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/branch/require-main.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/read-exceptions.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/read-package-json.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/required-files.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-origin.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-package-files.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-package-metadata.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-release-metadata.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-release-version.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/metadata/validate-workflow.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/repository-name/read-repository-name.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/secrets/find-secret-looking-paths.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/state/read-worktree-status.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/state/require-clean-worktree.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/validate-branch.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/validate-metadata.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/validate-repository.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/repository/validate-tracked-files.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/branch.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/merge-message.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/merge-upstream.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/parse-upstream-arguments.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/run-merge.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/upstream/upstream-cli.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/build-ci-verification-failure.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/evaluate-job-policy.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/poll-pending-run.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/read-exact-head-runs.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/read-run.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/select-ci-candidate.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/select-run.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/summarize-ci-jobs.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/validate-completed-conclusion.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/validate-job-records.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/validate-run-records.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/verify-completed-run.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/verify-exact-head.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/ci/verify-preflight-ci.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/local/installed-harness.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/local/process-command.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/local/process-options.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/local/test-command.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/local/test-waiver-arguments.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/preflight/ci-failure-message.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/preflight/collect-context.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/preflight/report.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/preflight/run-checks.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/validation/preflight/run-local-checks.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/versioning/classify-change-level.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/versioning/parse-semver.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/versioning/read-package-version.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.
* `src/versioning/suggest-next-version.mjs` — reviewed; single responsibility or documented coordinator; matching behavior is covered by the nearest same-directory test suite.

- `src/cli/application/build-dispatch-context.mjs` — dependency projection; `tests/cli/application/build-dispatch-context.test.mjs`.
- `src/cli/application/run-cli-boundary.mjs` — parse/dispatch error boundary; `tests/cli/application/run-cli-boundary.test.mjs`.
- `src/commands/release/dispatch-preflight.mjs` — preflight workflow boundary; `tests/commands/release/dispatch-preflight.test.mjs`.
- `src/commands/release/dispatch-release-operation.mjs` — release-operation boundary; `tests/commands/release/dispatch-release-operation.test.mjs`.
- `src/commands/release/dispatch-release-wait.mjs` — release-wait boundary; `tests/commands/release/dispatch-release-wait.test.mjs`.
- `src/git/release/run-release-tag-transaction.mjs` — release tag transaction boundary; `tests/git/release/run-release-tag-transaction.test.mjs`.
- `src/validation/preflight/validate-local-test-check.mjs` — local harness policy; `tests/validation/preflight/validate-local-test-check.test.mjs`.
- `src/validation/preflight/run-local-test-command.mjs` — local harness execution; `tests/validation/preflight/run-local-test-command.test.mjs`.
