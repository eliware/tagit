# Release Notes

## 11.0.0 — 2026-10-03

### Added

- Align repository metadata, contributor guidance, structured directives, documentation, and package contents with the v11 general, application, CLI, and npm-published conventions.
- Validate v11 `ci.yaml` and `publish.yaml` workflow paths and classify Ubuntu and Windows CI from configured runner labels rather than job names.

### Changed

- Set the package version to 11.0.0, update dependencies and Jest configuration, and use the exact npm files allowlist and npm Trusted Publishing workflow.
- Require environment templates only when a target project supports runtime environment configuration; TagIt itself has no required environment settings.
- Use numeric semantic-version tags and cancel superseded CI runs for the same repository and ref.
- Move human-readable behavior guides into `docs/specifications/` and keep `specs/` for indexed structured directives.
- Retain the existing transactional release updates, dry-run boundaries, upstream behavior, and exact-commit release verification.

### Fixed

- Correct runner classification for jobs with generic display names and update preflight/release workflow lookups to `.yaml` paths.
- Keep publication verification tied to numeric version tags and the exact package version.
- Update command entrypoints and target metadata checks for current workflow conventions.

## 2.5.0 — 2026-09-01

### Added

- Add validation for release versions, GitOps pin arguments, image references, and malformed CI/GHCR responses.
- Add explicit `.tagit-exceptions.json` support for genuinely inapplicable standard repository paths.

### Changed

- Improve exact-HEAD CI selection, release verification across GitHub tag reference formats, bounded release-wait polling, read-only GitOps overlay checks, and upstream merge/push error handling.
- Strengthen preflight metadata, package allowlist, repository identity, release notes, and publication workflow checks.

## 2.4.2 — 2026-08-30

### Changed

- Clarify that TagIt's Knit configuration is validation-only and does not deploy applications or modify production GitOps state.
- Document the required GitOps staging pull-request workflow for deployable consumer projects.

## 2.4.1 — 2026-08-30

### Fixed

- Fix waived preflight test reporting and preserve captured output for unsuccessful commands.

## 2.4.0 — 2026-08-30

### Added

- Add safe `--dry-run` handling for push and DevOps release workflows and document owner/DevOps command boundaries.

### Changed

- Move process execution to shell-free cross-platform runners, include release notes in package contents, and expand Windows regression coverage.

## 2.3.0 — 2026-08-26

### Added

- Add a DevOps-only `--ignore-100x4` coverage waiver for preflight and release.

### Changed

- Make release version updates transactional, strengthen preflight validation, clarify owner/DevOps boundaries, and exclude tests and internal deployment guidance from npm packages.
- Add explicit package exports, package file allowlisting, public publish metadata, and cross-platform typechecking.

## 2.2.2 — 2026-08-24

### Added

- Add `tagit push` for pushing existing commits without staging or committing files and bounded workflow discovery after push.
- Expand the owner-to-DevOps release handoff help.

## 2.1.0 — 2026-08-24

### Added

- Split release execution and verification into `release` and `release-wait`.
- Add read-only `tagit notes`, post-release CI/npm/GHCR checks, and bounded polling with actionable timeout guidance.

### Changed

- Aggregate preflight failures, block CI validation for dirty worktrees, and preserve `.notag` template validation while skipping release side effects.

## 1.1.24 — 2026-08-23

### Changed

- Run required CI validation on Ubuntu and Windows for every `main` push and gate npm publication on version tags.

## 1.1.23 — 2026-08-23

### Changed

- Require an explicit `--bump X.Y.Z` version for release and dry-run invocations and remove automatic version increments.

## 1.1.22 — 2026-08-23

### Fixed

- Make Git commit messages safe for Windows shells and add Windows-compatible GitOps path coverage.

## 1.1.21 — 2026-08-21

### Fixed

- Reassert package and lockfile versions after npm dependency updates and prevent releases from committing or tagging when metadata drifts.

## 1.1.19 — 2026-08-13

### Changed

- Use `v<version>` release tags, such as `v1.1.19`.

## 1.1.18 — 2026-08-12

### Added

- Add a non-destructive `--dry-run` release preview, help/version commands, explicit confirmation, and target-version arguments.

## 1.1.17 — 2026-08-06

### Added

- Add `tagit --version` and `tagit -v` without starting a release.

## 1.1.16 — 2026-08-06

### Changed

- Add initial dependency installation and outdated dependency inspection to the release workflow.
