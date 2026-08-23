# Release Notes

## Unreleased

- Require an explicit `--bump X.Y.Z` version for release and dry-run invocations.
- Remove automatic version incrementing from the CLI release flow.

- Require an explicit target version for every release or dry-run invocation.
- Remove automatic version bumping from the CLI release flow.

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
