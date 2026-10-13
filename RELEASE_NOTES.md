# Release Notes

## 12.0.1 — 2026-10-12

### Fixed

- Apply npm publication checks only to npm-published repositories.
- Check GHCR tag triggers, publication environments, and Docker image push steps for GHCR-published repositories.

## 12.0.0 — 2026-10-12

### Added

- Apply Eliware Test v11 and v12 rules to package data, contributor rules, workflows, docs, and package contents.
- Check exact-commit CI before release actions. Require Ubuntu CI and each Windows job that exists.
- Keep Windows CI optional when the workflow has no Windows job.
- Check release CI and required registry publication for the exact commit and version.
- Add `tagit push` for existing commits and bounded CI lookup after push.
- Add `release` and `release-wait` commands for split owner and DevOps release work.
- Add package exports, package file rules, public publish data, cross-platform checks, and GitOps pin checks.
- Add explicit release waivers and a safe dry-run option.

### Changed

- Use Eliware Test v12 for aggregate validation and the required Jest and Istanbul profile.
- Use `redactText` from `@eliware/common`; remove the direct `@eliware/redact` dependency.
- Report release-wait progress before each CI and registry check. Report one line per npm visibility attempt.
- Keep package publication in the GitHub workflow. Use npm Trusted Publishing and provenance.
- Push only the requested release tag. Do not change package files or create a release commit.
- Use numeric SemVer tags and the required `.yaml` workflow paths.
- Keep GitOps checks read-only. Do not deploy applications or change deployment pins.
- Update CI and Knit workflows to v11 and v12 conventions.

### Fixed

- Return a nonzero exit code when release CI or publication fails.
- Handle Windows npm command shims with shell-free process arguments.
- Keep preflight quiet when the target has no Windows CI job.
- Keep release actions out of template repositories that contain `.notag`.

## 2.5.0 — 2026-09-01

### Added

- Validate release versions, GitOps pin values, image references, and malformed CI or GHCR data.
- Support explicit exceptions for standard repository paths that do not apply.

### Changed

- Improve exact-commit CI selection, release checks, bounded polling, read-only GitOps checks, and upstream error handling.
- Check repository metadata, package files, release notes, and publication workflow rules.

## 2.4.1 — 2026-08-30

### Fixed

- Report waived preflight checks correctly and keep command output after failure.

## 2.4.0 — 2026-08-30

### Added

- Add a safe `--dry-run` option for push and release commands.

### Changed

- Use shell-free process calls and add Windows regression coverage.
- Include release notes in the npm package.

## 2.3.0 — 2026-08-26

### Added

- Add the DevOps-only `--ignore-100x4` coverage waiver.
- Add package exports, package file rules, public publish data, and cross-platform type checks.

### Changed

- Make version updates transactional and strengthen preflight checks.
- Exclude tests and deployment guidance from npm packages.

## 2.2.2 — 2026-08-24

### Added

- Add `tagit push` for existing commits and bounded CI discovery after push.
- Expand the owner-to-DevOps handoff help.

## 2.1.0 — 2026-08-24

### Added

- Split release work into `release` and `release-wait` commands.
- Add read-only notes, post-release CI and registry checks, and bounded polling.

### Changed

- Report all preflight failures and block CI checks for dirty worktrees.
- Keep template validation active while TagIt skips release actions.

## 1.1.24 — 2026-08-23

### Changed

- Require Ubuntu and Windows CI on each `main` push. Gate npm publication on version tags.

## 1.1.23 — 2026-08-23

### Changed

- Require an explicit `--bump X.Y.Z` value for release and dry-run commands.
- Remove automatic version changes.

## 1.1.22 — 2026-08-23

### Fixed

- Make Git commit messages safe for Windows shells and test GitOps paths on Windows.

## 1.1.21 — 2026-08-21

### Fixed

- Restore package versions after dependency updates and block release when metadata differs.

## 1.1.19 — 2026-08-13

### Changed

- Use `v<version>` tags, such as `v1.1.19`.

## 1.1.18 — 2026-08-12

### Added

- Add a read-only release preview, help and version options, confirmation, and target version input.

## 1.1.17 — 2026-08-06

### Added

- Add `tagit --version` and `tagit -v` without a release action.

## 1.1.16 — 2026-08-06

### Changed

- Install dependencies and check for outdated packages in the release workflow.
