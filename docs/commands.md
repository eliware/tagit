# Command guide

Run commands from the root of the repository that you want to check. Install the required tools first. See the [requirements guide](requirements.md).

## Install tagit

Install the global command:

```text
npm install --global @eliware/tagit
```

Run tagit without a global install:

```text
npx --yes @eliware/tagit --help
```

The package provides `tagit`, `push`, and `upstream` commands. The `push` command runs the same action as `tagit push`.

Run `tagit <command>` for `notes`, `preflight`, `push`, `release`, and `release-wait`. Run `upstream` as its own command.

## Show help or version

Run `tagit --help` or `tagit -h` to show command help. Run `tagit --version` or `tagit -v` to show the installed version. Do not combine help and version options.

Put the command before its options. Use `--dry-run` only with `push`, `release`, or `upstream`. Use the waiver options only with `preflight` or `release`.

## Report changes

```text
tagit notes
```

This read-only command reports commits, changed files, and a short diff between the latest Git tag and the current commit. Read the full diff before you write release notes. The command does not suggest a version or change files. It requires at least one Git tag.

## Check release readiness

```text
tagit preflight [--ignore-100x4] [--ignore-monolith-limits]
```

Run preflight from the target repository root on a clean `main` branch. It runs `npm test` and checks Ubuntu CI for the exact current commit. It also checks each Windows CI job when the workflow defines one. It reports blockers and exits with an error when a required check fails.

The installed Eliware Test package runs the repository convention checks. These checks include package data, required files, workflows, tests, lint, type checks, audit, packaging, and coverage when the active profile requires them. Tagit checks the Git branch and worktree, then verifies GitHub Actions results for the current commit.

Use `--ignore-100x4` only with an approved, documented coverage waiver. Use `--ignore-monolith-limits` only with an approved, documented module-size waiver. These options apply to `preflight` and `release`. They do not skip other required checks.

Preflight does not accept `--dry-run`. It does not change files, commits, tags, or registry data.

## Push existing commits

```text
tagit push [--dry-run]
```

This command pushes commits from the current branch to its configured remote. It does not stage files or create commits. After the push, it looks for CI runs on the current commit and reports links when it finds them. It does not wait for CI to pass.

Use `--dry-run` to skip the push and CI lookup. The command does not require the branch to be `main`.

## Run a release

```text
tagit release --version X.Y.Z [--dry-run] [--ignore-100x4] [--ignore-monolith-limits]
```

Replace `X.Y.Z` with the exact three-part version in `package.json`. The command does not select a version. The version must match the package version.

The command runs preflight on the current commit. It then checks that `package.json` has the requested version. If both checks pass, tagit creates an empty release commit with the version and date. It adds the `vX.Y.Z` tag to that commit.

Tagit pushes `main` and the tag to `origin` in one atomic operation. The operation updates both refs or leaves both unchanged. Tagit checks for the exact-tag CI run at 10-second intervals, for 30 attempts maximum. It reports the CI and job links after GitHub lists the run, then exits. It does not check publication workflows or registry visibility. Run `tagit release-wait` to check CI, applicable publication workflows, and registry visibility.

Use `--dry-run` to check that the requested version matches `package.json`. A release dry run skips preflight, the release commit, the tag, the push, and publication. Use the waiver options only with approved, documented waivers. A repository with a `.notag` file skips release actions.

## Check a release

```text
tagit release-wait
```

This command checks the latest semantic release tag. Do not pass `--version`. Tagit checks CI for the exact commit that the tag identifies. It checks npm or GHCR publication only when both the matching `eliware.apply` profile and its workflow file exist.

For npm, the profile is `npm-published` and the workflow is `.github/workflows/npm.yaml`. For GHCR, the profile is `ghcr-published` and the workflow is `.github/workflows/ghcr.yaml`. Tagit checks a registry only when its profile and workflow file exist.

Tagit polls for CI and applicable publication runs to pass. It then checks registry visibility when publication applies. It reports progress during each check. It exits with an error if required CI, publication, or registry verification fails or remains active after polling stops. When no publication profile and matching workflow apply, release-wait ends after tagged-commit CI passes.

Tagit checks each workflow for 30 attempts maximum, with a 10-second interval. It uses the same limit for registry visibility checks.

## Merge from upstream

```text
upstream [--dry-run] [merge-message...]
```

This command fetches the configured `upstream` remote, merges its default branch, and pushes the merge to the current branch. It uses `upstream/HEAD` when Git defines it. If Git does not define `upstream/HEAD`, it uses `upstream/main`.

Pass a merge message after the options. If you omit the message, tagit uses the current UTC time in `YYYY-MM-DD HH:mm:ss` format. Use a maximum of 500 characters. Do not use control characters.

Use `--dry-run` to show the branch and message without fetch, merge, or push actions. This command requires an `upstream` remote.

## Errors and exit codes

Commands return `0` when they pass. They return `1` for invalid input, failed checks, or operating errors. Tagit redacts recognized credentials and limits long error output.

A bad option, repeated option, unknown argument, or missing required value returns `1`. The `release` command requires `--version X.Y.Z`, which must match `package.json`. The version query accepts no value. `release-wait` always uses the latest semantic release tag.
