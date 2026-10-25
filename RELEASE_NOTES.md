# Release Notes

## 15.0.1 — 2026-10-25

### Fixed

- Describe that `push --dry-run` skips the push and CI lookup.
- Describe that `release --dry-run` checks version data and skips preflight, commit, tag, push, and publication.

## 15.0.0 — 2026-10-25

### Added

- Add release marker commits so CI checks the tagged release commit.
- Push the release commit and version tag to `main` in one atomic operation.
- Report links after CI and applicable publication workflows start.
- Check release CI and publication workflows with `tagit release-wait`.
- Support repositories without a publication workflow. Release-wait ends after tagged-commit CI passes.

### Changed

- Align repository conventions, GitHub Actions, Knit, package metadata, and specifications with Eliware Test v13, v14, and v15.
- Use Eliware Test v15 and `@eliware/common` v15 for package checks and shared utilities.
- Check npm or GHCR publication only when its package profile and matching workflow apply.
- Use `.github/workflows/npm.yaml` for npm publication checks.
- Require CI for the exact tagged commit and classify jobs from workflow runner labels.
- Keep Windows CI optional when the workflow has no Windows job.
- Show one status line for each release-wait check and a concise npm visibility error.
- Remove version suggestions from `tagit notes`.
- Split CLI, release, workflow, registry, and validation logic into focused modules.
- Expand and update end-user documentation and repository guidance.

### Fixed

- Return a nonzero exit code when release CI or publication fails.
- Clarify push and release dry-run behavior in global help.
- Keep release-start links separate from a workflow pass result.
- Retry transient release details errors and reject malformed run status data.
- Reject CI runs from `main` when release-wait checks a version tag.
- Set no runner label for job names with conflicting labels across workflow files.
- Preserve full Git history in CI for tag-based validation.
- Verify Windows npm command selection on every CI platform.
- Extend the local validation timeout to three minutes.

## 12.0.1 — 2026-10-12

### Changed

- Check CI and publication workflows by their declared publication profiles.
- Check numeric release tag triggers and required npm or GHCR workflow steps.
- Select CI results for the exact commit and classify jobs from runner labels.
- Exclude generated Jest results from version notes and limit diff excerpts.
- Split CLI, workflow, registry, preflight, and version checks into focused modules.

### Fixed

- Skip npm job and registry checks when the npm-published profile does not apply.
- Require npm setup, install, and publish commands in the required order.
- Require the exact npm version and a passing publication job for release checks.
- Resolve the exact release tag selected by Git and reject changed tag references.
- Check the package version before a release dry run.
- Recognize the tagit, push, and upstream command entrypoints.
- Support workflow job names that match object prototype properties.

## 12.0.0 — 2026-10-12

### Added

- Apply Eliware Test v11 and v12 rules to package data, contributor rules, workflows, docs, and package contents.
- Check exact-commit CI before release actions. Require Ubuntu CI and each Windows job that exists.
- Keep Windows CI optional when the workflow has no Windows job.
- Check release CI and required registry publication for the exact commit and version.
- Add `tagit push` for existing commits and fixed-time CI lookup after push.
- Add `release` and `release-wait` commands for split owner and DevOps release work.
- Add package exports, package file rules, public publish data, cross-platform checks, and GitOps pin checks.
- Add explicit release waivers and a safe dry-run option.

### Changed

- Use Eliware Test v12 for aggregate validation and the required Jest and Istanbul profile.
- Use `redactText` from `@eliware/common`. Remove the direct `@eliware/redact` dependency.
- Report release-wait progress before each CI and registry check. Report one line for each npm visibility check.
- Keep package publication in the GitHub workflow. Use npm Trusted Publishing and provenance.
- Use numeric SemVer tags and the required `.yaml` workflow paths.
- Keep GitOps checks read-only. Do not deploy applications or change deployment pins.
- Update CI and Knit workflows to v11 and v12 conventions.

### Fixed

- Return a nonzero exit code when release CI or publication fails.
- Support Windows npm command shims with shell-free process arguments.
- Keep preflight quiet when the target has no Windows CI job.
- Keep release actions out of template repositories that contain `.notag`.

## 2.5.0 — 2026-09-01

### Added

- Check release versions, GitOps pin values, image references, and malformed CI or GHCR data.
- Support explicit exceptions for standard repository paths that do not apply.

### Changed

- Strengthen exact-commit CI selection, release checks, fixed polling, read-only GitOps checks, and upstream error handling.
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

- Add `tagit push` for existing commits and fixed-time CI discovery after push.
- Expand the owner-to-DevOps handoff help.

## 2.1.0 — 2026-08-24

### Added

- Split release work into `release` and `release-wait` commands.
- Add read-only notes, post-release CI and registry checks, and fixed polling.

### Changed

- Report all preflight failures and stop CI checks for dirty worktrees.
- Keep template validation active while tagit skips release actions.

## 1.1.24 — 2026-08-23

### Changed

- Require Ubuntu and Windows CI on each `main` push. Gate npm publication on version tags.

## 1.1.23 — 2026-08-23

### Changed

- Require an explicit `--bump X.Y.Z` value for release and dry-run commands.
- Remove automatic version changes.

## 1.1.22 — 2026-08-23

### Fixed

- Make Git commit messages safe for Windows shells and check GitOps paths on Windows.

## 1.1.21 — 2026-08-21

### Fixed

- Restore package versions after dependency updates and stop release when metadata differs.

## 1.1.19 — 2026-08-13

### Changed

- Use `v<version>` tags, such as `v1.1.19`.
