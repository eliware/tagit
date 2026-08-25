# Release Notes

## 2.1.0

- Split release execution from release verification: `release` pushes and
  prints links; `release-wait` monitors CI and confirms registries.

This release aligns the CLI with the current two-stage, AI-agent-friendly
workflow: inspect with `notes`, validate with `preflight`, then release only
an explicitly selected version.

### Added

- Added read-only `tagit notes` reporting for changes since the latest tag.
- Added post-release CI, npm, and GHCR visibility verification with review links.
- Added bounded release-check execution with actionable timeout guidance.

### Changed

- Preflight now aggregates independent failures and reports concise, bounded diagnostics.
- Dirty worktrees explicitly block CI validation until the changes are committed and pushed.
- Template repositories using `.notag` still run all preflight gates but skip versioning, tagging, and publishing.
- CLI entrypoints now use dedicated executable wrappers.
- Updated `@eliware/test` to `2.0.0`.

### Verification

- Tests: 100×4 coverage.
- Lint: 0 warnings.
- Release notes and verification paths are covered by tests.
- Package metadata and lockfile report version `2.1.0`.

## 1.1.24

- Run required CI validation on both Ubuntu and Windows for every `main` push.
- Keep npm publication gated to successful `v*` tag workflows.

## 1.1.23

- Require an explicit `--bump X.Y.Z` version for release and dry-run invocations.
- Remove automatic version incrementing from the CLI release flow.
- Update CLI and release documentation to reflect explicit version selection.

## 1.1.22

- Made Git commit messages safe for Windows shells during releases.
- Added Windows-compatible GitOps path test coverage.
- Updated documentation for Windows and Linux development environments.

## 1.1.21

- Reassert package and lockfile root versions after npm dependency updates.
- Prevent releases from committing or tagging when release metadata drifts.
- Add regression coverage for rewritten and already-matching package metadata.

Verification:

- `npm test` (100% coverage across statements, branches, functions, and lines)
- `npm run lint`

## Unreleased

- Release tags now use the `v<version>` format, for example `v1.1.19`.

## 1.1.18

- Added a non-destructive `--dry-run` release preview with test/build checks.
- Added `--help`, explicit `-y`/`--yes` release confirmation, and `-b`/`--bump` target versions.
- Completed CLI and release-operation test coverage at 100% across all metrics.

## 1.1.17

- Added `tagit --version` and `tagit -v` commands.
- Version queries now report the installed package version without starting a release.
- Preserved the existing automated dependency, test, build, commit, and tag workflow.

## 1.1.16

- Added an initial `npm install` step before dependency updates.
- Added automatic `npm outdated --json` inspection.
- Outdated npm dependencies are upgraded to their `@latest` versions.
- Existing `npm update`, test, and build verification steps remain enabled.
## Unreleased

- Add informational SemVer suggestions based on non-generated changes since
  the latest tag; explicit release versions remain required.
## 2.2.0

### Added

- Split release execution from verification with `tagit release-wait`.
- Release now prints workflow and job links immediately after pushing.
- Release-wait verifies npm/GHCR publication and reports the GHCR image digest.

### Changed

- Release monitoring is resumable and no longer requires one uninterrupted
  release command session.
