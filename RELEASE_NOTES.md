# Release Notes

## 6.2.0

### Changed

- Updated TagIt to Convention v6.2.
- Added committed Prettier configuration and `format`/`format:check` scripts.
- Clarified that formatter validation remains owned by `@eliware/test`; TagIt
  invokes the authoritative `npm test` command without duplicating it.

## 2.5.0

### Added

- Added stricter validation for release versions, GitOps pin arguments, image
  references, and malformed CI/GHCR responses.
- Added regression coverage for command parsing, CI selection, tag refs, and
  invalid version inputs.

### Changed

- Improved exact-HEAD CI selection and release verification across GitHub tag
  reference formats.
- Changed release-wait polling to use up to 30 ten-second intervals for CI,
  npm, and GHCR visibility, without an initial delay.
- Added read-only GitOps overlay validation during dry runs.
- Improved upstream merge/push error handling and release-file restoration.
- The current development metadata uses the shared test harness
  `@eliware/test` `^6.0.1`.
- Strengthened strict preflight metadata, package allowlist, repository identity,
  release-notes, and publication-workflow consistency checks.
- Added explicit `.tagit-exceptions.json` support for genuinely inapplicable
  standard repository paths.

## 2.4.2

### Changed

- Clarified that TagIt’s Knit configuration is validation-only and does not
  deploy applications or modify production GitOps state.
- Documented the required GitOps staging pull-request workflow for deployable
  consumer projects.

## 2.4.1

### Fixed

- Fixed waived preflight test reporting so projects using
  `--ignore-100x4` run their declared `npm test` script and report successful
  execution correctly, including when coverage is intentionally ignored.
- Preserved captured failure output for genuinely unsuccessful test commands.

## 2.4.0

### Added

- Added safe `--dry-run` handling for push and DevOps release workflows.
- Added explicit CLI guidance for project-owner and DevOps command boundaries.

### Changed

- Migrated process execution paths to shell-free, cross-platform runners.
- Included `RELEASE_NOTES.md` in the published package contents.
- Expanded regression coverage for dry-run behavior and Windows execution.

## 2.3.0

### Changed

- Made release version updates transactional when a release step fails.
- Expanded strict preflight validation for branch, metadata, required files, and tracked secret-looking files.
- Clarified that project owners may use only notes, push, and preflight; DevOps owns release and release-wait.
- Excluded tests and internal deployment guidance from the npm package.
- Added explicit package exports, package-file allowlisting, public publish
  metadata, and a cross-platform typecheck gate.
- Expanded README setup, API, security, operations, and validation guidance.
- Added a DevOps-only `--ignore-100x4` coverage waiver for preflight and release.

## 2.2.2

### Changed

- Added the `tagit push` command for pushing existing commits without staging
  or committing files.
- Added bounded polling so push reports direct workflow and job links after
  GitHub creates the CI run.
- Expanded the agent-facing help overview with the complete project-owner to
  DevOps release handoff.

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

## 1.1.19

- Release tags use the `v<version>` format, for example `v1.1.19`.

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
